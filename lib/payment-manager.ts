/**
 * Payment management system for tracking crypto payments
 */

import { enhancedStorage } from './enhanced-storage'
import { cryptoPaymentService, type PaymentRequest } from './crypto-payment-service'
import { errorService } from './error-service'
import type { User, BitcoinTransaction } from './storage'

export interface PaymentRecord {
  id: string
  userId: string
  type: 'investment' | 'withdrawal'
  status: 'pending' | 'confirmed' | 'failed' | 'expired'
  amount: number // USD
  bitcoinAmount?: number // BTC
  address?: string
  transactionHash?: string
  confirmations?: number
  createdAt: number
  confirmedAt?: number
  expiresAt?: number
  metadata?: Record<string, any>
}

class PaymentManager {
  private static instance: PaymentManager
  private paymentRecords = new Map<string, PaymentRecord>()

  static getInstance(): PaymentManager {
    if (!PaymentManager.instance) {
      PaymentManager.instance = new PaymentManager()
    }
    return PaymentManager.instance
  }

  /**
   * Process a new investment payment
   */
  async processInvestmentPayment(
    userId: string, 
    amount: number,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // Create payment request through crypto service
      const paymentRequest = await cryptoPaymentService.createPaymentRequest(userId, amount)
      
      // Create payment record
      const paymentRecord: PaymentRecord = {
        id: paymentRequest.id,
        userId,
        type: 'investment',
        status: 'pending',
        amount,
        bitcoinAmount: paymentRequest.bitcoinAmount,
        address: paymentRequest.address,
        createdAt: paymentRequest.createdAt,
        expiresAt: paymentRequest.expiresAt,
        metadata
      }

      this.paymentRecords.set(paymentRecord.id, paymentRecord)
      await this.savePaymentRecord(paymentRecord)

      return {
        success: true,
        paymentId: paymentRecord.id
      }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'processInvestmentPayment',
        userId,
        amount
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payment'
      }
    }
  }

  /**
   * Confirm a payment and update user account
   */
  async confirmPayment(
    paymentId: string, 
    transactionHash: string, 
    confirmations: number = 1
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentRecord = this.paymentRecords.get(paymentId)
      if (!paymentRecord) {
        return { success: false, error: 'Payment record not found' }
      }

      // Update payment record
      paymentRecord.status = 'confirmed'
      paymentRecord.transactionHash = transactionHash
      paymentRecord.confirmations = confirmations
      paymentRecord.confirmedAt = Date.now()

      await this.savePaymentRecord(paymentRecord)

      // Process the payment based on type
      if (paymentRecord.type === 'investment') {
        await this.processConfirmedInvestment(paymentRecord)
      }

      return { success: true }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'confirmPayment',
        paymentId,
        transactionHash
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment'
      }
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentRecord | null> {
    const record = this.paymentRecords.get(paymentId)
    if (record) {
      return record
    }

    // Try to load from storage
    return this.loadPaymentRecord(paymentId)
  }

  /**
   * Get all payments for a user
   */
  async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    // Get from memory
    const memoryRecords = Array.from(this.paymentRecords.values())
      .filter(record => record.userId === userId)

    // TODO: Load from persistent storage and merge
    return memoryRecords.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentRecord = this.paymentRecords.get(paymentId)
      if (!paymentRecord) {
        return { success: false, error: 'Payment record not found' }
      }

      if (paymentRecord.status !== 'pending') {
        return { success: false, error: 'Payment cannot be cancelled' }
      }

      // Cancel in crypto service
      cryptoPaymentService.cancelPayment(paymentId)

      // Update record
      paymentRecord.status = 'failed'
      await this.savePaymentRecord(paymentRecord)

      return { success: true }
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'cancelPayment',
        paymentId
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel payment'
      }
    }
  }

  /**
   * Check for expired payments and mark them as expired
   */
  async cleanupExpiredPayments(): Promise<void> {
    const now = Date.now()
    const expiredPayments = Array.from(this.paymentRecords.values())
      .filter(record => 
        record.status === 'pending' && 
        record.expiresAt && 
        record.expiresAt < now
      )

    for (const payment of expiredPayments) {
      payment.status = 'expired'
      await this.savePaymentRecord(payment)
    }
  }

  /**
   * Get payment statistics for a user
   */
  async getPaymentStats(userId: string): Promise<{
    totalInvestments: number
    successfulPayments: number
    pendingPayments: number
    failedPayments: number
    totalAmountInvested: number
  }> {
    const payments = await this.getUserPayments(userId)
    
    return {
      totalInvestments: payments.filter(p => p.type === 'investment').length,
      successfulPayments: payments.filter(p => p.status === 'confirmed').length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed' || p.status === 'expired').length,
      totalAmountInvested: payments
        .filter(p => p.type === 'investment' && p.status === 'confirmed')
        .reduce((sum, p) => sum + p.amount, 0)
    }
  }

  private async processConfirmedInvestment(paymentRecord: PaymentRecord): Promise<void> {
    try {
      // Get user
      const userResult = await enhancedStorage.getCurrentUser()
      if (!userResult.success || !userResult.data) {
        throw new Error('User not found')
      }

      const user = userResult.data
      
      // Update user balance and create time machine
      const updatedUser = { ...user }
      updatedUser.balance += paymentRecord.amount
      updatedUser.totalInvested += paymentRecord.amount

      // Create new time machine
      const machineLevel = (user.machines || []).length + 1
      const roiPercentage = 10 + Math.random() * 10 // 10-20% ROI
      const maxEarnings = paymentRecord.amount * (roiPercentage / 100)
      const weeklyEarnings = maxEarnings / 7
      const dailyEarnings = weeklyEarnings / 7
      const hourlyEarnings = dailyEarnings / 24
      const rewardAmount = hourlyEarnings / 6 // 6 claims per hour (10min intervals)
      
      const newMachine = {
        id: `machine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: machineLevel,
        name: `Time Machine ${machineLevel}`,
        description: `Advanced temporal device - Level ${machineLevel}`,
        unlockedAt: Date.now(),
        lastClaimedAt: 0,
        isActive: true,
        rewardAmount: Math.max(1, Math.round(rewardAmount)),
        claimIntervalMs: user.referrals && user.referrals.length >= 3 ? 5 * 60 * 1000 : 10 * 60 * 1000,
        icon: "⏰",
        investmentAmount: paymentRecord.amount,
        maxEarnings: maxEarnings,
        currentEarnings: 0,
        roiPercentage: roiPercentage
      }

      updatedUser.machines = [...(user.machines || []), newMachine]

      // Save updated user
      const saveResult = await enhancedStorage.saveUser(updatedUser)
      if (!saveResult.success) {
        throw new Error('Failed to update user account')
      }

      console.log('Investment processed successfully:', {
        userId: user.id,
        amount: paymentRecord.amount,
        machineLevel,
        transactionHash: paymentRecord.transactionHash
      })
    } catch (error) {
      errorService.logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'processConfirmedInvestment',
        paymentId: paymentRecord.id,
        userId: paymentRecord.userId
      })
      throw error
    }
  }

  private async savePaymentRecord(record: PaymentRecord): Promise<void> {
    // In a real implementation, this would save to a database
    // For now, we'll use localStorage as a fallback
    try {
      if (typeof window !== 'undefined') {
        const key = `payment_${record.id}`
        localStorage.setItem(key, JSON.stringify(record))
      }
    } catch (error) {
      console.warn('Failed to save payment record to localStorage:', error)
    }
  }

  private async loadPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
    try {
      if (typeof window !== 'undefined') {
        const key = `payment_${paymentId}`
        const data = localStorage.getItem(key)
        if (data) {
          const record = JSON.parse(data) as PaymentRecord
          this.paymentRecords.set(paymentId, record)
          return record
        }
      }
    } catch (error) {
      console.warn('Failed to load payment record from localStorage:', error)
    }
    return null
  }
}

// Export singleton instance
export const paymentManager = PaymentManager.getInstance()

// Utility functions
export function formatPaymentStatus(status: PaymentRecord['status']): string {
  switch (status) {
    case 'pending':
      return 'Waiting for Payment'
    case 'confirmed':
      return 'Payment Confirmed'
    case 'failed':
      return 'Payment Failed'
    case 'expired':
      return 'Payment Expired'
    default:
      return 'Unknown Status'
  }
}

export function getPaymentStatusColor(status: PaymentRecord['status']): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-400'
    case 'confirmed':
      return 'text-green-400'
    case 'failed':
    case 'expired':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}