import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, referralCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Generate referral code
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username: username || email.split('@')[0],
        balance: 0,
        claimed_balance: 0,
        referral_code: userReferralCode,
        referred_by: referralCode || null,
        tier: 'bronze',
        total_invested: 0,
        total_earned: 0,
        roi: 0,
        last_withdrawal_date: 0,
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // If referred, create referral record and give bonus
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id, balance')
        .eq('referral_code', referralCode)
        .single()

      if (referrer) {
        // Create referral record
        await supabase.from('referrals').insert({
          referrer_id: referrer.id,
          referred_user_id: authData.user.id,
          created_at: new Date().toISOString(),
        })

        // Give referral bonus to referrer
        await supabase
          .from('users')
          .update({ balance: referrer.balance + 10 })
          .eq('id', referrer.id)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: username || email.split('@')[0],
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
