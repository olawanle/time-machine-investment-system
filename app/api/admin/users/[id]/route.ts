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

// GET specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get user details with all related data
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        *,
        time_machines(
          id, 
          name, 
          level, 
          is_active,
          reward_amount,
          last_claimed_at
        ),
        transactions(
          id,
          type,
          amount,
          description,
          status,
          created_at
        ),
        referrals:referrals!referrer_id(
          id,
          referred_user_id,
          bonus_earned,
          created_at
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get referred by user if exists
    let referredByUser = null
    if (userData.referred_by) {
      const { data: referrerData } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('referral_code', userData.referred_by)
        .single()
      
      referredByUser = referrerData
    }

    // Calculate statistics
    const totalInvestments = userData.time_machines?.length || 0
    const activeInvestments = userData.time_machines?.filter((m: any) => m.is_active).length || 0
    const totalTransactions = userData.transactions?.length || 0
    const totalReferrals = userData.referrals?.length || 0

    return NextResponse.json({
      user: {
        ...userData,
        referredByUser,
        stats: {
          totalInvestments,
          activeInvestments,
          totalTransactions,
          totalReferrals
        }
      }
    })
  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// UPDATE user details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, value } = await request.json()

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

    // Perform action based on type
    let updateData: any = {}
    let auditAction = ''

    switch (action) {
      case 'ban':
        updateData = { is_banned: true }
        auditAction = 'user_banned'
        break
      case 'unban':
        updateData = { is_banned: false }
        auditAction = 'user_unbanned'
        break
      case 'suspend':
        updateData = { is_suspended: true }
        auditAction = 'user_suspended'
        break
      case 'activate':
        updateData = { is_suspended: false }
        auditAction = 'user_activated'
        break
      case 'update_balance':
        if (typeof value !== 'number' || value < 0) {
          return NextResponse.json(
            { error: 'Invalid balance value' },
            { status: 400 }
          )
        }
        updateData = { balance: value }
        auditAction = 'balance_updated'
        
        // Also create a transaction record for balance adjustment
        await supabase
          .from('transactions')
          .insert({
            user_id: params.id,
            type: 'admin_adjustment',
            amount: value,
            description: `Admin balance adjustment by ${user.email}`,
            status: 'completed'
          })
        break
      case 'update_tier':
        if (!['bronze', 'silver', 'gold', 'platinum'].includes(value)) {
          return NextResponse.json(
            { error: 'Invalid tier value' },
            { status: 400 }
          )
        }
        updateData = { tier: value }
        auditAction = 'tier_updated'
        break
      case 'reset_password':
        // This would need to use Supabase Auth Admin API
        const { error: resetError } = await supabase.auth.admin.updateUserById(
          params.id,
          { password: value }
        )
        if (resetError) {
          return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
          )
        }
        auditAction = 'password_reset'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update user data if not password reset
    if (action !== 'reset_password') {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) {
        console.error('Update user error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: auditAction,
        target_type: 'user',
        target_id: params.id,
        details: { action, value, timestamp: new Date().toISOString() }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Don't allow admin to delete themselves
    if (params.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      )
    }

    // Get user data before deletion for audit log
    const { data: userToDelete } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', params.id)
      .single()

    // Delete user (cascades to related tables)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Delete user error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    // Also delete from auth
    await supabase.auth.admin.deleteUser(params.id)

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'user_deleted',
        target_type: 'user',
        target_id: params.id,
        details: {
          deleted_user: userToDelete,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}