/**
 * User-friendly error messages and recovery suggestions
 */

export interface ErrorMessage {
  title: string
  message: string
  suggestion?: string
  action?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface ErrorContext {
  operation?: string
  component?: string
  userId?: string
  data?: Record<string, any>
}

export class ErrorMessageService {
  private static instance: ErrorMessageService

  static getInstance(): ErrorMessageService {
    if (!ErrorMessageService.instance) {
      ErrorMessageService.instance = new ErrorMessageService()
    }
    return ErrorMessageService.instance
  }

  /**
   * Get user-friendly error message based on error type and context
   */
  getErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    const errorType = this.categorizeError(error)
    const operation = context?.operation || 'operation'

    switch (errorType) {
      case 'network':
        return this.getNetworkErrorMessage(error, context)
      case 'validation':
        return this.getValidationErrorMessage(error, context)
      case 'authentication':
        return this.getAuthErrorMessage(error, context)
      case 'authorization':
        return this.getAuthorizationErrorMessage(error, context)
      case 'business':
        return this.getBusinessErrorMessage(error, context)
      case 'system':
        return this.getSystemErrorMessage(error, context)
      case 'timeout':
        return this.getTimeoutErrorMessage(error, context)
      default:
        return this.getGenericErrorMessage(error, context)
    }
  }

  /**
   * Get success message for completed operations
   */
  getSuccessMessage(operation: string, context?: ErrorContext): ErrorMessage {
    const messages: Record<string, ErrorMessage> = {
      login: {
        title: 'Welcome back!',
        message: 'You have successfully logged in to your account.',
        severity: 'info'
      },
      register: {
        title: 'Account created!',
        message: 'Your account has been created successfully. Welcome to ChronosTime!',
        severity: 'info'
      },
      investment: {
        title: 'Investment successful!',
        message: 'Your investment has been processed and your time machine is now active.',
        severity: 'info'
      },
      claim: {
        title: 'Reward claimed!',
        message: 'Your reward has been successfully added to your balance.',
        severity: 'info'
      },
      withdrawal: {
        title: 'Withdrawal requested!',
        message: 'Your withdrawal request has been submitted and will be processed within 24 hours.',
        severity: 'info'
      },
      save: {
        title: 'Changes saved!',
        message: 'Your changes have been saved successfully.',
        severity: 'info'
      }
    }

    return messages[operation] || {
      title: 'Success!',
      message: `${operation} completed successfully.`,
      severity: 'info'
    }
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network'
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation'
    }
    if (message.includes('unauthorized') || message.includes('login') || message.includes('password')) {
      return 'authentication'
    }
    if (message.includes('forbidden') || message.includes('permission') || message.includes('access denied')) {
      return 'authorization'
    }
    if (message.includes('insufficient') || message.includes('limit') || message.includes('balance')) {
      return 'business'
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout'
    }
    if (message.includes('server') || message.includes('system') || message.includes('database')) {
      return 'system'
    }

    return 'unknown'
  }

  private getNetworkErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      suggestion: 'Make sure you have a stable internet connection and try again.',
      action: 'Retry',
      severity: 'warning'
    }
  }

  private getValidationErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    const operation = context?.operation || 'operation'
    
    // Extract specific validation errors from message
    if (error.message.includes('email')) {
      return {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        suggestion: 'Check your email format (example@domain.com) and try again.',
        action: 'Fix Email',
        severity: 'warning'
      }
    }
    
    if (error.message.includes('password')) {
      return {
        title: 'Invalid Password',
        message: 'Password does not meet requirements.',
        suggestion: 'Password must be at least 8 characters long and contain letters and numbers.',
        action: 'Update Password',
        severity: 'warning'
      }
    }

    if (error.message.includes('amount')) {
      return {
        title: 'Invalid Amount',
        message: 'Please enter a valid investment amount.',
        suggestion: 'Amount must be between $100 and $10,000.',
        action: 'Adjust Amount',
        severity: 'warning'
      }
    }

    return {
      title: 'Invalid Input',
      message: 'Some information you provided is not valid.',
      suggestion: 'Please check your input and try again.',
      action: 'Review Input',
      severity: 'warning'
    }
  }

  private getAuthErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    if (error.message.includes('password')) {
      return {
        title: 'Incorrect Password',
        message: 'The password you entered is incorrect.',
        suggestion: 'Please check your password and try again.',
        action: 'Try Again',
        severity: 'warning'
      }
    }

    return {
      title: 'Login Failed',
      message: 'Unable to log you in with the provided credentials.',
      suggestion: 'Please check your email and password, then try again.',
      action: 'Try Again',
      severity: 'warning'
    }
  }

  private getAuthorizationErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    return {
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      suggestion: 'Please contact support if you believe this is an error.',
      action: 'Contact Support',
      severity: 'error'
    }
  }

  private getBusinessErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    if (error.message.includes('insufficient')) {
      return {
        title: 'Insufficient Balance',
        message: 'You do not have enough balance for this transaction.',
        suggestion: 'Please add funds to your account or reduce the amount.',
        action: 'Add Funds',
        severity: 'warning'
      }
    }

    if (error.message.includes('limit')) {
      return {
        title: 'Limit Reached',
        message: 'You have reached the maximum limit for this operation.',
        suggestion: 'Please wait before trying again or contact support.',
        action: 'Wait',
        severity: 'warning'
      }
    }

    if (error.message.includes('cooldown')) {
      return {
        title: 'Please Wait',
        message: 'You need to wait before performing this action again.',
        suggestion: 'Please wait for the cooldown period to end.',
        action: 'Wait',
        severity: 'info'
      }
    }

    return {
      title: 'Action Not Allowed',
      message: error.message,
      suggestion: 'Please review the requirements and try again.',
      action: 'Review',
      severity: 'warning'
    }
  }

  private getSystemErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    return {
      title: 'System Error',
      message: 'Our system is temporarily experiencing issues.',
      suggestion: 'Please try again in a few moments. If the problem persists, contact support.',
      action: 'Try Again',
      severity: 'error'
    }
  }

  private getTimeoutErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    return {
      title: 'Request Timeout',
      message: 'The operation took too long to complete.',
      suggestion: 'Please check your connection and try again.',
      action: 'Retry',
      severity: 'warning'
    }
  }

  private getGenericErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred while processing your request.',
      suggestion: 'Please try again. If the problem continues, contact our support team.',
      action: 'Try Again',
      severity: 'error'
    }
  }

  /**
   * Get contextual help message based on current operation
   */
  getHelpMessage(operation: string): ErrorMessage {
    const helpMessages: Record<string, ErrorMessage> = {
      investment: {
        title: 'Investment Help',
        message: 'Investments unlock time machines that generate passive income.',
        suggestion: 'Start with smaller amounts to understand how the system works.',
        severity: 'info'
      },
      withdrawal: {
        title: 'Withdrawal Help',
        message: 'Withdrawals are processed within 24 hours during business days.',
        suggestion: 'Make sure you have sufficient claimed balance before requesting withdrawal.',
        severity: 'info'
      },
      referral: {
        title: 'Referral Help',
        message: 'Share your referral code to earn bonuses when others join.',
        suggestion: 'Your referrals also get bonus rewards when they sign up.',
        severity: 'info'
      }
    }

    return helpMessages[operation] || {
      title: 'Help',
      message: 'Need assistance? Contact our support team.',
      suggestion: 'We are here to help you succeed with your investments.',
      severity: 'info'
    }
  }
}

// Export singleton instance
export const errorMessages = ErrorMessageService.getInstance()

// Utility functions for common scenarios
export function getNetworkErrorMessage(): ErrorMessage {
  return errorMessages.getErrorMessage(new Error('network connection failed'))
}

export function getValidationErrorMessage(field: string): ErrorMessage {
  return errorMessages.getErrorMessage(new Error(`validation failed for ${field}`))
}

export function getSuccessMessage(operation: string): ErrorMessage {
  return errorMessages.getSuccessMessage(operation)
}