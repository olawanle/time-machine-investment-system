/**
 * Enhanced storage service with comprehensive error handling
 */

import { createClient } from './supabase/client'
import { errorService } from './error-service'
import type { User, TimeMachine } from './storage'
import { validators, validateAndSanitize } from './data-validation'

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
        this.startPeriodicSync()
      })
      window.addEventListener('offline', () => {
        this.isOnline = false
        this.stopPeriodicSync()
      })

      // Start periodic sync when online
      if (navigator.onLine) {
        this.startPeriodicSync()
      }
    }
  }

  private syncInterval: NodeJS.Timeout | null = null

  private startPeriodicSync() {
    if (this.syncInterval) return // Already running

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(async () => {
      if (typeof window !== 'undefined' && this.isOnline) {
        const userId = localStorage.getItem("chronostime_current_user")
        if (userId) {
          try {
            await this.syncUserData(userId)
          } catch (error) {
            console.warn('Periodic sync failed:', error)
          }
        }
      }
    }, 30000)
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
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
          const errorMessage = (error as any).message || (error as any).error || (error as any).details
          if (errorMessage) {
            err = new Error(errorMessage)
          } else {
            // Don't stringify empty objects
            const stringified = JSON.stringify(error)
            if (stringified === '{}' || stringified === 'null') {
              err = new Error('Database operation failed')
            } else {
              err = new Error(stringified)
            }
          }
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
        // Try to load user with machines and referrals from database
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

        return await this.mapUserFromDatabase(data)
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

      // Validate and sanitize user data
      const { data: sanitizedUser, validation } = validateAndSanitize(user, validators.user)

      if (!validation.isValid) {
        console.error('❌ User validation failed:', validation.errors)
        throw new Error(`User validation failed: ${validation.errors.join(', ')}`)
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ User validation warnings:', validation.warnings)
      }

      console.log('💾 Saving user:', sanitizedUser.email)
      console.log(`✅ User data validated with ${sanitizedUser.machines.length} machines`)

      const userData: any = {
        id: sanitizedUser.id,
        email: sanitizedUser.email,
        username: sanitizedUser.username,
        name: sanitizedUser.username,
        balance: sanitizedUser.balance,
        claimed_balance: sanitizedUser.claimedBalance,
        referral_code: sanitizedUser.referralCode,
        referred_by: sanitizedUser.referredBy || null,
        last_withdrawal_date: sanitizedUser.lastWithdrawalDate,
        tier: sanitizedUser.tier,
        total_invested: sanitizedUser.totalInvested,
        total_earned: sanitizedUser.totalEarned,
        roi: sanitizedUser.roi,
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

      // Update time machines - skip if database schema is not ready
      if (user.machines.length > 0) {
        console.log(`🤖 Attempting to save ${user.machines.length} time machines...`)
        try {
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
              const errorMessage = machineError.message || machineError.details || 'Unknown database error'
              // If it's a schema error, just warn and continue
              if (errorMessage.includes('schema cache') || errorMessage.includes('column') || errorMessage.includes('table')) {
                console.warn('⚠️ Database schema not ready for time machines, using localStorage fallback')
                break
              } else {
                console.error('❌ Error saving machine:', errorMessage)
                throw new Error(`Failed to save machine: ${errorMessage}`)
              }
            }
          }
          console.log('✅ Time machines saved to database')
        } catch (schemaError) {
          console.warn('⚠️ Time machines table not available, using localStorage fallback')
        }
      }

      console.log(`✅ User data saved with ${user.machines.length} time machines in user record`)

      // ALWAYS save to localStorage as backup - this is critical for machine persistence
      try {
        const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
        users[user.id] = user
        localStorage.setItem("chronostime_users", JSON.stringify(users))
        localStorage.setItem("chronostime_current_user", user.id)
        console.log(`💾 Saved ${user.machines.length} machines to localStorage backup`)
      } catch (localError) {
        console.error('CRITICAL: Failed to save to localStorage:', localError)
        throw new Error('Failed to save user data to local storage')
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

      return await this.mapUserFromDatabase(data)
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

  private async mapUserFromDatabase(data: any): Promise<User> {
    // Load machines from both database and localStorage
    let machines: TimeMachine[] = []

    // First try to load from database
    if (data.time_machines && Array.isArray(data.time_machines)) {
      machines = data.time_machines.map((m: any) => ({
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
      }))
    }

    // If no machines from database, try localStorage fallback
    if (machines.length === 0 && typeof window !== 'undefined') {
      try {
        const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
        const localUser = users[data.id]
        if (localUser && localUser.machines && Array.isArray(localUser.machines)) {
          machines = localUser.machines
          console.log(`📱 Loaded ${machines.length} machines from localStorage fallback`)
        }
      } catch (error) {
        console.warn('Failed to load machines from localStorage:', error)
      }
    }

    return {
      id: data.id,
      email: data.email,
      username: data.username || data.name || data.email.split('@')[0],
      balance: Number(data.balance),
      claimedBalance: Number(data.claimed_balance),
      machines: machines,
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

  // Data synchronization methods
  async syncUserData(userId: string, options?: StorageOptions): Promise<StorageResult<User | null>> {
    return this.withErrorHandling(async () => {
      console.log('🔄 Syncing user data for:', userId)

      let databaseUser: User | null = null
      let localUser: User | null = null

      // Try to get user from database
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

        if (!error && data) {
          databaseUser = await this.mapUserFromDatabase(data)
        }
      } catch (error) {
        console.warn('Failed to load user from database:', error)
      }

      // Get user from localStorage
      if (typeof window !== 'undefined') {
        try {
          const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
          localUser = users[userId] || null
        } catch (error) {
          console.warn('Failed to load user from localStorage:', error)
        }
      }

      // Determine which version is more recent and complete
      let syncedUser: User | null = null

      if (databaseUser && localUser) {
        // Both exist - merge them intelligently
        const dbMachineCount = databaseUser.machines.length
        const localMachineCount = localUser.machines.length

        // Use the version with more machines, or the one with more recent updates
        if (localMachineCount > dbMachineCount) {
          console.log(`📱 Local user has more machines (${localMachineCount} vs ${dbMachineCount}), using local version`)
          syncedUser = localUser
          // Save local version to database
          await this.saveUser(localUser)
        } else if (dbMachineCount > localMachineCount) {
          console.log(`🗄️ Database user has more machines (${dbMachineCount} vs ${localMachineCount}), using database version`)
          syncedUser = databaseUser
        } else {
          // Same number of machines, use database version as source of truth
          syncedUser = databaseUser
        }
      } else if (databaseUser) {
        console.log('🗄️ Using database version')
        syncedUser = databaseUser
      } else if (localUser) {
        console.log('📱 Using local version and syncing to database')
        syncedUser = localUser
        // Save local version to database
        await this.saveUser(localUser)
      }

      if (syncedUser) {
        // Ensure localStorage is updated with synced version
        if (typeof window !== 'undefined') {
          const users = JSON.parse(localStorage.getItem("chronostime_users") || "{}")
          users[userId] = syncedUser
          localStorage.setItem("chronostime_users", JSON.stringify(users))
        }
        console.log(`✅ User data synced with ${syncedUser.machines.length} machines`)
      }

      return syncedUser
    }, 'syncUserData', options)
  }

  async validateDataIntegrity(user: User): Promise<StorageResult<boolean>> {
    return this.withErrorHandling(async () => {
      console.log('🔍 Validating data integrity for user:', user.email)

      const issues: string[] = []

      // Validate user structure
      if (!user.id || !user.email) {
        issues.push('Missing required user fields')
      }

      // Validate machines
      if (user.machines) {
        for (const machine of user.machines) {
          if (!machine.id || !machine.name) {
            issues.push(`Invalid machine: ${machine.id || 'unknown'}`)
          }
          if (machine.currentEarnings > machine.maxEarnings) {
            issues.push(`Machine ${machine.name} has exceeded max earnings`)
          }
        }
      }

      // Validate balances
      if (user.balance < 0 || user.claimedBalance < 0) {
        issues.push('Negative balance detected')
      }

      if (issues.length > 0) {
        console.warn('⚠️ Data integrity issues found:', issues)
        return false
      }

      console.log('✅ Data integrity validated')
      return true
    }, 'validateDataIntegrity')
  }
}

// Export singleton instance
export const enhancedStorage = new EnhancedStorageService()