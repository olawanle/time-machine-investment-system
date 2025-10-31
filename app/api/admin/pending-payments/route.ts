import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Admin endpoint to view pending payments and recent transactions
 * Helps admins identify payments that may need manual confirmation
 */

export async function GET(request: NextRequest) {
  try {
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

    // Get recent payment transactions
    const { data: recentTransactions, error: transError } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        users (
          email,
          balance,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (transError) {
      console.error('Error fetching transactions:', transError)
    }

    // Get users who might have pending payments (recent signups with low balance)
    const { data: potentialPendingUsers, error: userError } = await supabase
      .from('users')
      .select('id, email, balance, total_invested, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .lt('balance', 10) // Low balance might indicate pending payment
      .order('created_at', { ascending: false })

    if (userError) {
      console.error('Error fetching users:', userError)
    }

    return NextResponse.json({
      recent_transactions: recentTransactions || [],
      potential_pending_users: potentialPendingUsers || [],
      summary: {
        total_recent_transactions: recentTransactions?.length || 0,
        total_amount_processed: recentTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        potential_pending_count: potentialPendingUsers?.length || 0
      },
      instructions: [
        'Check recent transactions to see processed payments',
        'Review potential pending users who signed up recently but have low balance',
        'Use /api/payments/manual-confirm to process verified payments',
        'Always verify payments in CPay dashboard before confirming'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin pending payments error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}