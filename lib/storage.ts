export interface User {
  id: string
  email: string
  username: string
  balance: number
  claimedBalance: number
  machines: TimeMachine[]
  referralCode: string
  referredBy?: string
  referrals: string[]
  lastWithdrawalDate: number
  createdAt: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  totalInvested: number
  totalEarned: number
  roi: number
  lastSpinDate?: number
  spinStreak?: number
  totalSpins?: number
  achievements?: string[]
  badges?: string[]
  level?: number
  experiencePoints?: number
  autoReinvest?: boolean
  reinvestPercentage?: number
}

export interface TimeMachine {
  id: string
  level: number
  name: string
  description: string
  unlockedAt: number
  lastClaimedAt: number
  isActive: boolean
  rewardAmount: number
  claimIntervalMs: number
  icon: string
  investmentAmount: number
  maxEarnings: number
  currentEarnings: number
  roiPercentage: number
}

export interface WithdrawalRequest {
  id: string
  userId: string
  amount: number
  walletAddress: string
  status: "pending" | "approved" | "rejected"
  createdAt: number
  processedAt?: number
}

export interface Referral {
  id: string
  referrerId: string
  referredUserId: string
  bonusMachineLevel: number
  createdAt: number
}

export interface Suggestion {
  id: string
  userId: string
  type: "investment" | "withdrawal" | "referral"
  title: string
  description: string
  action: string
  priority: "high" | "medium" | "low"
  createdAt: number
}

export interface WithdrawalPeriod {
  id: string
  startDate: number
  endDate: number
  isActive: boolean
  description: string
  createdAt: number
}

export interface AdminSettings {
  id: string
  withdrawalPeriods: WithdrawalPeriod[]
  bitcoinAddress: string
  minInvestment: number
  maxInvestment: number
  defaultRoiPercentage: number
  systemMaintenance: boolean
  lastUpdated: number
}

export interface BitcoinTransaction {
  id: string
  userId: string
  amount: number
  bitcoinAddress: string
  transactionHash?: string
  status: "pending" | "confirmed" | "failed"
  createdAt: number
  confirmedAt?: number
}

import { supabaseStorage } from './supabase-storage'
import { enhancedStorage } from './enhanced-storage'

const STORAGE_KEY = "chronostime_data"
const USERS_KEY = "chronostime_users"
const WITHDRAWALS_KEY = "chronostime_withdrawals"
const REFERRALS_KEY = "chronostime_referrals"
const SUGGESTIONS_KEY = "chronostime_suggestions"

// Enhanced storage wrapper that provides error handling and fallbacks
export const storage = {
  // Enhanced methods with error handling
  async getCurrentUser() {
    try {
      const result = await enhancedStorage.getCurrentUser()
      if (result.success) {
        return result.data || null
      }
      // Fallback to original implementation
      console.warn('Enhanced storage failed, falling back:', result.error)
      return supabaseStorage.getCurrentUser()
    } catch (error) {
      // If both enhanced and supabase fail, try localStorage
      console.warn('All storage methods failed, trying localStorage:', error)
      return localStorageBackup.getCurrentUser()
    }
  },

  async saveUser(user: User, password?: string) {
    try {
      const result = await enhancedStorage.saveUser(user, password)
      if (result.success) {
        return
      }
      // Fallback to original implementation
      console.warn('Enhanced storage failed, falling back:', result.error)
      return supabaseStorage.saveUser(user, password)
    } catch (error) {
      // If both enhanced and supabase fail, save to localStorage
      console.warn('All storage methods failed, saving to localStorage:', error)
      localStorageBackup.saveUser(user)
    }
  },

  async verifyLogin(email: string, password: string) {
    const result = await enhancedStorage.verifyLogin(email, password)
    if (result.success) {
      return result.data || null
    }
    // Fallback to original implementation
    console.warn('Enhanced storage failed, falling back:', result.error)
    return supabaseStorage.verifyLogin(email, password)
  },

  // Delegate other methods to original implementation
  setCurrentUser: enhancedStorage.setCurrentUser.bind(enhancedStorage),
  generateReferralCode: enhancedStorage.generateReferralCode.bind(enhancedStorage),
  getUser: supabaseStorage.getUser,
  getAllUsers: supabaseStorage.getAllUsers,
  saveWithdrawalRequest: supabaseStorage.saveWithdrawalRequest,
  getWithdrawalRequests: supabaseStorage.getWithdrawalRequests,
  updateWithdrawalRequest: supabaseStorage.updateWithdrawalRequest,
  saveSuggestion: supabaseStorage.saveSuggestion,
  getSuggestions: supabaseStorage.getSuggestions,
}

// Keep localStorage version as backup
export const localStorageBackup = {
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userId = localStorage.getItem("chronostime_current_user")
    if (!userId) return null
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}")
    return users[userId] || null
  },

  setCurrentUser: (userId: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("chronostime_current_user", userId)
  },

  saveUser: (user: User) => {
    if (typeof window === "undefined") return
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}")
    users[user.id] = user
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  },

  getUser: (userId: string): User | null => {
    if (typeof window === "undefined") return null
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}")
    return users[userId] || null
  },

  getAllUsers: (): User[] => {
    if (typeof window === "undefined") return []
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}")
    return Object.values(users)
  },

  saveWithdrawalRequest: (request: WithdrawalRequest) => {
    if (typeof window === "undefined") return
    const requests = JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || "[]")
    requests.push(request)
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(requests))
  },

  getWithdrawalRequests: (): WithdrawalRequest[] => {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || "[]")
  },

  updateWithdrawalRequest: (id: string, updates: Partial<WithdrawalRequest>) => {
    if (typeof window === "undefined") return
    const requests = JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || "[]")
    const index = requests.findIndex((r: WithdrawalRequest) => r.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(requests))
    }
  },

  saveSuggestion: (suggestion: Suggestion) => {
    if (typeof window === "undefined") return
    const suggestions = JSON.parse(localStorage.getItem(SUGGESTIONS_KEY) || "[]")
    suggestions.push(suggestion)
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions))
  },

  getSuggestions: (userId: string): Suggestion[] => {
    if (typeof window === "undefined") return []
    const suggestions = JSON.parse(localStorage.getItem(SUGGESTIONS_KEY) || "[]")
    return suggestions.filter((s: Suggestion) => s.userId === userId)
  },

  generateReferralCode: (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  },
}
