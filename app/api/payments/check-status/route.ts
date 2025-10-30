import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Payment Status Check Endpoint
 * 
 * Alternative to webhooks - allows manual checking of payment status
 * This can be used if webhooks are unreliable or not working
 * 
 * Usage:
 * POST /api/payments/check-status
 * {
 *   "payment_id": "cpay_payment_id",
 *   "user_email": "user@example.com",
 *   "expected_amount": 100.00
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { payment_id, user_email, expected_amount } = await request.json()

    if (!payment_id || !user_email) {
      return NextResponse.json({
        error: 'Missing required fields: payment_id and user_email'
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
      .eq('payment_id', payment_id)
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        status: 'already_processed',
        message: 'Payment already processed',
        transaction: existingTransaction,
        processed_at: existingTransaction.processed_at
      })
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

    // Since we can't verify with CPay API directly, we'll allow manual confirmation
    // In a real implementation, you would call CPay's API here to verify the payment
    
    console.log(`🔍 Manual payment check requested:`, {
      payment_id,
      user_email,
      expected_amount,
      user_id: user.id
    })

    // For now, we'll create a manual entry if the admin confirms
    // You can modify this to actually call CPay's API if they provide one
    
    return NextResponse.json({
      status: 'verification_needed',
      message: 'Payment verification required',
      payment_id,
      user: {
        id: user.id,
        email: user.email,
        current_balance: user.balance
      },
      expected_amount,
      instructions: [
        '1. Verify the payment in your CPay dashboard',
        '2. If confirmed, call the confirm endpoint',
        '3. Or use the admin panel to manually add balance'
      ],
      confirm_endpoint: '/api/payments/manual-confirm'
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Payment status check endpoint',
    usage: 'POST with payment_id, user_email, and expected_amount',
    timestamp: new Date().toISOString()
  })
}