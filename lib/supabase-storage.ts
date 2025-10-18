import { createClient } from './supabase/client'
import type { User, TimeMachine, WithdrawalRequest, Suggestion } from './storage'

const supabase = createClient()

export const supabaseStorage = {
  getCurrentUser: async (): Promise<User | null> => {
    if (typeof window === "undefined") return null
    
    const userId = localStorage.getItem("chronostime_current_user")
    if (!userId) return null
    
    const { data, error } = await supabase
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
      })) || [],
      referralCode: data.referral_code,
      referredBy: data.referred_by || undefined,
      referrals: data.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(data.last_withdrawal_date),
      createdAt: new Date(data.created_at).getTime(),
      tier: data.tier || 'bronze',
      totalInvested: Number(data.total_invested),
      roi: Number(data.roi),
    }
  },

  setCurrentUser: (userId: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("chronostime_current_user", userId)
  },

  saveUser: async (user: User) => {
    if (typeof window === "undefined") return
    
    // Update user data
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.username,
        balance: user.balance,
        claimed_balance: user.claimedBalance,
        referral_code: user.referralCode,
        referred_by: user.referredBy,
        last_withdrawal_date: user.lastWithdrawalDate,
        tier: user.tier,
        total_invested: user.totalInvested,
        roi: user.roi,
        updated_at: new Date().toISOString(),
      })
    
    if (userError) {
      console.error('Error saving user:', userError)
      return
    }
    
    // Update time machines
    for (const machine of user.machines) {
      await supabase
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
          updated_at: new Date().toISOString(),
        })
    }
  },

  getUser: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
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
      })) || [],
      referralCode: data.referral_code,
      referredBy: data.referred_by || undefined,
      referrals: data.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(data.last_withdrawal_date),
      createdAt: new Date(data.created_at).getTime(),
      tier: data.tier || 'bronze',
      totalInvested: Number(data.total_invested),
      roi: Number(data.roi),
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
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
      })) || [],
      referralCode: user.referral_code,
      referredBy: user.referred_by || undefined,
      referrals: user.referrals?.map((r: any) => r.referred_user_id) || [],
      lastWithdrawalDate: Number(user.last_withdrawal_date),
      createdAt: new Date(user.created_at).getTime(),
      tier: user.tier || 'bronze',
      totalInvested: Number(user.total_invested),
      roi: Number(user.roi),
    }))
  },

  saveWithdrawalRequest: async (request: WithdrawalRequest) => {
    const { error } = await supabase
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
    const { data, error } = await supabase
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
    
    const { error } = await supabase
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

