import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id } = await request.json()

    if (!session_id || !user_id) {
      return NextResponse.json({
        error: 'Missing session_id or user_id'
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

    // Get the payment transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('stripe_session_id', session_id)
      .eq('user_id', user_id)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json({
        error: 'Payment transaction not found'
      }, { status: 404 })
    }

    if (transaction.status === 'completed') {
      return NextResponse.json({
        error: 'Payment already processed'
      }, { status: 400 })
    }

    // Get current user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance, total_invested')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Update user balance
    const newBalance = (user.balance || 0) + transaction.amount
    const newTotalInvested = (user.total_invested || 0) + transaction.amount

    const { error: updateError } = await supabase
      .from('users')
      .update({
        balance: newBalance,
        total_invested: newTotalInvested,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Error updating user balance:', updateError)
      return NextResponse.json({
        error: 'Failed to update balance'
      }, { status: 500 })
    }

    // Update transaction status
    const { error: transactionUpdateError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id)

    if (transactionUpdateError) {
      console.error('Error updating transaction:', transactionUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully credited $${transaction.amount} to your account`,
      new_balance: newBalance,
      transaction_id: transaction.id
    })

  } catch (error) {
    console.error('Manual update error:', error)
    return NextResponse.json({
      error: 'Failed to process manual update'
    }, { status: 500 })
  }
}