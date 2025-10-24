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

    // Get all users with their stats
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        time_machines(count),
        referrals:referrals!referrer_id(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch users error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, action, value } = await request.json()

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

    // Perform admin action
    let updateData: any = {}

    switch (action) {
      case 'suspend':
        updateData = { is_suspended: true }
        break
      case 'activate':
        updateData = { is_suspended: false }
        break
      case 'update_balance':
        updateData = { balance: value }
        break
      case 'update_tier':
        updateData = { tier: value }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('Update user error:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
