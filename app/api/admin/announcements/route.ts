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
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Get authenticated user (optional for public announcements)
    const { data: { user } } = await supabase.auth.getUser()

    // Build query
    let query = supabase
      .from('announcements')
      .select(`
        *,
        creator:users!created_by(id, email, username)
      `)

    // For non-admin users, only show active announcements
    if (!user || !await isAdmin(supabase, user.id)) {
      query = query
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
    } else if (!includeInactive) {
      // Admin but not including inactive
      query = query.eq('is_active', true)
    }

    query = query.order('created_at', { ascending: false })

    const { data: announcements, error } = await query

    if (error) {
      console.error('Fetch announcements error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      )
    }

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error) {
    console.error('Admin announcements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, targetAudience, expiresAt } = await request.json()

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

    // Create announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        message,
        type: type || 'info',
        target_audience: targetAudience || 'all',
        expires_at: expiresAt,
        created_by: user.id,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Create announcement error:', error)
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'announcement_created',
        target_type: 'announcement',
        target_id: announcement.id,
        details: {
          title,
          type,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Admin create announcement error:', error)
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

    // Update announcement
    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Update announcement error:', error)
      return NextResponse.json(
        { error: 'Failed to update announcement' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'announcement_updated',
        target_type: 'announcement',
        target_id: id,
        details: {
          updates: updateData,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update announcement error:', error)
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

    // Get announcement data before deletion
    const { data: announcement } = await supabase
      .from('announcements')
      .select('title')
      .eq('id', id)
      .single()

    // Delete announcement
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete announcement error:', error)
      return NextResponse.json(
        { error: 'Failed to delete announcement' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'announcement_deleted',
        target_type: 'announcement',
        target_id: id,
        details: {
          title: announcement?.title,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete announcement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}