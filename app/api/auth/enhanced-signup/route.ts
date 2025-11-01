import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

/**
 * Enhanced Signup Endpoint with Security Features
 * 
 * Features:
 * - Password strength validation
 * - Device fingerprinting
 * - Email validation
 * - Rate limiting
 * - Security logging
 * - Referral processing
 */

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      username, 
      referralCode, 
      deviceFingerprint, 
      passwordStrength 
    } = await request.json()

    if (!email || !password || !username || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Email, password, username, and device fingerprint are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (passwordStrength < 3) {
      return NextResponse.json(
        { error: 'Password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and special characters.' },
        { status: 400 }
      )
    }

    // Validate password requirements server-side
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and numeric characters' },
        { status: 400 }
      )
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

    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Check recent signup attempts from this IP
    const { data: recentSignups } = await supabase
      .from('security_logs')
      .select('*')
      .eq('event_type', 'signup_attempt')
      .eq('ip_address', clientIP)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour

    if (recentSignups && recentSignups.length >= 3) {
      await supabase.from('security_logs').insert({
        event_type: 'signup_rate_limit_exceeded',
        user_email: email,
        ip_address: clientIP,
        device_fingerprint: deviceFingerprint,
        details: { attempts: recentSignups.length },
        created_at: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Log signup attempt
    await supabase.from('security_logs').insert({
      event_type: 'signup_attempt',
      user_email: email,
      ip_address: clientIP,
      device_fingerprint: deviceFingerprint,
      details: { 
        username: username,
        has_referral: !!referralCode,
        password_strength: passwordStrength
      },
      created_at: new Date().toISOString()
    })

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Check if username is taken
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Generate referral code
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create user account
    const newUser = {
      email: email.toLowerCase(),
      username: username,
      name: username,
      password_hash: passwordHash,
      balance: 0,
      claimed_balance: 0,
      total_invested: 0,
      total_earned: 0,
      roi: 0,
      tier: 'bronze',
      is_admin: false,
      referral_code: userReferralCode,
      referred_by: referralCode || null,
      last_withdrawal_date: 0,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single()

    if (createError) {
      console.error('User creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // Process referral if provided
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id, balance, email')
        .eq('referral_code', referralCode)
        .single()

      if (referrer) {
        // Create referral record
        await supabase.from('referrals').insert({
          referrer_id: referrer.id,
          referred_user_id: createdUser.id,
          referral_code: referralCode,
          bonus_earned: 5,
          created_at: new Date().toISOString(),
        })

        // Give referral bonus to referrer ($5)
        await supabase
          .from('users')
          .update({ 
            balance: referrer.balance + 5,
            updated_at: new Date().toISOString()
          })
          .eq('id', referrer.id)

        // Log referral bonus
        await supabase.from('security_logs').insert({
          event_type: 'referral_bonus_awarded',
          user_email: referrer.email,
          user_id: referrer.id,
          ip_address: clientIP,
          details: { 
            referred_user_id: createdUser.id,
            referred_user_email: email,
            bonus_amount: 5
          },
          created_at: new Date().toISOString()
        })
      }
    }

    // Create initial trusted device
    const deviceToken = generateSecureToken()
    await supabase.from('trusted_devices').insert({
      user_id: createdUser.id,
      device_fingerprint: deviceFingerprint,
      device_token: deviceToken,
      ip_address: clientIP,
      user_agent: request.headers.get('user-agent') || 'unknown',
      is_active: true,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString()
    })

    // Log successful signup
    await supabase.from('security_logs').insert({
      event_type: 'successful_signup',
      user_email: email,
      user_id: createdUser.id,
      ip_address: clientIP,
      device_fingerprint: deviceFingerprint,
      details: { 
        username: username,
        referral_code: referralCode,
        device_token: deviceToken
      },
      created_at: new Date().toISOString()
    })

    // Return safe user data
    const safeUser = {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      name: createdUser.name,
      balance: createdUser.balance,
      claimed_balance: createdUser.claimed_balance,
      total_invested: createdUser.total_invested,
      total_earned: createdUser.total_earned,
      roi: createdUser.roi,
      tier: createdUser.tier,
      is_admin: createdUser.is_admin,
      referralCode: createdUser.referral_code,
      referredBy: createdUser.referred_by,
      referrals: [],
      timeMachines: [],
      lastWithdrawalDate: createdUser.last_withdrawal_date,
      created_at: createdUser.created_at
    }

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Enhanced signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}