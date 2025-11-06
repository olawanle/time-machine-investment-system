import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id } = await request.json()

    if (!session_id || !user_id) {
      return NextResponse.json({
        error: 'Missing session_id or user_id'
      }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    // Verify the session belongs to the user
    if (session.metadata?.user_id !== user_id) {
      return NextResponse.json({
        error: 'Session does not belong to user'
      }, { status: 403 })
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

    // Get payment transaction from database
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single()

    if (transactionError) {
      console.error('Error fetching transaction:', transactionError)
    }

    // Get updated user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance, total_invested')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({
        error: 'Failed to fetch user data'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.status
      },
      transaction: transaction || null,
      user: {
        balance: user.balance,
        total_invested: user.total_invested
      }
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json({
      error: 'Failed to verify session'
    }, { status: 500 })
  }
}