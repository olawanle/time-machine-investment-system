import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSB } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Accept JSON body (no HMAC secret available); we will verify by querying CPAY API
  let payload: any
  try {
    payload = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Normalize expected fields from CPAY webhook
  // Adjust keys per CPAY docs if different
  const statusFromHook: string = payload.status || payload.event || ''
  const orderId: string = payload.orderId || payload.order_id || payload.invoice?.orderId
  const invoiceId: string | undefined = payload.invoiceId || payload.invoice_id || payload.invoice?.id

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  // Query CPAY API to verify invoice status and amount
  const baseUrl = process.env.CPAY_BASE_URL || 'https://api.cpay.com'
  const apiKey = process.env.CPAY_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CPAY API key not configured' }, { status: 500 })

  // Try to fetch invoice by id if provided, else by orderId
  let invoice: any | null = null
  try {
    if (invoiceId) {
      const r = await fetch(`${baseUrl}/v1/invoices/${invoiceId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        cache: 'no-store'
      })
      if (r.ok) invoice = await r.json()
    }
    if (!invoice && orderId) {
      const r = await fetch(`${baseUrl}/v1/invoices?orderId=${encodeURIComponent(orderId)}`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        cache: 'no-store'
      })
      if (r.ok) {
        const list = await r.json()
        invoice = Array.isArray(list) ? list[0] : list?.data?.[0] || null
      }
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to verify with CPAY' }, { status: 502 })
  }

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found at CPAY' }, { status: 404 })
  }

  const status: string = (invoice.status || '').toLowerCase()
  const fiatAmount: number = Number(invoice.amount || invoice.fiat_amount || 0)
  const verifiedOrderId: string = invoice.orderId || orderId

  const isPaid = ['paid', 'confirmed', 'completed', 'success'].includes(status)
  if (!isPaid) {
    return NextResponse.json({ ok: true, message: `Ignored status ${status}` })
  }

  // Parse encoded context: topup_<userId>_<timestamp>_<amount>
  const parts = (verifiedOrderId || '').split('_')
  // Fallback to metadata.userId if provided
  const metaUserId = payload.metadata?.userId || payload.metadata?.user_id || invoice.metadata?.userId || invoice.metadata?.user_id
  const userId = metaUserId || (parts.length >= 4 ? parts[1] : undefined)
  const requestedAmount = parts.length >= 4 ? Number(parts[3]) : fiatAmount

  if (!userId) {
    return NextResponse.json({ error: 'Unable to resolve userId from order' }, { status: 400 })
  }

  // Idempotency: prevent double-credit using a lock row in Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createSB(supabaseUrl, serviceKey)

  // Ensure users table exists and has balance/total_invested columns per schema
  // Credit the lesser of (fiat reported, requested) to be safe if over/under-pay
  const creditAmount = Number.isFinite(fiatAmount) && fiatAmount > 0 ? Math.min(fiatAmount, requestedAmount || fiatAmount) : (requestedAmount || 0)
  if (!creditAmount || creditAmount <= 0) {
    return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
  }

  // Use a Postgres function or a single update with numeric increment
  const { data: userRow, error: fetchErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (fetchErr || !userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const newBalance = Number(userRow.balance || 0) + creditAmount
  const newTotalInvested = Number(userRow.total_invested || 0) + creditAmount

  // Idempotency (optional): skip if topup already processed
  try {
    const { data: existing } = await (supabase as any)
      .from('topups')
      .select('id')
      .eq('order_id', verifiedOrderId)
      .limit(1)
    if (existing && existing.length) {
      return NextResponse.json({ ok: true, message: 'Duplicate webhook ignored' })
    }
  } catch {}

  const { error: updateErr } = await supabase
    .from('users')
    .update({ balance: newBalance, total_invested: newTotalInvested })
    .eq('id', userId)

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to credit user' }, { status: 500 })
  }

  // Optional log insert (ignore errors if table doesn't exist)
  try {
    await (supabase as any).from('topups').insert({
      user_id: userId,
      order_id: verifiedOrderId,
      amount: creditAmount,
      status: 'credited',
      created_at: new Date().toISOString()
    })
  } catch {}

  return NextResponse.json({ ok: true })
}


