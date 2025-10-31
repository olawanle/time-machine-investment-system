import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Payment Status Polling Endpoint
 * 
 * Since CPay doesn't have reliable webhooks, this endpoint allows
 * the frontend to poll for payment status updates after a user
 * completes payment on the CPay checkout page.
 * 
 * Usage:
 * POST /api/payments/poll-status
 * {
 *   "order_id": "topup_user123_1234567890_100",
 *   "user_id": "user123"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { order_id, user_id } = await request.json()

    if (!order_id || !user_id) {
      return NextResponse.json({
        error: 'Missing required fields: order_id and user_id'
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

    // Check if payment was already processed
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('payment_id', order_id)
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        status: 'completed',
        message: 'Payment already processed',
        transaction: existingTransaction,
        balance_updated: true
      })
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Try to query CPay API for payment status (if API is available)
    const baseUrl = process.env.CPAY_BASE_URL || 'https://api.cpay.com'
    const apiKey = process.env.CPAY_API_KEY

    if (apiKey) {
      try {
        const response = await fetch(`${baseUrl}/v1/invoices/${order_id}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const paymentData = await response.json()
          
          // Check if payment is completed
          if (paymentData.status === 'completed' || paymentData.status === 'paid' || paymentData.status === 'success') {
            // Extract amount from order_id (format: topup_userId_timestamp_amount)
            const orderParts = order_id.split('_')
            const amount = parseFloat(orderParts[orderParts.length - 1])

            if (amount && amount > 0) {
              // Process the payment
              await processPayment(supabase, order_id, user, amount, paymentData)
              
              return NextResponse.json({
                status: 'completed',
                message: 'Payment confirmed and balance updated',
                amount_credited: amount,
                new_balance: (user.balance || 0) + amount
              })
            }
          } else {
            return NextResponse.json({
              status: 'pending',
              message: 'Payment still processing',
              cpay_status: paymentData.status
            })
          }
        }
      } catch (apiError) {
        console.log('CPay API not available, using manual confirmation flow')
      }
    }

    // If CPay API is not available, return pending status
    // The user will need to use manual confirmation or wait for callback
    return NextResponse.json({
      status: 'pending',
      message: 'Payment verification in progress',
      instructions: [
        'Your payment is being processed',
        'Balance will update automatically within 5-10 minutes',
        'If balance doesn\'t update, contact support with order ID: ' + order_id
      ],
      order_id,
      manual_confirm_available: true
    })

  } catch (error) {
    console.error('Payment polling error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function processPayment(supabase: any, orderId: string, user: any, amount: number, paymentData: any) {
  // Record the transaction
  const { error: transactionError } = await supabase
    .from('payment_transactions')
    .insert({
      payment_id: orderId,
      user_id: user.id,
      amount: amount,
      currency: 'USD',
      status: 'completed',
      raw_webhook_data: {
        cpay_data: paymentData,
        processed_via: 'polling',
        timestamp: new Date().toISOString()
      },
      processed_at: new Date().toISOString()
    })

  if (transactionError) {
    throw new Error('Failed to record transaction')
  }

  // Update user balance
  const currentBalance = Number(user.balance ?? 0)
  const currentTotalInvested = Number(user.total_invested ?? 0)
  const newBalance = currentBalance + amount
  const newTotalInvested = currentTotalInvested + amount

  const { error: updateError } = await supabase
    .from('users')
    .update({
      balance: newBalance,
      total_invested: newTotalInvested,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error('Failed to update balance')
  }

  console.log('✅ Payment processed via polling:', {
    order_id: orderId,
    user_id: user.id,
    amount: amount,
    new_balance: newBalance
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Payment status polling endpoint',
    usage: 'POST with order_id and user_id',
    timestamp: new Date().toISOString()
  })
}