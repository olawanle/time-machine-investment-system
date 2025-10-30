/**
 * Comprehensive data validation schemas and utilities
 */

import type { User, TimeMachine, WithdrawalRequest } from './storage'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ValidationSchema<T> {
  validate(data: T): ValidationResult
  sanitize(data: T): T
}

// User validation schema
export class UserValidationSchema implements ValidationSchema<User> {
  validate(user: User): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields validation
    if (!user.id || typeof user.id !== 'string') {
      errors.push('User ID is required and must be a string')
    }

    if (!user.email || typeof user.email !== 'string') {
      errors.push('Email is required and must be a string')
    } else if (!this.isValidEmail(user.email)) {
      errors.push('Email format is invalid')
    }

    if (!user.username || typeof user.username !== 'string') {
      errors.push('Username is required and must be a string')
    }

    // Numeric field validation
    if (typeof user.balance !== 'number' || user.balance < 0) {
      errors.push('Balance must be a non-negative number')
    }

    if (typeof user.claimedBalance !== 'number' || user.claimedBalance < 0) {
      errors.push('Claimed balance must be a non-negative number')
    }

    if (typeof user.totalInvested !== 'number' || user.totalInvested < 0) {
      errors.push('Total invested must be a non-negative number')
    }

    if (typeof user.totalEarned !== 'number' || user.totalEarned < 0) {
      errors.push('Total earned must be a non-negative number')
    }

    // Array validation
    if (!Array.isArray(user.machines)) {
      errors.push('Machines must be an array')
    } else {
      // Validate each machine
      const machineValidator = new TimeMachineValidationSchema()
      user.machines.forEach((machine, index) => {
        const machineResult = machineValidator.validate(machine)
        if (!machineResult.isValid) {
          errors.push(`Machine ${index}: ${machineResult.errors.join(', ')}`)
        }
        warnings.push(...machineResult.warnings.map(w => `Machine ${index}: ${w}`))
      })

      // Check for duplicate machine IDs
      const machineIds = user.machines.map(m => m.id)
      const duplicateIds = machineIds.filter((id, index) => machineIds.indexOf(id) !== index)
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate machine IDs found: ${duplicateIds.join(', ')}`)
      }

      // Check machine count limits
      if (user.machines.length > 5) {
        warnings.push(`User has ${user.machines.length} machines, which exceeds the recommended limit of 5`)
      }
    }

    if (!Array.isArray(user.referrals)) {
      errors.push('Referrals must be an array')
    }

    // Tier validation
    const validTiers = ['bronze', 'silver', 'gold', 'platinum']
    if (!validTiers.includes(user.tier)) {
      errors.push(`Invalid tier: ${user.tier}. Must be one of: ${validTiers.join(', ')}`)
    }

    // Date validation
    if (typeof user.createdAt !== 'number' || user.createdAt <= 0) {
      errors.push('Created at must be a positive timestamp')
    }

    if (user.lastWithdrawalDate && (typeof user.lastWithdrawalDate !== 'number' || user.lastWithdrawalDate <= 0)) {
      errors.push('Last withdrawal date must be a positive timestamp')
    }

    // Business logic validation
    if (user.totalEarned > user.totalInvested * 10) {
      warnings.push('Total earned is unusually high compared to total invested')
    }

    if (user.claimedBalance > user.totalEarned) {
      errors.push('Claimed balance cannot exceed total earned')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  sanitize(user: User): User {
    return {
      ...user,
      id: String(user.id || '').trim(),
      email: String(user.email || '').toLowerCase().trim(),
      username: String(user.username || '').trim(),
      balance: Math.max(0, Number(user.balance) || 0),
      claimedBalance: Math.max(0, Number(user.claimedBalance) || 0),
      totalInvested: Math.max(0, Number(user.totalInvested) || 0),
      totalEarned: Math.max(0, Number(user.totalEarned) || 0),
      roi: Number(user.roi) || 0,
      machines: Array.isArray(user.machines) ? user.machines : [],
      referrals: Array.isArray(user.referrals) ? user.referrals : [],
      referralCode: String(user.referralCode || '').toUpperCase().trim(),
      tier: ['bronze', 'silver', 'gold', 'platinum'].includes(user.tier) ? user.tier : 'bronze',
      createdAt: Number(user.createdAt) || Date.now(),
      lastWithdrawalDate: Number(user.lastWithdrawalDate) || 0,
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// TimeMachine validation schema
export class TimeMachineValidationSchema implements ValidationSchema<TimeMachine> {
  validate(machine: TimeMachine): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!machine.id || typeof machine.id !== 'string') {
      errors.push('Machine ID is required and must be a string')
    }

    if (!machine.name || typeof machine.name !== 'string') {
      errors.push('Machine name is required and must be a string')
    }

    if (typeof machine.level !== 'number' || machine.level < 1 || machine.level > 5) {
      errors.push('Machine level must be a number between 1 and 5')
    }

    // Numeric validations
    if (typeof machine.rewardAmount !== 'number' || machine.rewardAmount <= 0) {
      errors.push('Reward amount must be a positive number')
    }

    if (typeof machine.investmentAmount !== 'number' || machine.investmentAmount <= 0) {
      errors.push('Investment amount must be a positive number')
    }

    if (typeof machine.maxEarnings !== 'number' || machine.maxEarnings <= 0) {
      errors.push('Max earnings must be a positive number')
    }

    if (typeof machine.currentEarnings !== 'number' || machine.currentEarnings < 0) {
      errors.push('Current earnings must be a non-negative number')
    }

    if (typeof machine.roiPercentage !== 'number' || machine.roiPercentage < 0) {
      errors.push('ROI percentage must be a non-negative number')
    }

    if (typeof machine.claimIntervalMs !== 'number' || machine.claimIntervalMs <= 0) {
      errors.push('Claim interval must be a positive number')
    }

    // Date validations
    if (typeof machine.unlockedAt !== 'number' || machine.unlockedAt <= 0) {
      errors.push('Unlocked at must be a positive timestamp')
    }

    if (typeof machine.lastClaimedAt !== 'number' || machine.lastClaimedAt < 0) {
      errors.push('Last claimed at must be a non-negative timestamp')
    }

    // Boolean validation
    if (typeof machine.isActive !== 'boolean') {
      errors.push('Is active must be a boolean')
    }

    // Business logic validation
    if (machine.currentEarnings > machine.maxEarnings) {
      errors.push('Current earnings cannot exceed max earnings')
    }

    if (machine.maxEarnings < machine.investmentAmount) {
      warnings.push('Max earnings is less than investment amount (negative ROI)')
    }

    if (machine.roiPercentage > 1000) {
      warnings.push('ROI percentage is unusually high (>1000%)')
    }

    // Claim interval validation
    const minInterval = 5 * 60 * 1000 // 5 minutes
    const maxInterval = 7 * 24 * 60 * 60 * 1000 // 7 days
    if (machine.claimIntervalMs < minInterval || machine.claimIntervalMs > maxInterval) {
      warnings.push(`Claim interval (${machine.claimIntervalMs}ms) is outside normal range`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  sanitize(machine: TimeMachine): TimeMachine {
    return {
      ...machine,
      id: String(machine.id || '').trim(),
      name: String(machine.name || '').trim(),
      description: String(machine.description || '').trim(),
      level: Math.max(1, Math.min(5, Number(machine.level) || 1)),
      rewardAmount: Math.max(0, Number(machine.rewardAmount) || 0),
      investmentAmount: Math.max(0, Number(machine.investmentAmount) || 0),
      maxEarnings: Math.max(0, Number(machine.maxEarnings) || 0),
      currentEarnings: Math.max(0, Math.min(Number(machine.currentEarnings) || 0, machine.maxEarnings)),
      roiPercentage: Math.max(0, Number(machine.roiPercentage) || 0),
      claimIntervalMs: Math.max(5 * 60 * 1000, Number(machine.claimIntervalMs) || 10 * 60 * 1000),
      unlockedAt: Number(machine.unlockedAt) || Date.now(),
      lastClaimedAt: Number(machine.lastClaimedAt) || 0,
      isActive: Boolean(machine.isActive),
      icon: String(machine.icon || '⏰').trim(),
    }
  }
}

// Withdrawal request validation schema
export class WithdrawalRequestValidationSchema implements ValidationSchema<WithdrawalRequest> {
  validate(request: WithdrawalRequest): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!request.id || typeof request.id !== 'string') {
      errors.push('Request ID is required and must be a string')
    }

    if (!request.userId || typeof request.userId !== 'string') {
      errors.push('User ID is required and must be a string')
    }

    if (!request.walletAddress || typeof request.walletAddress !== 'string') {
      errors.push('Wallet address is required and must be a string')
    } else if (request.walletAddress.length < 10) {
      warnings.push('Wallet address seems unusually short')
    }

    // Amount validation
    if (typeof request.amount !== 'number' || request.amount <= 0) {
      errors.push('Amount must be a positive number')
    } else if (request.amount < 10) {
      warnings.push('Withdrawal amount is very small (<$10)')
    } else if (request.amount > 10000) {
      warnings.push('Withdrawal amount is very large (>$10,000)')
    }

    // Status validation
    const validStatuses = ['pending', 'approved', 'rejected']
    if (!validStatuses.includes(request.status)) {
      errors.push(`Invalid status: ${request.status}. Must be one of: ${validStatuses.join(', ')}`)
    }

    // Date validation
    if (typeof request.createdAt !== 'number' || request.createdAt <= 0) {
      errors.push('Created at must be a positive timestamp')
    }

    if (request.processedAt && (typeof request.processedAt !== 'number' || request.processedAt <= 0)) {
      errors.push('Processed at must be a positive timestamp')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  sanitize(request: WithdrawalRequest): WithdrawalRequest {
    return {
      ...request,
      id: String(request.id || '').trim(),
      userId: String(request.userId || '').trim(),
      walletAddress: String(request.walletAddress || '').trim(),
      amount: Math.max(0, Number(request.amount) || 0),
      status: ['pending', 'approved', 'rejected'].includes(request.status) ? request.status : 'pending',
      createdAt: Number(request.createdAt) || Date.now(),
      processedAt: request.processedAt ? Number(request.processedAt) : undefined,
    }
  }
}

// Export validation utilities
export const validators = {
  user: new UserValidationSchema(),
  timeMachine: new TimeMachineValidationSchema(),
  withdrawalRequest: new WithdrawalRequestValidationSchema(),
}

// Utility function to validate and sanitize data
export function validateAndSanitize<T>(data: T, schema: ValidationSchema<T>): {
  data: T
  validation: ValidationResult
} {
  const sanitized = schema.sanitize(data)
  const validation = schema.validate(sanitized)
  
  return {
    data: sanitized,
    validation
  }
}

// Runtime type checking utilities
export function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.email === 'string' &&
         Array.isArray(obj.machines)
}

export function isTimeMachine(obj: any): obj is TimeMachine {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' &&
         typeof obj.level === 'number'
}

export function isWithdrawalRequest(obj: any): obj is WithdrawalRequest {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.userId === 'string' &&
         typeof obj.amount === 'number'
}