import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// Minimal CPAY invoice creation. Adjust fields to your CPAY account if needed.
export async function POST(req: NextRequest) {
  try {
    const { amount, userId, currency = 'USD' } = await req.json()

    if (!amount || !userId) {
      return NextResponse.json({ error: 'amount and userId are required' }, { status: 400 })
    }

    const baseUrl = process.env.CPAY_BASE_URL || 'https://api.cpay.com'
    const apiKey = process.env.CPAY_API_KEY
    const apiSecret = process.env.CPAY_API_SECRET
    const callbackUrl = process.env.CPAY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/payments/cpay-callback`

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'CPAY API credentials not configured' }, { status: 500 })
    }

    // Create a unique order id carrying user context for webhook
    const orderId = `topup_${userId}_${Date.now()}_${amount}`

    // Compose payload per CPAY requirements (may need field name adjustments)
    const payload: Record<string, any> = {
      orderId,
      amount,         // fiat amount
      currency,       // e.g. USD
      callbackUrl: callbackUrl,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?payment=cancelled`,
      metadata: { userId, type: 'balance_topup' }
    }

    // Some gateways require signing requests; keep placeholder HMAC header
    const bodyString = JSON.stringify(payload)
    const signature = crypto.createHmac('sha256', apiSecret).update(bodyString).digest('hex')

    const res = await fetch(`${baseUrl}/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Signature': signature,
      },
      body: bodyString,
      // do not cache
      cache: 'no-store'
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Failed to create invoice', details: text }, { status: 500 })
    }

    const data = await res.json()
    // Normalize expected fields
    const paymentUrl = data.paymentUrl || data.hostedUrl || data.url

    return NextResponse.json({ orderId, paymentUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}


