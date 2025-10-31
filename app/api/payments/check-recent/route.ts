import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Check Recent Payments Endpoint
 * 
 * Checks for recent payments for a user since a specific timestamp
 * Used for polling after direct CPay checkout links
 * 
 * Usage:
 * POST /api/payments/check-recent
 * {
 *   "user_id": "user123",
 *   "user_email": "user@example.com",
 *   "expected_amount": 100.00,
 *   "since_timestamp": 1234567890000
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { user_id, user_email, expected_amount, since_timestamp } = await request.json()

    if (!user_id || !user_email) {
      return NextResponse.json({
        error: 'Missing required fields: user_id and user_email'
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

    // Get the user's current balance first
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

    // Check for recent transactions since the timestamp
    const sinceDate = since_timestamp ? new Date(since_timestamp).toISOString() : new Date(Date.now() - 30 * 60 * 1000).toISOString() // Default to 30 minutes ago

    const { data: recentTransactions, error: transError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', sinceDate)
      .order('created_at', { ascending: false })

    if (transError) {
      console.error('Error checking recent transactions:', transError)
      return NextResponse.json({
        status: 'pending',
        message: 'Unable to check recent transactions'
      })
    }

    // If we have recent transactions, check if any match the expected amount
    if (recentTransactions && recentTransactions.length > 0) {
      let matchingTransaction = null

      if (expected_amount) {
        // Look for transaction with matching amount (within $1 tolerance)
        matchingTransaction = recentTransactions.find(t => 
          Math.abs(t.amount - expected_amount) <= 1
        )
      } else {
        // If no expected amount, just take the most recent
        matchingTransaction = recentTransactions[0]
      }

      if (matchingTransaction) {
        return NextResponse.json({
          status: 'found',
          message: 'Recent payment found',
          transaction: matchingTransaction,
          new_balance: user.balance,
          amount_credited: matchingTransaction.amount
        })
      }
    }

    // No recent transactions found
    return NextResponse.json({
      status: 'pending',
      message: 'No recent payments found',
      user_balance: user.balance,
      expected_amount,
      checked_since: sinceDate,
      recent_transactions_count: recentTransactions?.length || 0
    })

  } catch (error) {
    console.error('Check recent payments error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Check recent payments endpoint',
    usage: 'POST with user_id, user_email, optional expected_amount and since_timestamp',
    timestamp: new Date().toISOString()
  })
}