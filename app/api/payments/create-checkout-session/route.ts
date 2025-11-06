import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { amount, user_id, user_email } = await request.json()

    if (!amount || !user_id || !user_email) {
      return NextResponse.json({
        error: 'Missing required fields: amount, user_id, user_email'
      }, { status: 400 })
    }

    if (amount < 10) {
      return NextResponse.json({
        error: 'Minimum amount is $10'
      }, { status: 400 })
    }

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

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ChronosTime Balance Top-up',
              description: `Add $${amount} to your ChronosTime account`,
              images: ['https://your-domain.com/logo.png'], // Replace with your logo
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
      customer_email: user_email,
      metadata: {
        user_id: user_id,
        user_email: user_email,
        amount: amount.toString(),
        type: 'balance_topup'
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    })

    // Store pending payment in database
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user_id,
        stripe_session_id: session.id,
        amount: amount,
        currency: 'usd',
        status: 'pending',
        payment_method: 'stripe',
        metadata: {
          user_email: user_email,
          checkout_url: session.url
        }
      })

    if (paymentError) {
      console.error('Error storing payment transaction:', paymentError)
      // Continue anyway, we can handle this in webhook
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url
    })

  } catch (error) {
    console.error('Stripe checkout session creation error:', error)
    return NextResponse.json({
      error: 'Failed to create checkout session'
    }, { status: 500 })
  }
}