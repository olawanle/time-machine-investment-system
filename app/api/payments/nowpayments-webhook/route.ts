import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Use service role key for webhook (server-to-server)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Verify NOWPayments webhook signature
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    console.error('No signature provided')
    return false
  }

  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!ipnSecret) {
    console.warn('NOWPAYMENTS_IPN_SECRET not configured - webhook verification disabled')
    return true // Allow in development, but log warning
  }

  const hmac = crypto.createHmac('sha512', ipnSecret)
  hmac.update(payload)
  const calculatedSignature = hmac.digest('hex')

  return calculatedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-nowpayments-sig')

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)

    console.log('NOWPayments webhook received (verified):', payload)

    // Verify payment status
    if (payload.payment_status !== 'finished') {
      return NextResponse.json({ received: true })
    }

    const { order_id, payment_id, actually_paid, price_amount } = payload

    // Find payment request by order_id or payment_id
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('external_id', order_id || payment_id)
      .single()

    if (fetchError || !paymentRequest) {
      console.error('Payment request not found:', order_id || payment_id)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment status
    await supabase
      .from('payment_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', paymentRequest.id)

    // Get user and machine details
    const { data: user } = await supabase
      .from('users')
      .select('balance, total_invested')
      .eq('id', paymentRequest.user_id)
      .single()

    const { data: machine } = await supabase
      .from('time_machines')
      .select('*')
      .eq('id', paymentRequest.machine_id)
      .single()

    if (!user || !machine) {
      console.error('User or machine not found')
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Add time machine to user's portfolio
    await supabase.from('purchased_machines').insert({
      user_id: paymentRequest.user_id,
      machine_id: paymentRequest.machine_id,
      purchase_price: paymentRequest.amount,
      purchased_at: new Date().toISOString(),
    })

    // Update user's total invested
    await supabase
      .from('users')
      .update({
        total_invested: user.total_invested + paymentRequest.amount,
      })
      .eq('id', paymentRequest.user_id)

    // Create transaction record
    await supabase.from('bitcoin_transactions').insert({
      user_id: paymentRequest.user_id,
      amount_usd: paymentRequest.amount,
      amount_btc: actually_paid || price_amount,
      status: 'completed',
      payment_method: 'nowpayments',
      transaction_hash: payment_id,
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('NOWPayments webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
