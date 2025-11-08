import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// TEST WEBHOOK - NO SIGNATURE VERIFICATION
// Use this for testing payments without webhook signature verification
// DO NOT USE IN PRODUCTION

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('=== TEST WEBHOOK RECEIVED ===')
    console.log('Event type:', body.type)
    console.log('Event data:', JSON.stringify(body, null, 2))

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

    // Handle checkout.session.completed
    if (body.type === 'checkout.session.completed') {
      const session = body.data.object
      
      console.log('=== PROCESSING PAYMENT ===')
      console.log('Session ID:', session.id)
      console.log('Metadata:', session.metadata)
      console.log('Amount:', session.amount_total)
      
      const userId = session.metadata?.user_id
      const amount = parseFloat(session.metadata?.amount || '0')
      
      if (!userId || !amount) {
        console.error('Missing metadata:', { userId, amount })
        return NextResponse.json({ 
          received: true, 
          error: 'Missing metadata' 
        })
      }

      // Update payment transaction
      const { error: txError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent,
          completed_at: new Date().toISOString()
        })
        .eq('stripe_session_id', session.id)

      if (txError) {
        console.error('Transaction update error:', txError)
      }

      // Get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, balance, total_invested')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('User fetch error:', userError)
        return NextResponse.json({ 
          received: true, 
          error: 'User not found' 
        })
      }

      console.log('Current user balance:', user.balance)
      
      // Update balance
      const newBalance = (user.balance || 0) + amount
      const newTotalInvested = (user.total_invested || 0) + amount
      
      console.log('New balance:', newBalance)

      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance: newBalance,
          total_invested: newTotalInvested,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Balance update error:', updateError)
        return NextResponse.json({ 
          received: true, 
          error: 'Failed to update balance' 
        })
      }

      console.log('✅ Balance updated successfully!')
      
      return NextResponse.json({ 
        received: true, 
        success: true,
        message: `Updated balance from ${user.balance} to ${newBalance}`
      })
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Test webhook error:', error)
    return NextResponse.json({
      error: error.message,
      received: true
    }, { status: 500 })
  }
}
