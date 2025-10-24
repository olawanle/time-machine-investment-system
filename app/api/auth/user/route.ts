import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    // Get user profile with relations
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        time_machines(*),
        referrals:referrals!referrer_id(*)
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
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
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
