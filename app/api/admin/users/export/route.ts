import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Export Users Data Endpoint
 * Exports user data as CSV for admin use
 */

export async function GET(request: NextRequest) {
  try {
    // Create admin client
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

    // Fetch all users with basic info
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        balance,
        total_invested,
        total_earned,
        tier,
        referral_code,
        referred_by,
        created_at,
        is_suspended
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Email', 
      'Name',
      'Balance',
      'Total Invested',
      'Total Earned',
      'Tier',
      'Referral Code',
      'Referred By',
      'Created At',
      'Status'
    ].join(',')

    const csvRows = users?.map(user => [
      user.id,
      user.email,
      user.name || '',
      user.balance || 0,
      user.total_invested || 0,
      user.total_earned || 0,
      user.tier || 'bronze',
      user.referral_code || '',
      user.referred_by || '',
      new Date(user.created_at).toISOString().split('T')[0],
      user.is_suspended ? 'Suspended' : 'Active'
    ].map(field => `"${field}"`).join(',')) || []

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}