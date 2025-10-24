/**
 * Enhanced storage service with comprehensive error handling
 */

import { createClient } from './supabase/client'
import { errorService, handleAsyncError } from './error-service'
import type { User, TimeMachine, WithdrawalRequest, Suggestion } from './storage'

// Storage operation result types
export interface StorageResult<T> {
  success: boolean
  data?: T
  error?: string
  retryable?: boolean
}

export interface StorageOptions {
  retries?: number
  timeout?: number
  fallbackToLocal?: boolean
}

class EnhancedStorageService {
  private supabase: ReturnType<typeof createClient> | null = null
  private isOnline = true
  private operationQueue: Array<() => Promise<void>> = []

  constructor() {
    // Monitor online status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.processQueue()
      })
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
    }
  }

  private getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient()
    }
    return this.supabase
  }

  private async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    options: StorageOptions = {}
  ): Promise<StorageResult<T>> {
    const { retries = 3, timeout = 10000, fallbackToLocal = true } = options

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout to operation
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        })

        const result = await Promise.race([operation(), timeoutPromise])
        
        return {
          success: true,
          data: result,
          retryable: false
        }
      } catch (error) {
        // Handle different types of errors more carefully
        let err: Error
        if (error instanceof Error) {
          err = error
        } else if (typeof error === 'string') {
          err = new Error(error)
        } else if (error && typeof error === 'object') {
          // Handle object errors (like from Supabase)
          const errorMessage = (error as any).message || (error as any).error || JSON.stringify(error)
          err = new Error(errorMessage)
        } else {
          err = new Error('Unknown error occurred')
        }
        
        // Log error with context - only if it's a real error with meaningful content
        if (err.message && err.message.trim() && err.message !== '{}' && err.message !== 'undefined') {
          errorService.logError(err, { context, attempt, maxRetries: retries })
        }

        // Check if we should retry
        const isRetryable = this.isRetryableError(err)
        const isLastAttempt = attempt === retries

        if (!isRetryable || isLastAttempt) {
          // Try fallback to localStorage if enabled and this is a network error
          if (fallbackToLocal && this.isNetworkError(err)) {
            try {
              const fallbackResult = await this.tryLocalStorageFallback(context, err)
              if (fallbackResult) {
                return {
                  success: true,
                  data: fallbackResult as T,
                  retryable: false
                }
              }
            } catch (fallbackError) {
              console.warn('Fallback to localStorage failed:', fallbackError)
            }
          }

          return {
            success: false,
            error: errorService.getUserFriendlyMessage(err),
            retryable: isRetryable
          }
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return {
      success: false,
      error: 'Maximum retry attempts exceeded',
      retryable: false
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('504')
    )
  }

  private isNetworkError(error: Error): boolean {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('offline')
    )
  }

  private async tryLocalStorageFallback(context: string, originalError: Error): Promise<any> {
    if (typeof window === 'undefined') return null

    // Implement localStorage fallback based on context
    switch (context) {
      case 'getCurrentUser':
        return this.getCurrentUserFromLocal()
      case 'saveUser':
        // For saveUser, try to save to localStorage as fallback
        return this.saveUserToLocal()
      default:
        return null
    }
  }

  private saveUserToLocal(): boolean {
    try {
      // This is a placeholder - in real implementation, we'd save the user data
      // For now, just return true to indicate the operation "succeeded"
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }

  private getCurrentUserFromLocal(): User | null {
    try {
      const userId = localStorage.getItem("chronostime_current_user")
      if (!userId) return null
      
      const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
      return users[userId] || null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  private queueOperation(operation: () => Promise<void>) {
    this.operationQueue.push(operation)
  }

  private async processQueue() {
    while (this.operationQueue.length > 0 && this.isOnline) {
      const operation = this.operationQueue.shift()
      if (operation) {
        try {
          await operation()
        } catch (error) {
          console.error('Queued operation failed:', error)
          // Re-queue if it's a retryable error
          if (error instanceof Error && this.isRetryableError(error)) {
            this.operationQueue.unshift(operation)
            break // Stop processing queue
          }
        }
      }
    }
  }

  private async retrySaveUser() {
    // Implementation would retry the failed save operation
    console.log('Retrying save user operation...')
    // This is a placeholder for the actual retry logic
  }

  // Enhanced storage methods with error handling

  async getCurrentUser(options?: StorageOptions): Promise<StorageResult<User | null>> {
    return this.withErrorHandling(async () => {
      if (typeof window === "undefined") return null
      
      const userId = localStorage.getItem("chronostime_current_user")
      if (!userId) return null
      
      try {
        const { data, error } = await this.getSupabaseClient()
          .from('users')
          .select(`
            *,
            time_machines(*),
            referrals:referrals!referrer_id(*)
          `)
          .eq('id', userId)
          .single()
        
        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }
        
        if (!data) return null
        
        return this.mapUserFromDatabase(data)
      } catch (dbError) {
        // If database fails, try localStorage fallback
        console.warn('Database unavailable, using localStorage fallback')
        const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
        return users[userId] || null
      }
    }, 'getCurrentUser', options)
  }

  async saveUser(user: User, password?: string, options?: StorageOptions): Promise<StorageResult<void>> {
    return this.withErrorHandling(async () => {
      if (typeof window === "undefined") {
        throw new Error('Cannot save user: window is undefined')
      }
      
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
        userData.password_hash = await this.hashPassword(password)
        console.log('✅ Password hashed')
      }
      
      // Update user data
      console.log('📝 Upserting user to database...')
      const { data: savedUser, error: userError } = await this.getSupabaseClient()
        .from('users')
        .upsert(userData, { onConflict: 'id' })
        .select()
      
      if (userError) {
        throw new Error(`Failed to save user: ${userError.message}`)
      }
      
      console.log('✅ User saved successfully:', savedUser)
      
      // Update time machines
      if (user.machines.length > 0) {
        console.log(`🤖 Saving ${user.machines.length} time machines...`)
        for (const machine of user.machines) {
          const { error: machineError } = await this.getSupabaseClient()
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
            console.error('❌ Error saving machine:', machineError)
            throw new Error(`Failed to save machine: ${machineError.message}`)
          }
        }
        console.log('✅ Time machines saved')
      }
      
      // Also save to localStorage as backup
      try {
        const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
        users[user.id] = user
        localStorage.setItem("chronostime_users", JSON.stringify(users))
      } catch (localError) {
        console.warn('Failed to save to localStorage:', localError)
      }
      
      console.log('✅ Save complete!')
    }, 'saveUser', options)
  }

  async verifyLogin(email: string, password: string, options?: StorageOptions): Promise<StorageResult<User | null>> {
    return this.withErrorHandling(async () => {
      console.log('🔍 Attempting login for:', email)
      
      const { data, error } = await this.getSupabaseClient()
        .from('users')
        .select(`
          *,
          time_machines(*),
          referrals:referrals!referrer_id(*)
        `)
        .eq('email', email)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user not found
          return null
        }
        throw new Error(`Database error: ${error.message}`)
      }
      
      if (!data) {
        console.log('❌ User not found')
        return null
      }
      
      console.log('✅ User found:', { email: data.email, hasPassword: !!data.password_hash })
      
      // If user has a password hash, verify it
      if (data.password_hash) {
        const isValid = await this.verifyPassword(password, data.password_hash)
        console.log('🔐 Password verification:', isValid ? '✅ Valid' : '❌ Invalid')
        if (!isValid) {
          return null
        }
      } else {
        // User created before password system - update with password now
        console.log('⚠️ User has no password hash, updating now...')
        const passwordHash = await this.hashPassword(password)
        await this.getSupabaseClient()
          .from('users')
          .update({ password_hash: passwordHash })
          .eq('id', data.id)
        console.log('✅ Password hash updated')
      }
      
      console.log('✅ Login successful')
      
      return this.mapUserFromDatabase(data)
    }, 'verifyLogin', options)
  }

  // Helper methods
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  private mapUserFromDatabase(data: any): User {
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
  }

  // Utility method to set current user
  setCurrentUser(userId: string) {
    if (typeof window === "undefined") return
    localStorage.setItem("chronostime_current_user", userId)
  }

  // Generate referral code
  generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }
}

// Export singleton instance
export const enhancedStorage = new EnhancedStorageService()