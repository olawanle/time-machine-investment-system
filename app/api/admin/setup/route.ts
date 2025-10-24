import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
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

    console.log('Creating admin user in Supabase Auth...')

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@chronostime.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        username: 'Administrator'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      )
    }

    console.log('Admin user created with ID:', authData.user.id)

    // Check if user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@chronostime.com')
      .single()

    if (existingUser) {
      // Update existing user record with new auth ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ id: authData.user.id })
        .eq('email', 'admin@chronostime.com')

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      console.log('Existing user updated')
    } else {
      // Create new user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'admin@chronostime.com',
          username: 'Administrator',
          balance: 0,
          claimed_balance: 0,
          referral_code: 'ADMIN',
          tier: 'platinum',
          total_invested: 0,
          total_earned: 0,
          roi: 0,
          last_withdrawal_date: 0,
          is_admin: true,
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }

      console.log('New user profile created')
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user setup complete. You can now log in with admin@chronostime.com / admin123'
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
