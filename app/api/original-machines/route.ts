import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Original Machines API - Maintains original business logic with database storage
 * 
 * GET /api/original-machines?user_id=xxx - Get user's machines
 * POST /api/original-machines - Purchase a machine with original pricing
 */

// Original machine definitions (exactly as they were)
const ORIGINAL_MACHINES = [
  {
    id: 1,
    name: "Time Machine Level 1",
    cost: 100,
    weeklyReturn: 20,
    returnRate: "20%",
    rarity: "BASIC",
    image: "/time 1.png",
    darkImage: "/time black 1.png"
  },
  {
    id: 2,
    name: "Time Machine Level 2", 
    cost: 250,
    weeklyReturn: 50,
    returnRate: "20%",
    rarity: "IMPROVED",
    image: "/time 2.png",
    darkImage: "/time black 2.png"
  },
  {
    id: 3,
    name: "Time Machine Level 3",
    cost: 500,
    weeklyReturn: 100,
    returnRate: "20%", 
    rarity: "ADVANCED",
    image: "/time 3.png",
    darkImage: "/time black 3.png"
  },
  {
    id: 4,
    name: "Time Machine Level 4",
    cost: 750,
    weeklyReturn: 150,
    returnRate: "20%",
    rarity: "ELITE", 
    image: "/time 4.png",
    darkImage: "/time black 4.png"
  },
  {
    id: 5,
    name: "Time Machine Level 5",
    cost: 1000,
    weeklyReturn: 200,
    returnRate: "20%",
    rarity: "LEGENDARY",
    image: "/time 5.png", 
    darkImage: "/time black 5.png"
  }
]

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

    // Get user's machines from database
    const { data: machines, error: machinesError } = await supabase
      .from('user_machines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('purchased_at', { ascending: false })

    if (machinesError) {
      console.error('Error fetching machines:', machinesError)
      
      // If table doesn't exist, return empty array
      if (machinesError.message?.includes('relation') || machinesError.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          machines: []
        })
      }
      
      return NextResponse.json({
        error: 'Failed to fetch machines'
      }, { status: 500 })
    }

    // Calculate claimable amounts for each machine
    const machinesWithClaimable = await Promise.all(
      (machines || []).map(async (machine) => {
        const { data: claimableAmount } = await supabase
          .rpc('get_machine_claimable_amount', { machine_id: machine.id })

        // Calculate next claim time
        let nextClaimTime = null
        let canClaim = false
        
        if (machine.last_claimed_at) {
          const lastClaim = new Date(machine.last_claimed_at)
          const nextClaim = new Date(lastClaim.getTime() + (24 * 60 * 60 * 1000)) // 24 hours
          nextClaimTime = nextClaim.toISOString()
          canClaim = new Date() >= nextClaim
        } else {
          canClaim = true // New machine can be claimed immediately
        }

        return {
          ...machine,
          claimable_amount: claimableAmount || 0,
          next_claim_time: nextClaimTime,
          can_claim: canClaim,
          daily_return: machine.weekly_return / 7
        }
      })
    )

    return NextResponse.json({
      success: true,
      machines: machinesWithClaimable
    })

  } catch (error) {
    console.error('Original machines API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, machine_level, quantity = 1 } = await request.json()

    if (!user_id || !machine_level) {
      return NextResponse.json({
        error: 'Missing required fields: user_id and machine_level'
      }, { status: 400 })
    }

    // Get machine definition
    const machineTemplate = ORIGINAL_MACHINES.find(m => m.id === machine_level)
    if (!machineTemplate) {
      return NextResponse.json({
        error: 'Invalid machine level'
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

    const totalCost = machineTemplate.cost * quantity
    if (user.balance < totalCost) {
      return NextResponse.json({
        error: 'Insufficient balance'
      }, { status: 400 })
    }

    // Check machine limit (max 5 machines per user)
    const { data: existingMachines } = await supabase
      .from('user_machines')
      .select('id')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if ((existingMachines?.length || 0) + quantity > 5) {
      return NextResponse.json({
        error: 'Maximum 5 machines allowed per user'
      }, { status: 400 })
    }

    // Create machine records
    const newMachines = []
    for (let i = 0; i < quantity; i++) {
      newMachines.push({
        user_id: user_id,
        machine_level: machine_level,
        machine_name: machineTemplate.name,
        purchase_price: machineTemplate.cost,
        weekly_return: machineTemplate.weeklyReturn,
        is_active: true
      })
    }

    const { data: createdMachines, error: machineError } = await supabase
      .from('user_machines')
      .insert(newMachines)
      .select()

    if (machineError) {
      console.error('Error creating machines:', machineError)
      return NextResponse.json({
        error: 'Failed to create machines'
      }, { status: 500 })
    }

    // Update user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({
        balance: user.balance - totalCost,
        total_invested: (user.total_invested || 0) + totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (balanceError) {
      console.error('Error updating balance:', balanceError)
      // Rollback machine creation
      await supabase
        .from('user_machines')
        .delete()
        .in('id', createdMachines.map(m => m.id))
      
      return NextResponse.json({
        error: 'Failed to process payment'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      machines: createdMachines,
      message: `Successfully purchased ${quantity} ${machineTemplate.name}${quantity > 1 ? 's' : ''}!`,
      new_balance: user.balance - totalCost
    })

  } catch (error) {
    console.error('Machine purchase error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}