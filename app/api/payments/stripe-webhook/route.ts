import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({
        error: 'Missing stripe-signature header'
      }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({
        error: 'Invalid signature'
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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Extract metadata
        const userId = session.metadata?.user_id
        const amount = parseFloat(session.metadata?.amount || '0')
        
        if (!userId || !amount) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }

        // Update payment transaction status
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent,
            completed_at: new Date().toISOString(),
            metadata: {
              ...session.metadata,
              payment_status: session.payment_status,
              amount_total: session.amount_total
            }
          })
          .eq('stripe_session_id', session.id)

        if (updateError) {
          console.error('Error updating payment transaction:', updateError)
        }

        // Credit user balance
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('balance, total_invested')
          .eq('id', userId)
          .single()

        if (userError) {
          console.error('Error fetching user:', userError)
          break
        }

        const { error: balanceError } = await supabase
          .from('users')
          .update({
            balance: (user.balance || 0) + amount,
            total_invested: (user.total_invested || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (balanceError) {
          console.error('Error updating user balance:', balanceError)
          break
        }

        console.log(`Successfully credited $${amount} to user ${userId}`)
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object
        
        // Update payment transaction status to expired
        await supabase
          .from('payment_transactions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', expiredSession.id)
        
        console.log(`Checkout session expired: ${expiredSession.id}`)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        
        // Update payment transaction status to failed
        await supabase
          .from('payment_transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            metadata: {
              failure_reason: failedPayment.last_payment_error?.message || 'Payment failed'
            }
          })
          .eq('stripe_payment_intent_id', failedPayment.id)
        
        console.log(`Payment failed: ${failedPayment.id}`)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({
      error: 'Webhook handler failed'
    }, { status: 500 })
  }
}