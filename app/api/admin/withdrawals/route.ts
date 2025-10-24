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

    // Get pending withdrawal requests
    const { data: withdrawals, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        user:users(id, email, username)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch withdrawals error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch withdrawals' },
        { status: 500 }
      )
    }

    return NextResponse.json({ withdrawals: withdrawals || [] })
  } catch (error) {
    console.error('Admin withdrawals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { withdrawalId, action } = await request.json()

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

    // Get withdrawal request
    const { data: withdrawal } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single()

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Update withdrawal status
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', withdrawalId)

      // Deduct from user balance
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', withdrawal.user_id)
        .single()

      if (userData) {
        await supabase
          .from('users')
          .update({ balance: userData.balance - withdrawal.amount })
          .eq('id', withdrawal.user_id)
      }
    } else if (action === 'reject') {
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          completed_at: new Date().toISOString(),
        })
        .eq('id', withdrawalId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin withdrawal action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
