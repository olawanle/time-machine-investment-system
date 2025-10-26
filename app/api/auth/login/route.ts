import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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

    // Use RPC function to fetch profile (bypasses schema cache issues)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user profile using RPC function
    const { data: profileData, error: profileError } = await adminClient.rpc('get_user_profile', {
      p_user_id: authData.user.id
    })

    // If profile doesn't exist, it means the user was created but profile creation failed
    if (profileError || !profileData) {
      console.error('User profile not found for authenticated user:', authData.user.id)
      console.error('Profile error:', profileError)
      
      // Sign out the incomplete user
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { error: 'Account setup incomplete. Please contact support or try signing up again.' },
        { status: 404 }
      )
    }

    const profile = profileData as any

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username || profile.email.split('@')[0],
        balance: Number(profile.balance || 0),
        claimedBalance: Number(profile.claimed_balance || 0),
        machines: Array.isArray(profile.time_machines) ? profile.time_machines.map((m: any) => ({
          id: m.id,
          level: m.level,
          name: m.name,
          description: m.description,
          unlockedAt: Number(m.unlocked_at || 0),
          lastClaimedAt: Number(m.last_claimed_at || 0),
          isActive: m.is_active,
          rewardAmount: Number(m.reward_amount || 0),
          claimIntervalMs: Number(m.claim_interval_ms || 0),
          icon: m.icon,
          investmentAmount: Number(m.investment_amount || 0),
          maxEarnings: Number(m.max_earnings || 0),
          currentEarnings: Number(m.current_earnings || 0),
          roiPercentage: Number(m.roi_percentage || 0),
        })) : [],
        referralCode: profile.referral_code,
        referredBy: profile.referred_by || undefined,
        referrals: Array.isArray(profile.referrals) ? profile.referrals : [],
        lastWithdrawalDate: Number(profile.last_withdrawal_date || 0),
        createdAt: Number(profile.created_at || Date.now()),
        tier: profile.tier || 'bronze',
        totalInvested: Number(profile.total_invested || 0),
        totalEarned: Number(profile.total_earned || 0),
        roi: Number(profile.roi || 0),
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
