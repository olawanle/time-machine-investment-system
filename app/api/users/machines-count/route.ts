import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Get user's machine count for marketplace display
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

    // Get user's active machines count
    const { data: machines, error } = await supabase
      .from('user_machines')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching machine count:', error)
      return NextResponse.json({
        error: 'Failed to fetch machine count'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: machines?.length || 0
    })

  } catch (error) {
    console.error('Machine count API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}