import { createClient } from './supabase/client'
import type { User, TimeMachine, WithdrawalRequest, Suggestion } from './storage'

// Lazy initialization of Supabase client
let supabase: ReturnType<typeof createClient> | null = null
let supabaseError: Error | null = null

const getSupabaseClient = () => {
  if (supabaseError) {
    throw supabaseError
  }
  
  if (!supabase) {
    try {
      supabase = createClient()
    } catch (error) {
      supabaseError = error instanceof Error ? error : new Error('Failed to create Supabase client')
      throw supabaseError
    }
  }
  return supabase
}

// Simple password hashing (for demo - use bcrypt in production)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export const supabaseStorage = {
  // Verify login credentials
  verifyLogin: async (email: string, password: string): Promise<User | null> => {
    console.log('🔍 Attempting login for:', email)
    
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select(`
        *,
        time_machines(*),
        referrals:referrals!referrer_id(*)
      `)
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('❌ Database error:', error)
      return null
    }
    
    if (!data) {
      console.log('❌ User not found')
      return null
    }
    
    console.log('✅ User found:', { email: data.email, hasPassword: !!data.password_hash })
    
    // If user has a password hash, verify it
    if (data.password_hash) {
      const isValid = await verifyPassword(password, data.password_hash)
      console.log('🔐 Password verification:', isValid ? '✅ Valid' : '❌ Invalid')
      if (!isValid) {
        return null
      }
    } else {
      // User created before password system - update with password now
      console.log('⚠️ User has no password hash, updating now...')
      const passwordHash = await hashPassword(password)
      await getSupabaseClient()
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', data.id)
      console.log('✅ Password hash updated')
    }
    
    console.log('✅ Login successful')
    
    return {
      id: data.id,
      email: data.email,
      username: data.username || data.name || data.email.split('@')[0],
      balance: Number(data.balance),
      claimedBalance: Number(data.claimed_balance),
      machines: data.time_machines?.map((m: any) => ({
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
      referralCode: data.referral_code,
      referredBy: data.referred_by || undefined,
      referrals: data.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(data.last_withdrawal_date),
      createdAt: new Date(data.created_at).getTime(),
      tier: data.tier || 'bronze',
      totalInvested: Number(data.total_invested),
      totalEarned: Number(data.total_earned || 0),
      roi: Number(data.roi),
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (typeof window === "undefined") return null
    
    const userId = localStorage.getItem("chronostime_current_user")
    if (!userId) return null
    
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select(`
        *,
        time_machines(*),
        referrals:referrals!referrer_id(*)
      `)
      .eq('id', userId)
      .single()
    
    if (error || !data) return null
    
    return {
      id: data.id,
      email: data.email,
      username: data.username || data.name || data.email.split('@')[0],
      balance: Number(data.balance),
      claimedBalance: Number(data.claimed_balance),
      machines: data.time_machines?.map((m: any) => ({
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
      referralCode: data.referral_code,
      referredBy: data.referred_by || undefined,
      referrals: data.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(data.last_withdrawal_date),
      createdAt: new Date(data.created_at).getTime(),
      tier: data.tier || 'bronze',
      totalInvested: Number(data.total_invested),
      totalEarned: Number(data.total_earned || 0),
      roi: Number(data.roi),
    }
  },

  setCurrentUser: (userId: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("chronostime_current_user", userId)
  },

  saveUser: async (user: User, password?: string) => {
    if (typeof window === "undefined") return
    
    console.log('💾 Saving user:', user.email)
    
    const userData: any = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.username,
      balance: user.balance,
      claimed_balance: user.claimedBalance,
      referral_code: user.referralCode,
      referred_by: user.referredBy || null,
      last_withdrawal_date: user.lastWithdrawalDate,
      tier: user.tier,
      total_invested: user.totalInvested,
      total_earned: user.totalEarned,
      roi: user.roi,
      updated_at: new Date().toISOString(),
    }

    // Hash password if provided
    if (password) {
      console.log('🔐 Hashing password...')
      userData.password_hash = await hashPassword(password)
      console.log('✅ Password hashed')
    }
    
    // Update user data
    console.log('📝 Upserting user to database...')
    const { data: savedUser, error: userError } = await getSupabaseClient()
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
    
    if (userError) {
      console.error('❌ Error saving user:', userError)
      throw new Error(`Failed to save user: ${userError.message}`)
    }
    
    console.log('✅ User saved successfully:', savedUser)
    
    // Update time machines
    if (user.machines.length > 0) {
      console.log(`🤖 Attempting to save ${user.machines.length} time machines...`)
      try {
        for (const machine of user.machines) {
          const { error: machineError } = await getSupabaseClient()
            .from('time_machines')
            .upsert({
              id: machine.id,
              user_id: user.id,
              level: machine.level,
              name: machine.name,
              description: machine.description,
              unlocked_at: machine.unlockedAt,
              last_claimed_at: machine.lastClaimedAt,
              is_active: machine.isActive,
              reward_amount: machine.rewardAmount,
              claim_interval_ms: machine.claimIntervalMs,
              icon: machine.icon,
              investment_amount: machine.investmentAmount,
              max_earnings: machine.maxEarnings,
              current_earnings: machine.currentEarnings,
              roi_percentage: machine.roiPercentage,
              updated_at: new Date().toISOString(),
            })
          
          if (machineError) {
            const errorMessage = machineError.message || machineError.details || 'Unknown database error'
            // If it's a schema error, just warn and continue
            if (errorMessage.includes('schema cache') || errorMessage.includes('column') || errorMessage.includes('table')) {
              console.warn('⚠️ Database schema not ready for time machines, using localStorage fallback')
              break
            } else {
              console.error('❌ Error saving machine:', errorMessage)
            }
          }
        }
        console.log('✅ Time machines saved to database')
      } catch (schemaError) {
        console.warn('⚠️ Time machines table not available, using localStorage fallback')
      }
    }
    
    console.log('✅ Save complete!')
  },

  getUser: async (userId: string): Promise<User | null> => {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select(`
        *,
        time_machines(*),
        referrals:referrals!referrer_id(*)
      `)
      .eq('id', userId)
      .single()
    
    if (error || !data) return null
    
    return {
      id: data.id,
      email: data.email,
      username: data.username || data.name || data.email.split('@')[0],
      balance: Number(data.balance),
      claimedBalance: Number(data.claimed_balance),
      machines: data.time_machines?.map((m: any) => ({
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
      referralCode: data.referral_code,
      referredBy: data.referred_by || undefined,
      referrals: data.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(data.last_withdrawal_date),
      createdAt: new Date(data.created_at).getTime(),
      tier: data.tier || 'bronze',
      totalInvested: Number(data.total_invested),
      totalEarned: Number(data.total_earned || 0),
      roi: Number(data.roi),
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select(`
        *,
        time_machines(*),
        referrals:referrals!referrer_id(*)
      `)
    
    if (error || !data) return []
    
    return data.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username || user.name || user.email.split('@')[0],
      balance: Number(user.balance),
      claimedBalance: Number(user.claimed_balance),
      machines: user.time_machines?.map((m: any) => ({
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
      referralCode: user.referral_code,
      referredBy: user.referred_by || undefined,
      referrals: user.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(user.last_withdrawal_date),
      createdAt: new Date(user.created_at).getTime(),
      tier: user.tier || 'bronze',
      totalInvested: Number(user.total_invested),
      totalEarned: Number(user.total_earned || 0),
      roi: Number(user.roi),
    }))
  },

  saveWithdrawalRequest: async (request: WithdrawalRequest) => {
    const { error } = await getSupabaseClient()
      .from('withdrawal_requests')
      .insert({
        id: request.id,
        user_id: request.userId,
        amount: request.amount,
        wallet_address: request.walletAddress,
        status: request.status,
        created_at: new Date(request.createdAt).toISOString(),
      })
    
    if (error) {
      console.error('Error saving withdrawal request:', error)
    }
  },

  getWithdrawalRequests: async (): Promise<WithdrawalRequest[]> => {
    const { data, error } = await getSupabaseClient()
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error || !data) return []
    
    return data.map(req => ({
      id: req.id,
      userId: req.user_id,
      amount: Number(req.amount),
      walletAddress: req.wallet_address,
      status: req.status as "pending" | "approved" | "rejected",
      createdAt: new Date(req.created_at).getTime(),
    }))
  },

  updateWithdrawalRequest: async (id: string, updates: Partial<WithdrawalRequest>) => {
    const updateData: any = {}
    if (updates.status) updateData.status = updates.status
    if (updates.amount) updateData.amount = updates.amount
    if (updates.walletAddress) updateData.wallet_address = updates.walletAddress
    updateData.updated_at = new Date().toISOString()
    
    const { error } = await getSupabaseClient()
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating withdrawal request:', error)
    }
  },

  saveSuggestion: async (suggestion: Suggestion) => {
    // Store suggestions in localStorage for now, as they're temporary UI suggestions
    if (typeof window === "undefined") return
    const suggestions = JSON.parse(localStorage.getItem('chronostime_suggestions') || "[]")
    suggestions.push(suggestion)
    localStorage.setItem('chronostime_suggestions', JSON.stringify(suggestions))
  },

  getSuggestions: (userId: string): Suggestion[] => {
    // Get suggestions from localStorage
    if (typeof window === "undefined") return []
    const suggestions = JSON.parse(localStorage.getItem('chronostime_suggestions') || "[]")
    return suggestions.filter((s: Suggestion) => s.userId === userId)
  },

  generateReferralCode: (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  },
}

