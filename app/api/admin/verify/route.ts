import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { isAdmin: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin, email, username')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { isAdmin: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // For now, also check if email is the admin email as a fallback
    const isAdmin = userData.is_admin || userData.email === 'admin@chronostime.com'

    // Log admin access for audit
    if (isAdmin) {
      await supabase
        .from('audit_logs')
        .insert({
          admin_id: user.id,
          action: 'admin_access_verified',
          target_type: 'admin_panel',
          details: { email: userData.email, timestamp: new Date().toISOString() }
        })
    }

    return NextResponse.json({
      isAdmin,
      user: isAdmin ? {
        id: user.id,
        email: userData.email,
        username: userData.username
      } : null
    })
  } catch (error) {
    console.error('Admin verify error:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}