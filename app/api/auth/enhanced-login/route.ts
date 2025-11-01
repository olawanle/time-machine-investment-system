import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

/**
 * Enhanced Login Endpoint with Security Features
 * 
 * Features:
 * - Device fingerprinting
 * - Trusted device management
 * - Rate limiting
 * - Security logging
 * - Session management
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password, deviceFingerprint, trustedDevice, twoFactorCode } = await request.json()

    if (!email || !password || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Email, password, and device fingerprint are required' },
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
    const rateLimitKey = `login_attempts_${clientIP}_${email}`
    
    // Check recent failed attempts (in a real app, use Redis or similar)
    const { data: recentAttempts } = await supabase
      .from('security_logs')
      .select('*')
      .eq('event_type', 'failed_login')
      .eq('user_email', email)
      .eq('ip_address', clientIP)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes

    if (recentAttempts && recentAttempts.length >= 5) {
      // Log security event
      await supabase.from('security_logs').insert({
        event_type: 'rate_limit_exceeded',
        user_email: email,
        ip_address: clientIP,
        device_fingerprint: deviceFingerprint,
        details: { attempts: recentAttempts.length },
        created_at: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Log failed attempt
      await supabase.from('security_logs').insert({
        event_type: 'failed_login',
        user_email: email,
        ip_address: clientIP,
        device_fingerprint: deviceFingerprint,
        details: { reason: 'user_not_found' },
        created_at: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is suspended
    if (user.is_suspended) {
      await supabase.from('security_logs').insert({
        event_type: 'suspended_login_attempt',
        user_email: email,
        user_id: user.id,
        ip_address: clientIP,
        device_fingerprint: deviceFingerprint,
        created_at: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'Account suspended. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash || '')
    
    if (!passwordMatch) {
      // Log failed attempt
      await supabase.from('security_logs').insert({
        event_type: 'failed_login',
        user_email: email,
        user_id: user.id,
        ip_address: clientIP,
        device_fingerprint: deviceFingerprint,
        details: { reason: 'invalid_password' },
        created_at: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if device is trusted
    let deviceToken = null
    if (!trustedDevice) {
      // Check if this device fingerprint is known
      const { data: knownDevice } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_fingerprint', deviceFingerprint)
        .eq('is_active', true)
        .single()

      if (!knownDevice) {
        // New device - generate token for future trust
        deviceToken = generateSecureToken()
        
        // Log new device login
        await supabase.from('security_logs').insert({
          event_type: 'new_device_login',
          user_email: email,
          user_id: user.id,
          ip_address: clientIP,
          device_fingerprint: deviceFingerprint,
          details: { device_token: deviceToken },
          created_at: new Date().toISOString()
        })

        // Store trusted device
        await supabase.from('trusted_devices').insert({
          user_id: user.id,
          device_fingerprint: deviceFingerprint,
          device_token: deviceToken,
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || 'unknown',
          is_active: true,
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString()
        })
      } else {
        deviceToken = knownDevice.device_token
        
        // Update last used
        await supabase
          .from('trusted_devices')
          .update({ 
            last_used: new Date().toISOString(),
            ip_address: clientIP
          })
          .eq('id', knownDevice.id)
      }
    }

    // Log successful login
    await supabase.from('security_logs').insert({
      event_type: 'successful_login',
      user_email: email,
      user_id: user.id,
      ip_address: clientIP,
      device_fingerprint: deviceFingerprint,
      details: { 
        trusted_device: trustedDevice,
        device_token: deviceToken 
      },
      created_at: new Date().toISOString()
    })

    // Update user last login
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Return user data (excluding sensitive fields)
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username || user.name,
      name: user.name,
      balance: user.balance,
      claimed_balance: user.claimed_balance,
      total_invested: user.total_invested,
      total_earned: user.total_earned,
      roi: user.roi,
      tier: user.tier,
      is_admin: user.is_admin,
      referralCode: user.referral_code,
      referredBy: user.referred_by,
      referrals: [], // Will be populated separately if needed
      timeMachines: [], // Will be populated separately if needed
      lastWithdrawalDate: user.last_withdrawal_date,
      created_at: user.created_at
    }

    return NextResponse.json({
      success: true,
      user: safeUser,
      deviceToken: deviceToken,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Enhanced login error:', error)
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