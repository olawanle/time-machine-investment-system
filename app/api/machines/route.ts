import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Time Machines API Endpoint
 * 
 * GET /api/machines?user_id=xxx - Get user's time machines
 * POST /api/machines - Purchase a new time machine
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing user_id parameter'
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

    // Get user's time machines with claimable status
    const { data: machines, error: machinesError } = await supabase
      .from('time_machines')
      .select(`
        *,
        machine_templates (
          name,
          description,
          icon_url,
          tier
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('purchased_at', { ascending: false })

    if (machinesError) {
      console.error('Error fetching machines:', machinesError)
      return NextResponse.json({
        error: 'Failed to fetch machines'
      }, { status: 500 })
    }

    // Calculate claimable rewards for each machine
    const machinesWithClaimable = await Promise.all(
      (machines || []).map(async (machine) => {
        const { data: claimableData } = await supabase
          .rpc('get_claimable_reward', { machine_id: machine.id })

        const claimableAmount = claimableData || 0

        // Calculate next claim time
        let nextClaimTime = null
        if (machine.last_claimed_at) {
          const lastClaim = new Date(machine.last_claimed_at)
          const nextClaim = new Date(lastClaim.getTime() + (machine.claim_interval_hours * 60 * 60 * 1000))
          nextClaimTime = nextClaim.toISOString()
        }

        return {
          ...machine,
          claimable_amount: claimableAmount,
          next_claim_time: nextClaimTime,
          can_claim: claimableAmount > 0
        }
      })
    )

    // Get total statistics
    const totalInvestment = machines?.reduce((sum, m) => sum + parseFloat(m.investment_amount || '0'), 0) || 0
    const totalEarnings = machines?.reduce((sum, m) => sum + parseFloat(m.current_earnings || '0'), 0) || 0
    const totalClaimable = machinesWithClaimable.reduce((sum, m) => sum + parseFloat(m.claimable_amount || '0'), 0)

    return NextResponse.json({
      success: true,
      data: {
        machines: machinesWithClaimable,
        statistics: {
          total_machines: machines?.length || 0,
          total_investment: totalInvestment,
          total_earnings: totalEarnings,
          total_claimable: totalClaimable,
          active_machines: machines?.filter(m => m.is_active).length || 0
        }
      }
    })

  } catch (error) {
    console.error('Machines API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Purchase a new time machine
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id, machine_type, investment_amount } = await request.json()

    if (!user_id || !machine_type || !investment_amount) {
      return NextResponse.json({
        error: 'Missing required fields: user_id, machine_type, investment_amount'
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

    // Get machine template
    const { data: template, error: templateError } = await supabase
      .from('machine_templates')
      .select('*')
      .eq('machine_type', machine_type)
      .eq('is_available', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json({
        error: 'Machine type not found or not available'
      }, { status: 404 })
    }

    // Validate investment amount
    const investmentNum = parseFloat(investment_amount)
    if (investmentNum < template.base_price) {
      return NextResponse.json({
        error: `Minimum investment for this machine is $${template.base_price}`
      }, { status: 400 })
    }

    // Get user and check balance
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

    if (user.balance < investmentNum) {
      return NextResponse.json({
        error: 'Insufficient balance'
      }, { status: 400 })
    }

    // Calculate reward based on investment amount and template ROI
    const rewardAmount = (investmentNum * template.roi_percentage) / 100 / 365 * template.claim_interval_hours / 24

    // Create the machine
    const { data: newMachine, error: machineError } = await supabase
      .from('time_machines')
      .insert({
        user_id: user_id,
        machine_type: machine_type,
        name: template.name,
        description: template.description,
        investment_amount: investmentNum,
        reward_amount: rewardAmount,
        claim_interval_hours: template.claim_interval_hours,
        roi_percentage: template.roi_percentage,
        is_active: true
      })
      .select()
      .single()

    if (machineError) {
      console.error('Error creating machine:', machineError)
      return NextResponse.json({
        error: 'Failed to create machine'
      }, { status: 500 })
    }

    // Deduct balance from user
    const { error: balanceError } = await supabase
      .from('users')
      .update({
        balance: user.balance - investmentNum,
        total_invested: (user.total_invested || 0) + investmentNum,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (balanceError) {
      console.error('Error updating user balance:', balanceError)
      // Rollback machine creation
      await supabase.from('time_machines').delete().eq('id', newMachine.id)
      return NextResponse.json({
        error: 'Failed to process payment'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      machine: newMachine,
      message: `Successfully purchased ${template.name}!`,
      new_balance: user.balance - investmentNum
    })

  } catch (error) {
    console.error('Machine purchase error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}