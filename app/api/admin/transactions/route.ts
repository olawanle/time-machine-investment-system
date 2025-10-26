import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  return data?.is_admin === true
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Pagination and filtering parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        user:users(id, email, username)
      `, { count: 'exact' })

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: transactions, error, count } = await query

    if (error) {
      console.error('Fetch transactions error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Get summary statistics
    const { data: stats } = await supabase
      .from('transactions')
      .select('type, amount')
    
    const summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalEarnings: 0,
      totalReferralBonuses: 0,
      totalAdminAdjustments: 0,
      netFlow: 0
    }

    if (stats) {
      stats.forEach((t: any) => {
        const amount = parseFloat(t.amount)
        switch (t.type) {
          case 'deposit':
            summary.totalDeposits += amount
            break
          case 'withdrawal':
            summary.totalWithdrawals += amount
            break
          case 'earning':
            summary.totalEarnings += amount
            break
          case 'referral_bonus':
            summary.totalReferralBonuses += amount
            break
          case 'admin_adjustment':
            summary.totalAdminAdjustments += amount
            break
        }
      })
      summary.netFlow = summary.totalDeposits - summary.totalWithdrawals
    }

    return NextResponse.json({
      transactions: transactions || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      },
      summary
    })
  } catch (error) {
    console.error('Admin transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, amount, description } = await request.json()

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

    // Create transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: type || 'admin_adjustment',
        amount,
        description: description || `Manual adjustment by admin ${user.email}`,
        status: 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('Create transaction error:', error)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // If it's an adjustment, update user balance
    if (type === 'admin_adjustment' || type === 'deposit') {
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()

      if (userData) {
        await supabase
          .from('users')
          .update({ 
            balance: userData.balance + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      }
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'transaction_created',
        target_type: 'transaction',
        target_id: transaction.id,
        details: {
          userId,
          type,
          amount,
          description,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Admin create transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}