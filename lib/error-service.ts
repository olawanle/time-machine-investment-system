/**
 * Centralized error handling service
 */

import { ErrorCategory } from "@/components/ui/error-boundary"

export interface ErrorReport {
  id: string
  timestamp: string
  category: ErrorCategory
  message: string
  stack?: string
  userAgent: string
  url: string
  userId?: string
  context?: Record<string, any>
}

export class ErrorService {
  private static instance: ErrorService
  private errorQueue: ErrorReport[] = []
  private isOnline = true

  private constructor() {
    // Monitor online status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flushErrorQueue()
      })
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
    }
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  /**
   * Log an error with context
   */
  logError(error: Error, context?: Record<string, any>): string {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      category: this.categorizeError(error),
      message: error.message,
      stack: error.stack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      context
    }

    // Add to queue for processing
    this.errorQueue.push(errorReport)

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue()
    }

    // Log to console in development - but don't log empty objects
    if (process.env.NODE_ENV === 'development') {
      if (error.message && error.message.trim() && error.message !== '{}' && error.message !== 'undefined') {
        console.error('Error logged:', {
          id: errorReport.id,
          message: errorReport.message,
          category: errorReport.category,
          context: errorReport.context
        })
      }
    }

    return errorReport.id
  }

  /**
   * Create user-friendly error message
   */
  getUserFriendlyMessage(error: Error): string {
    const category = this.categorizeError(error)
    
    switch (category) {
      case ErrorCategory.NETWORK:
        return "Connection problem. Please check your internet connection and try again."
      case ErrorCategory.VALIDATION:
        return "Please check your input and try again."
      case ErrorCategory.BUSINESS_LOGIC:
        return error.message // Business logic errors usually have user-friendly messages
      case ErrorCategory.SYSTEM:
        return "System temporarily unavailable. Please try again in a moment."
      default:
        return "An unexpected error occurred. Please try again."
    }
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: Error): boolean {
    const category = this.categorizeError(error)
    return category === ErrorCategory.NETWORK || category === ErrorCategory.SYSTEM
  }

  /**
   * Get suggested retry count for error
   */
  getRetryCount(error: Error): number {
    const category = this.categorizeError(error)
    
    switch (category) {
      case ErrorCategory.NETWORK:
        return 3
      case ErrorCategory.SYSTEM:
        return 2
      default:
        return 0
    }
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()
    
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return ErrorCategory.NETWORK
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION
    }
    if (message.includes('insufficient') || message.includes('limit') || message.includes('unauthorized')) {
      return ErrorCategory.BUSINESS_LOGIC
    }
    if (message.includes('system') || message.includes('server')) {
      return ErrorCategory.SYSTEM
    }
    
    return ErrorCategory.UNKNOWN
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      // In production, send to error reporting service
      if (process.env.NODE_ENV === 'production') {
        await this.sendToErrorService(errors)
      }
    } catch (error) {
      // If sending fails, add back to queue
      this.errorQueue.unshift(...errors)
      console.error('Failed to send error reports:', error)
    }
  }

  private async sendToErrorService(errors: ErrorReport[]) {
    // TODO: Implement actual error reporting service integration
    // For now, just log to console
    console.log('Sending error reports to service:', errors)
    
    // Example implementation for a hypothetical error service:
    /*
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send error reports')
    }
    */
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance()

// Utility functions for common error handling patterns
export function handleAsyncError<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return operation().catch((error) => {
    errorService.logError(error, context)
    throw error
  })
}

export function createErrorHandler(context?: Record<string, any>) {
  return (error: Error) => {
    errorService.logError(error, context)
    return errorService.getUserFriendlyMessage(error)
  }
}