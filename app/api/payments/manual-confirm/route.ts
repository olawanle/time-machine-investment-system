import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Manual Payment Confirmation Endpoint
 * 
 * Allows manual confirmation of payments when webhooks fail
 * Should be used with caution and proper verification
 * 
 * Usage:
 * POST /api/payments/manual-confirm
 * {
 *   "payment_id": "cpay_payment_id",
 *   "user_email": "user@example.com",
 *   "amount": 100.00,
 *   "admin_key": "your_admin_key" // Optional security measure
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { payment_id, user_email, amount, admin_key, notes } = await request.json()

    if (!payment_id || !user_email || !amount) {
      return NextResponse.json({
        error: 'Missing required fields: payment_id, user_email, and amount'
      }, { status: 400 })
    }

    // Optional admin key check (you can set this in environment variables)
    const requiredAdminKey = process.env.MANUAL_PAYMENT_ADMIN_KEY
    if (requiredAdminKey && admin_key !== requiredAdminKey) {
      return NextResponse.json({
        error: 'Invalid admin key'
      }, { status: 401 })
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

    // Check if payment was already processed
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('payment_id', payment_id)
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        error: 'Payment already processed',
        existing_transaction: existingTransaction
      }, { status: 409 })
    }

    // Find the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user_email)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    const usdAmount = parseFloat(amount)
    if (isNaN(usdAmount) || usdAmount <= 0) {
      return NextResponse.json({
        error: 'Invalid amount'
      }, { status: 400 })
    }

    console.log(`💰 Manual payment confirmation:`, {
      payment_id,
      user_email,
      amount: usdAmount,
      user_id: user.id,
      notes: notes || 'Manual confirmation'
    })

    // Record the transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        payment_id: payment_id,
        user_id: user.id,
        amount: usdAmount,
        currency: 'USD',
        status: 'manually_confirmed',
        raw_webhook_data: {
          manual_confirmation: true,
          confirmed_by: 'admin',
          notes: notes || 'Manual payment confirmation',
          timestamp: new Date().toISOString()
        },
        processed_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('❌ Error recording transaction:', transactionError)
      return NextResponse.json({
        error: 'Failed to record transaction'
      }, { status: 500 })
    }

    // Update user balance
    const currentBalance = Number(user.balance ?? 0)
    const currentTotalInvested = Number(user.total_invested ?? 0)
    const newBalance = currentBalance + usdAmount
    const newTotalInvested = currentTotalInvested + usdAmount

    const { error: updateError } = await supabase
      .from('users')
      .update({
        balance: newBalance,
        total_invested: newTotalInvested,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating user balance:', updateError)
      return NextResponse.json({
        error: 'Failed to update balance'
      }, { status: 500 })
    }

    console.log('✅ Manual payment confirmed successfully:', {
      payment_id,
      user_id: user.id,
      email: user.email,
      amount: usdAmount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed manually',
      payment_id,
      user_id: user.id,
      amount_credited: usdAmount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Manual payment confirmation error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Manual payment confirmation endpoint',
    usage: 'POST with payment_id, user_email, amount, and optional admin_key',
    security_note: 'Use with caution - verify payments in CPay dashboard first',
    timestamp: new Date().toISOString()
  })
}