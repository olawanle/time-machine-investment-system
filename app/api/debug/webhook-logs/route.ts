import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { data: transactions, error: transactionsError } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    // Get recent users for comparison
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, username, balance, total_invested, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    return NextResponse.json({
      success: true,
      recent_transactions: transactions || [],
      recent_users: users || [],
      debug_info: {
        transaction_count: transactions?.length || 0,
        user_count: users?.length || 0,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Debug logs error:', error)
    return NextResponse.json({
      error: 'Failed to fetch debug logs'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, session_id } = await request.json()

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

    // Debug specific user and transaction
    const results: any = {}

    if (user_id) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single()

      results.user = { data: user, error: userError?.message }
    }

    if (session_id) {
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('stripe_session_id', session_id)
        .single()

      results.transaction = { data: transaction, error: transactionError?.message }
    }

    return NextResponse.json({
      success: true,
      debug_results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug POST error:', error)
    return NextResponse.json({
      error: 'Failed to debug specific records'
    }, { status: 500 })
  }
}