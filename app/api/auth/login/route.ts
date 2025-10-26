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

    // Auto-create profile if it doesn't exist (handles legacy users or profile creation failures)
    if (profileError || !profile) {
      console.log('Profile not found, creating profile for user:', authData.user.id)
      
      // Generate referral code
      const userReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          username: authData.user.email!.split('@')[0],
          balance: 0,
          claimed_balance: 0,
          referral_code: userReferralCode,
          tier: 'bronze',
          total_invested: 0,
          total_earned: 0,
          roi: 0,
          is_admin: false,
          is_suspended: false,
          last_withdrawal_date: 0,
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          time_machines(*),
          referrals:referrals!referrer_id(*)
        `)
        .single()

      if (createError) {
        console.error('Failed to create profile on login:', createError)
        return NextResponse.json(
          { error: 'Failed to initialize user profile' },
          { status: 500 }
        )
      }
      
      profile = newProfile
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
