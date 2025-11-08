import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        error: 'user_id parameter is required'
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

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, balance, total_invested, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json({
        error: 'User not found',
        details: userError
      }, { status: 404 })
    }

    // Get recent payment transactions
    const { data: transactions, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      user,
      transactions: transactions || [],
      localStorage_key: 'chronostime_users',
      note: 'Check if balance in database matches what you see in the UI'
    })

  } catch (error: any) {
    console.error('Error checking balance:', error)
    return NextResponse.json({
      error: error.message || 'Failed to check balance'
    }, { status: 500 })
  }
}
