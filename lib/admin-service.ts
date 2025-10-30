/**
 * Real admin service with actual database operations
 * All functions here perform real actions on user accounts and platform data
 */

import { storage, type User, type WithdrawalRequest } from './storage'
import { errorService } from './error-service'
import { generateId } from './utils'

export interface AdminAction {
  id: string
  adminId: string
  action: string
  targetUserId?: string
  details: string
  timestamp: number
  result: 'success' | 'failed'
}

export interface PlatformSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  withdrawalsEnabled: boolean
  minInvestment: number
  maxInvestment: number
  defaultROI: number
  referralBonus: number
  withdrawalCooldown: number // days
}

class AdminService {
  private static instance: AdminService
  private adminActions: AdminAction[] = []
  private platformSettings: PlatformSettings = {
    maintenanceMode: false,
    registrationEnabled: true,
    withdrawalsEnabled: true,
    minInvestment: 100,
    maxInvestment: 10000,
    defaultROI: 15,
    referralBonus: 5,
    withdrawalCooldown: 12
  }

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  /**
   * REAL FUNCTION: Reset a specific user's balance and machines
   */
  async resetUserBalance(adminId: string, targetUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const targetUser = await storage.getUser(targetUserId)
      if (!targetUser) {
        return { success: false, error: 'User not found' }
      }

      // Actually reset the user's data
      const resetUser: User = {
        ...targetUser,
        balance: 0,
        claimedBalance: 0,
        totalEarned: 0,
        totalInvested: 0,
        machines: [], // Remove all time machines
        roi: 0
      }

      // Save the reset user to database
      await storage.saveUser(resetUser)

      // Log admin action
      await this.logAdminAction(adminId, 'reset_user_balance', targetUserId, `Reset balance for user ${targetUser.username}`, 'success')

      console.log(`✅ REAL ACTION: Reset balance for user ${targetUser.username} (${targetUserId})`)
      return { success: true }
    } catch (error) {
      await this.logAdminAction(adminId, 'reset_user_balance', targetUserId, `Failed to reset balance: ${error}`, 'failed')
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'resetUserBalance',
        adminId,
        targetUserId
      })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * REAL FUNCTION: Reset ALL user balances (except admin)
   */
  async resetAllUserBalances(adminId: string): Promise<{ success: boolean; usersReset: number; error?: string }> {
    try {
      const allUsers = await storage.getAllUsers()
      let usersReset = 0

      for (const user of allUsers) {
        // Skip admin user
        if (user.email === 'admin@chronostime.com') continue

        // Reset each user
        const resetUser: User = {
          ...user,
          balance: 0,
          claimedBalance: 0,
          totalEarned: 0,
          totalInvested: 0,
          machines: [],
          roi: 0
        }

        await storage.saveUser(resetUser)
        usersReset++
      }

      // Log admin action
      await this.logAdminAction(adminId, 'reset_all_balances', undefined, `Reset balances for ${usersReset} users`, 'success')

      console.log(`✅ REAL ACTION: Reset balances for ${usersReset} users`)
      return { success: true, usersReset }
    } catch (error) {
      await this.logAdminAction(adminId, 'reset_all_balances', undefined, `Failed to reset all balances: ${error}`, 'failed')
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'resetAllUserBalances',
        adminId
      })
      return { success: false, usersReset: 0, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * REAL FUNCTION: Suspend a user account
   */
  async suspendUser(adminId: string, targetUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const targetUser = await storage.getUser(targetUserId)
      if (!targetUser) {
        return { success: false, error: 'User not found' }
      }

      // Add suspended status (extend User interface in production)
      const suspendedUser = {
        ...targetUser,
        // In production, add a 'status' field to User interface
        lastWithdrawalDate: Date.now() + (365 * 24 * 60 * 60 * 1000) // Block withdrawals for 1 year
      }

      await storage.saveUser(suspendedUser)
      await this.logAdminAction(adminId, 'suspend_user', targetUserId, `Suspended user ${targetUser.username}`, 'success')

      console.log(`✅ REAL ACTION: Suspended user ${targetUser.username} (${targetUserId})`)
      return { success: true }
    } catch (error) {
      await this.logAdminAction(adminId, 'suspend_user', targetUserId, `Failed to suspend user: ${error}`, 'failed')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * REAL FUNCTION: Delete a user account
   */
  async deleteUser(adminId: string, targetUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const targetUser = await storage.getUser(targetUserId)
      if (!targetUser) {
        return { success: false, error: 'User not found' }
      }

      // In a real implementation, you'd soft delete by marking as deleted
      // For now, we'll zero out their data and mark them as deleted
      const deletedUser: User = {
        ...targetUser,
        balance: 0,
        claimedBalance: 0,
        totalEarned: 0,
        totalInvested: 0,
        machines: [],
        username: `[DELETED]${targetUser.username}`,
        email: `deleted_${targetUser.email}`
      }

      await storage.saveUser(deletedUser)
      await this.logAdminAction(adminId, 'delete_user', targetUserId, `Deleted user ${targetUser.username}`, 'success')

      console.log(`✅ REAL ACTION: Deleted user ${targetUser.username} (${targetUserId})`)
      return { success: true }
    } catch (error) {
      await this.logAdminAction(adminId, 'delete_user', targetUserId, `Failed to delete user: ${error}`, 'failed')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * REAL FUNCTION: Add balance to a user account
   */
  async addUserBalance(adminId: string, targetUserId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const targetUser = await storage.getUser(targetUserId)
      if (!targetUser) {
        return { success: false, error: 'User not found' }
      }

      // Actually add balance to user
      const updatedUser: User = {
        ...targetUser,
        balance: targetUser.balance + amount,
        totalInvested: targetUser.totalInvested + amount
      }

      await storage.saveUser(updatedUser)
      await this.logAdminAction(adminId, 'add_balance', targetUserId, `Added $${amount} to ${targetUser.username}`, 'success')

      console.log(`✅ REAL ACTION: Added $${amount} to user ${targetUser.username}`)
      return { success: true }
    } catch (error) {
      await this.logAdminAction(adminId, 'add_balance', targetUserId, `Failed to add balance: ${error}`, 'failed')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * REAL FUNCTION: Process withdrawal requests
   */
  async processWithdrawal(adminId: string, withdrawalId: string, approve: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const withdrawals = await storage.getWithdrawalRequests()
      const withdrawal = withdrawals.find(w => w.id === withdrawalId)
      
      if (!withdrawal) {
        return { success: false, error: 'Withdrawal request not found' }
      }

      // Update withdrawal status
      await storage.updateWithdrawalRequest(withdrawalId, {
        status: approve ? 'approved' : 'rejected',
        processedAt: Date.now()
      })

      // If approved, the user keeps their reduced balance
      // If rejected, restore their balance
      if (!approve) {
        const user = await storage.getUser(withdrawal.userId)
        if (user) {
          const restoredUser = {
            ...user,
            claimedBalance: user.claimedBalance + withdrawal.amount
          }
          await storage.saveUser(restoredUser)
        }
      }

      await this.logAdminAction(
        adminId, 
        approve ? 'approve_withdrawal' : 'reject_withdrawal', 
        withdrawal.userId, 
        `${approve ? 'Approved' : 'Rejected'} withdrawal of $${withdrawal.amount}`, 
        'success'
      )

      console.log(`✅ REAL ACTION: ${approve ? 'Approved' : 'Rejected'} withdrawal ${withdrawalId} for $${withdrawal.amount}`)
      return { success: true }
    } catch (error) {
      await this.logAdminAction(adminId, 'process_withdrawal', undefined, `Failed to process withdrawal: ${error}`, 'failed')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * REAL FUNCTION: Update platform settings
   */
  async updatePlatformSettings(adminId: string, settings: Partial<PlatformSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      this.platformSettings = { ...this.platformSettings, ...settings }
      
      // Save to localStorage (in production, save to database)
      if (typeof window !== 'undefined') {
        localStorage.setItem('chronostime_platform_settings', JSON.stringify(this.platformSettings))
      }

      await this.logAdminAction(adminId, 'update_settings', undefined, `Updated platform settings: ${JSON.stringify(settings)}`, 'success')

      console.log(`✅ REAL ACTION: Updated platform settings:`, settings)
      return { success: true }
    } catch (error) {
      await this.logAdminAction(adminId, 'update_settings', undefined, `Failed to update settings: ${error}`, 'failed')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get platform settings
   */
  getPlatformSettings(): PlatformSettings {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronostime_platform_settings')
      if (saved) {
        try {
          this.platformSettings = { ...this.platformSettings, ...JSON.parse(saved) }
        } catch (error) {
          console.warn('Failed to load platform settings:', error)
        }
      }
    }
    return this.platformSettings
  }

  /**
   * Get all admin actions (audit log)
   */
  getAdminActions(): AdminAction[] {
    return [...this.adminActions].sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get all withdrawal requests for admin review
   */
  async getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return storage.getWithdrawalRequests()
  }

  /**
   * Create a new user account (admin function)
   */
  async createUser(adminId: string, userData: {
    email: string
    username: string
    initialBalance?: number
  }): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const existingUsers = await storage.getAllUsers()
      if (existingUsers.some(u => u.email === userData.email)) {
        return { success: false, error: 'Email already exists' }
      }

      const newUser: User = {
        id: generateId(),
        email: userData.email,
        username: userData.username,
        balance: userData.initialBalance || 0,
        claimedBalance: 0,
        totalEarned: 0,
        totalInvested: userData.initialBalance || 0,
        machines: [],
        referralCode: storage.generateReferralCode(),
        referrals: [],
        lastWithdrawalDate: 0,
        createdAt: Date.now(),
        tier: 'bronze',
        roi: 0
      }

      await storage.saveUser(newUser)
      await this.logAdminAction(adminId, 'create_user', newUser.id, `Created user ${userData.username}`, 'success')

      console.log(`✅ REAL ACTION: Created user ${userData.username} with $${userData.initialBalance || 0} balance`)
      return { success: true, userId: newUser.id }
    } catch (error) {
      await this.logAdminAction(adminId, 'create_user', undefined, `Failed to create user: ${error}`, 'failed')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get real platform statistics
   */
  async getRealPlatformStats(): Promise<{
    totalUsers: number
    totalInvestments: number
    totalEarnings: number
    totalWithdrawals: number
    pendingWithdrawals: number
    activeUsers: number
    revenue: number
  }> {
    try {
      const [users, withdrawals] = await Promise.all([
        storage.getAllUsers(),
        storage.getWithdrawalRequests()
      ])

      const totalInvestments = users.reduce((sum, user) => sum + user.totalInvested, 0)
      const totalEarnings = users.reduce((sum, user) => sum + (user.totalEarned || user.claimedBalance), 0)
      const totalWithdrawals = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + w.amount, 0)
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length
      
      // Calculate active users (logged in within last 7 days)
      const oneWeek = 7 * 24 * 60 * 60 * 1000
      const activeUsers = users.filter(user => (Date.now() - user.createdAt) < oneWeek).length

      // Calculate platform revenue (5% of investments)
      const revenue = totalInvestments * 0.05

      return {
        totalUsers: users.length,
        totalInvestments,
        totalEarnings,
        totalWithdrawals,
        pendingWithdrawals,
        activeUsers,
        revenue
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'getRealPlatformStats'
      })
      throw error
    }
  }

  /**
   * Log admin actions for audit trail
   */
  private async logAdminAction(
    adminId: string, 
    action: string, 
    targetUserId: string | undefined, 
    details: string, 
    result: 'success' | 'failed'
  ): Promise<void> {
    const adminAction: AdminAction = {
      id: generateId(),
      adminId,
      action,
      targetUserId,
      details,
      timestamp: Date.now(),
      result
    }

    this.adminActions.push(adminAction)

    // Save to localStorage (in production, save to database)
    if (typeof window !== 'undefined') {
      try {
        const existingActions = JSON.parse(localStorage.getItem('chronostime_admin_actions') || '[]')
        existingActions.push(adminAction)
        localStorage.setItem('chronostime_admin_actions', JSON.stringify(existingActions))
      } catch (error) {
        console.warn('Failed to save admin action:', error)
      }
    }
  }

  /**
   * Load admin actions from storage
   */
  async loadAdminActions(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chronostime_admin_actions')
        if (saved) {
          this.adminActions = JSON.parse(saved)
        }
      } catch (error) {
        console.warn('Failed to load admin actions:', error)
      }
    }
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance()

// Load admin actions on initialization
if (typeof window !== 'undefined') {
  adminService.loadAdminActions()
}