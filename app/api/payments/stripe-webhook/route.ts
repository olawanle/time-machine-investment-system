import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
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
      const stripe = getStripe()
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
        
        console.log('=== CHECKOUT SESSION COMPLETED ===')
        console.log('Session ID:', session.id)
        console.log('Session metadata:', session.metadata)
        console.log('Amount total:', session.amount_total)
        console.log('Payment status:', session.payment_status)
        
        // Extract metadata
        const userId = session.metadata?.user_id
        const amount = parseFloat(session.metadata?.amount || '0')
        
        console.log('Extracted userId:', userId)
        console.log('Extracted amount:', amount)
        
        if (!userId || !amount) {
          console.error('Missing metadata in checkout session:', session.id, { userId, amount })
          break
        }

        // Update payment transaction status
        console.log('Updating payment transaction...')
        const { data: updatedTransaction, error: updateError } = await supabase
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
          .select()

        if (updateError) {
          console.error('Error updating payment transaction:', updateError)
        } else {
          console.log('Payment transaction updated:', updatedTransaction)
        }

        // Credit user balance
        console.log('Fetching user for balance update...')
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, balance, total_invested, email, username')
          .eq('id', userId)
          .single()

        if (userError) {
          console.error('Error fetching user:', userError)
          console.log('User ID that failed:', userId)
          
          // Try to find user by different methods
          const { data: allUsers } = await supabase
            .from('users')
            .select('id, email, username')
            .limit(5)
          console.log('Sample users in database:', allUsers)
          break
        }

        console.log('Found user:', user)
        
        const newBalance = (user.balance || 0) + amount
        const newTotalInvested = (user.total_invested || 0) + amount
        
        console.log('Updating user balance from', user.balance, 'to', newBalance)
        
        const { data: updatedUser, error: balanceError } = await supabase
          .from('users')
          .update({
            balance: newBalance,
            total_invested: newTotalInvested,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()

        if (balanceError) {
          console.error('Error updating user balance:', balanceError)
          break
        }

        console.log('User balance updated successfully:', updatedUser)
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