import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Original Machine Claim API - Maintains 24-hour claim intervals
 */

export async function POST(request: NextRequest) {
  try {
    const { user_id, machine_id } = await request.json()

    if (!user_id || !machine_id) {
      return NextResponse.json({
        error: 'Missing required fields: user_id and machine_id'
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

    // Use the database function to claim rewards
    const { data: claimResult, error: claimError } = await supabase
      .rpc('claim_machine_rewards', {
        machine_id: machine_id,
        claiming_user_id: user_id
      })

    if (claimError) {
      console.error('Error claiming rewards:', claimError)
      return NextResponse.json({
        error: 'Failed to claim rewards'
      }, { status: 500 })
    }

    const result = claimResult[0]

    if (!result.success) {
      return NextResponse.json({
        error: result.message
      }, { status: 400 })
    }

    // Get updated user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance, total_earned')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching updated user:', userError)
    }

    return NextResponse.json({
      success: true,
      reward_amount: result.amount,
      message: result.message,
      new_balance: user?.balance || 0,
      total_earned: user?.total_earned || 0
    })

  } catch (error) {
    console.error('Machine claim error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}