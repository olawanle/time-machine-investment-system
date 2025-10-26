import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      )
    }

    // Get user profile (or create if missing)
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        time_machines(*),
        referrals:referrals!referrer_id(*)
      `)
      .eq('id', authData.user.id)
      .single()

    // If profile doesn't exist, it means the user was created but profile creation failed
    // This shouldn't happen in normal flow, return error
    if (profileError || !profile) {
      console.error('User profile not found for authenticated user:', authData.user.id)
      console.error('Profile error:', profileError)
      
      // Sign out the incomplete user
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { error: 'Account setup incomplete. Please contact support or try signing up again.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username || profile.email.split('@')[0],
        balance: Number(profile.balance),
        claimedBalance: Number(profile.claimed_balance),
        machines: profile.time_machines?.map((m: any) => ({
          id: m.id,
          level: m.level,
          name: m.name,
          description: m.description,
          unlockedAt: Number(m.unlocked_at),
          lastClaimedAt: Number(m.last_claimed_at),
          isActive: m.is_active,
          rewardAmount: Number(m.reward_amount),
          claimIntervalMs: Number(m.claim_interval_ms),
          icon: m.icon,
          investmentAmount: Number(m.investment_amount || 0),
          maxEarnings: Number(m.max_earnings || 0),
          currentEarnings: Number(m.current_earnings || 0),
          roiPercentage: Number(m.roi_percentage || 0),
        })) || [],
        referralCode: profile.referral_code,
        referredBy: profile.referred_by || undefined,
        referrals: profile.referrals?.map((r: any) => r.referred_user_id) || [],
        lastWithdrawalDate: Number(profile.last_withdrawal_date),
        createdAt: new Date(profile.created_at).getTime(),
        tier: profile.tier || 'bronze',
        totalInvested: Number(profile.total_invested),
        totalEarned: Number(profile.total_earned || 0),
        roi: Number(profile.roi),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
