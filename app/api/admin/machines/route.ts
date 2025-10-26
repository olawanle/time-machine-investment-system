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

    // Get all machine templates
    const { data: machines, error } = await supabase
      .from('machine_templates')
      .select('*')
      .order('level_requirement', { ascending: true })

    if (error) {
      console.error('Fetch machines error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch machines' },
        { status: 500 }
      )
    }

    // Get user machine statistics
    const { data: userMachines } = await supabase
      .from('time_machines')
      .select('level, is_active')

    const stats = {
      totalMachines: machines?.length || 0,
      activeMachines: machines?.filter((m: any) => m.is_active).length || 0,
      totalUserMachines: userMachines?.length || 0,
      activeUserMachines: userMachines?.filter((m: any) => m.is_active).length || 0
    }

    return NextResponse.json({ machines: machines || [], stats })
  } catch (error) {
    console.error('Admin machines error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const machineData = await request.json()

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

    // Create new machine template
    const { data: machine, error } = await supabase
      .from('machine_templates')
      .insert({
        name: machineData.name,
        description: machineData.description,
        price: machineData.price,
        daily_return: machineData.dailyReturn,
        level_requirement: machineData.levelRequirement || 1,
        image_url: machineData.imageUrl || `/time ${Math.floor(Math.random() * 5) + 1}.png`,
        is_active: machineData.isActive !== false,
        max_purchases: machineData.maxPurchases,
        duration_days: machineData.durationDays || 30
      })
      .select()
      .single()

    if (error) {
      console.error('Create machine error:', error)
      return NextResponse.json(
        { error: 'Failed to create machine' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'machine_created',
        target_type: 'machine_template',
        target_id: machine.id,
        details: {
          machineName: machineData.name,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ machine })
  } catch (error) {
    console.error('Admin create machine error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()

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

    // Update machine template
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (updateData.name !== undefined) updates.name = updateData.name
    if (updateData.description !== undefined) updates.description = updateData.description
    if (updateData.price !== undefined) updates.price = updateData.price
    if (updateData.dailyReturn !== undefined) updates.daily_return = updateData.dailyReturn
    if (updateData.levelRequirement !== undefined) updates.level_requirement = updateData.levelRequirement
    if (updateData.imageUrl !== undefined) updates.image_url = updateData.imageUrl
    if (updateData.isActive !== undefined) updates.is_active = updateData.isActive
    if (updateData.maxPurchases !== undefined) updates.max_purchases = updateData.maxPurchases
    if (updateData.durationDays !== undefined) updates.duration_days = updateData.durationDays

    const { error } = await supabase
      .from('machine_templates')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Update machine error:', error)
      return NextResponse.json(
        { error: 'Failed to update machine' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'machine_updated',
        target_type: 'machine_template',
        target_id: id,
        details: {
          updates: updateData,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update machine error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

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

    // Get machine data before deletion
    const { data: machine } = await supabase
      .from('machine_templates')
      .select('name')
      .eq('id', id)
      .single()

    // Delete machine template
    const { error } = await supabase
      .from('machine_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete machine error:', error)
      return NextResponse.json(
        { error: 'Failed to delete machine' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'machine_deleted',
        target_type: 'machine_template',
        target_id: id,
        details: {
          machineName: machine?.name,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete machine error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}