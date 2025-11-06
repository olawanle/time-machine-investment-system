import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({
        error: 'Missing user_id'
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

    // Try to find user by exact ID
    const { data: exactUser, error: exactError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    // Try to find user by email (in case ID is actually email)
    const { data: emailUser, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user_id)
      .single()

    // Get all users to see the format
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, username, balance')
      .limit(5)

    return NextResponse.json({
      success: true,
      search_id: user_id,
      exact_match: {
        found: !exactError,
        data: exactUser,
        error: exactError?.message
      },
      email_match: {
        found: !emailError,
        data: emailUser,
        error: emailError?.message
      },
      sample_users: allUsers || [],
      debug_info: {
        user_id_type: typeof user_id,
        user_id_length: user_id.length,
        is_uuid_format: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id)
      }
    })

  } catch (error) {
    console.error('User check error:', error)
    return NextResponse.json({
      error: 'Failed to check user'
    }, { status: 500 })
  }
}