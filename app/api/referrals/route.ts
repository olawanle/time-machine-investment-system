import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Referrals API Endpoint
 * 
 * GET /api/referrals?user_id=xxx - Get referral data for a user
 * - Returns referrals made by the user
 * - Returns referral bonuses earned
 * - Returns referral statistics
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

    // Get referrals made by this user (people they referred)
    const { data: referralsMade, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_user:users!referrals_referred_user_id_fkey (
          id,
          email,
          username,
          name,
          created_at
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      return NextResponse.json({
        error: 'Failed to fetch referrals'
      }, { status: 500 })
    }

    // Get referral bonuses earned (from payment_transactions or a separate table)
    const { data: bonusTransactions, error: bonusError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', 'USD')
      .ilike('raw_webhook_data->notes', '%referral%')
      .order('created_at', { ascending: false })

    if (bonusError) {
      console.error('Error fetching bonus transactions:', bonusError)
    }

    // Calculate statistics
    const totalReferrals = referralsMade?.length || 0
    const totalBonusEarned = referralsMade?.reduce((sum, ref) => sum + (ref.bonus_earned || 0), 0) || 0
    const activeReferrals = referralsMade?.filter(ref => ref.referred_user?.created_at) || []

    // Get user's referral code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referral_code, referred_by')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
    }

    return NextResponse.json({
      success: true,
      data: {
        referrals_made: referralsMade || [],
        bonus_transactions: bonusTransactions || [],
        statistics: {
          total_referrals: totalReferrals,
          active_referrals: activeReferrals.length,
          total_bonus_earned: totalBonusEarned,
          pending_referrals: Math.max(0, totalReferrals - activeReferrals.length)
        },
        user_info: {
          referral_code: user?.referral_code || '',
          referred_by: user?.referred_by || null
        }
      }
    })

  } catch (error) {
    console.error('Referrals API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/referrals - Apply a referral code (for existing users)
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id, referral_code } = await request.json()

    if (!user_id || !referral_code) {
      return NextResponse.json({
        error: 'Missing user_id or referral_code'
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

    // Check if user already has a referrer
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('referred_by, email')
      .eq('id', user_id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    if (currentUser.referred_by) {
      return NextResponse.json({
        error: 'User already has a referrer'
      }, { status: 400 })
    }

    // Find the referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, balance, referral_code')
      .eq('referral_code', referral_code)
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json({
        error: 'Invalid referral code'
      }, { status: 400 })
    }

    if (referrer.id === user_id) {
      return NextResponse.json({
        error: 'Cannot refer yourself'
      }, { status: 400 })
    }

    // Update user with referrer
    const { error: updateError } = await supabase
      .from('users')
      .update({ referred_by: referral_code })
      .eq('id', user_id)

    if (updateError) {
      console.error('Error updating user referrer:', updateError)
      return NextResponse.json({
        error: 'Failed to apply referral code'
      }, { status: 500 })
    }

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_user_id: user_id,
        referral_code: referral_code,
        bonus_earned: 5,
        created_at: new Date().toISOString()
      })

    if (referralError) {
      console.error('Error creating referral record:', referralError)
    }

    // Give referral bonus to referrer ($5)
    const { error: bonusError } = await supabase
      .from('users')
      .update({ balance: referrer.balance + 5 })
      .eq('id', referrer.id)

    if (bonusError) {
      console.error('Error giving referral bonus:', bonusError)
    }

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
      bonus_earned: 5
    })

  } catch (error) {
    console.error('Apply referral code error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}