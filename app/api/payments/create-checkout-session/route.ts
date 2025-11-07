import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, user_id, user_email } = body

    if (!amount || amount < 10) {
      return NextResponse.json({
        error: 'Invalid amount. Minimum is $10'
      }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 })
    }

    const stripe = getStripe()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ChronosTime Balance Top-Up',
              description: `Add $${amount} to your account balance`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet`,
      customer_email: user_email,
      metadata: {
        user_id: user_id,
        amount: amount.toString(),
        type: 'balance_topup'
      }
    })

    // Create payment transaction record
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user_id,
        amount: amount,
        currency: 'USD',
        status: 'pending',
        stripe_session_id: session.id,
        metadata: {
          user_email,
          type: 'balance_topup'
        }
      })

    if (dbError) {
      console.error('Error creating payment transaction:', dbError)
      // Continue anyway - webhook will handle it
    }

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id
    })

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({
      error: error.message || 'Failed to create checkout session'
    }, { status: 500 })
  }
}
