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
    const limit = parseInt(searchParams.get('limit') || '100')
    const action = searchParams.get('action')
    const targetType = searchParams.get('targetType')
    const adminId = searchParams.get('adminId')
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
      .from('audit_logs')
      .select(`
        *,
        admin:users!admin_id(id, email, username)
      `, { count: 'exact' })

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }
    if (targetType) {
      query = query.eq('target_type', targetType)
    }
    if (adminId) {
      query = query.eq('admin_id', adminId)
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

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Fetch audit logs error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      )
    }

    // Get action statistics
    const { data: actionStats } = await supabase
      .from('audit_logs')
      .select('action')

    const actionCounts: Record<string, number> = {}
    if (actionStats) {
      actionStats.forEach((log: any) => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
      })
    }

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        totalLogs: count || 0,
        actionCounts
      }
    })
  } catch (error) {
    console.error('Admin audit logs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, targetType, targetId, details } = await request.json()

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

    // Get IP and user agent from request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create audit log
    const { data: log, error } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details: {
          ...details,
          timestamp: new Date().toISOString()
        },
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single()

    if (error) {
      console.error('Create audit log error:', error)
      return NextResponse.json(
        { error: 'Failed to create audit log' },
        { status: 500 }
      )
    }

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Admin create audit log error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export audit logs to CSV
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
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

    // Build query for export
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin:users!admin_id(email, username)
      `)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    query = query.order('created_at', { ascending: false })

    const { data: logs, error } = await query

    if (error) {
      console.error('Export audit logs error:', error)
      return NextResponse.json(
        { error: 'Failed to export audit logs' },
        { status: 500 }
      )
    }

    // Convert to CSV format
    const headers = ['Date', 'Admin Email', 'Action', 'Target Type', 'Target ID', 'Details', 'IP Address']
    const rows = logs?.map((log: any) => [
      new Date(log.created_at).toISOString(),
      log.admin?.email || 'Unknown',
      log.action,
      log.target_type,
      log.target_id || 'N/A',
      JSON.stringify(log.details || {}),
      log.ip_address || 'Unknown'
    ])

    const csvContent = [
      headers.join(','),
      ...(rows?.map(row => row.map(cell => `"${cell}"`).join(',')) || [])
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Admin export audit logs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}