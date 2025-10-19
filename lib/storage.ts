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

import { supabaseStorage } from './supabase-storage'

const STORAGE_KEY = "chronostime_data"
const USERS_KEY = "chronostime_users"
const WITHDRAWALS_KEY = "chronostime_withdrawals"
const REFERRALS_KEY = "chronostime_referrals"
const SUGGESTIONS_KEY = "chronostime_suggestions"

// Use Supabase for storage - export as default storage
export const storage = supabaseStorage

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
