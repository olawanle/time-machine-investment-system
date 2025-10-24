import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  return data?.email === 'admin@chronostime.com'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!await isAdmin(supabase, user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get platform statistics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { data: userStats } = await supabase
      .from('users')
      .select('balance, total_invested, total_earned')

    const totalBalance = userStats?.reduce((sum, u) => sum + Number(u.balance), 0) || 0
    const totalInvested = userStats?.reduce((sum, u) => sum + Number(u.total_invested), 0) || 0
    const totalEarned = userStats?.reduce((sum, u) => sum + Number(u.total_earned), 0) || 0

    const { count: activeMachines } = await supabase
      .from('time_machines')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: totalPayments } = await supabase
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    const { data: recentPayments } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalBalance,
        totalInvested,
        totalEarned,
        activeMachines: activeMachines || 0,
        totalPayments: totalPayments || 0,
      },
      recentPayments: recentPayments || [],
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
