"use client"

import { Component, ReactNode } from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { AlertTriangle, RefreshCw, Bug, Wifi, Shield } from "lucide-react"

// Error categories for better handling
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

interface ErrorInfo {
  category: ErrorCategory
  isRecoverable: boolean
  userMessage: string
  technicalMessage: string
  retryCount: number
  maxRetries: number
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  maxRetries?: number
  onError?: (error: Error, errorInfo: any) => void
  category?: ErrorCategory
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = []

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorInfo = ErrorBoundary.categorizeError(error)
    return { 
      hasError: true, 
      error,
      errorInfo
    }
  }

  static categorizeError(error: Error): ErrorInfo {
    let category = ErrorCategory.UNKNOWN
    let isRecoverable = false
    let userMessage = "An unexpected error occurred"
    let maxRetries = 0

    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection')) {
      category = ErrorCategory.NETWORK
      isRecoverable = true
      userMessage = "Connection problem. Please check your internet connection."
      maxRetries = 3
    }
    // Validation errors
    else if (error.message.includes('validation') || error.message.includes('invalid')) {
      category = ErrorCategory.VALIDATION
      isRecoverable = false
      userMessage = "Invalid data provided. Please check your input."
    }
    // Business logic errors
    else if (error.message.includes('insufficient') || error.message.includes('limit') || error.message.includes('unauthorized')) {
      category = ErrorCategory.BUSINESS_LOGIC
      isRecoverable = false
      userMessage = error.message
    }
    // System errors
    else if (error.message.includes('system') || error.message.includes('server')) {
      category = ErrorCategory.SYSTEM
      isRecoverable = true
      userMessage = "System temporarily unavailable. Please try again."
      maxRetries = 2
    }

    return {
      category,
      isRecoverable,
      userMessage,
      technicalMessage: error.message,
      retryCount: 0,
      maxRetries
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error details for debugging
    this.logError(error, errorInfo)
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
  }

  private logError(error: Error, errorInfo: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
      console.error('Production error:', logData)
    } else {
      console.error('Development error:', logData)
    }
  }

  private handleRetry = () => {
    const { errorInfo, retryCount } = this.state
    const maxRetries = this.props.maxRetries || errorInfo?.maxRetries || 0

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }))

      // Add exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
      const timeout = setTimeout(() => {
        // Force re-render after delay
        this.forceUpdate()
      }, delay)
      
      this.retryTimeouts.push(timeout)
    }
  }

  private getErrorIcon(category: ErrorCategory) {
    switch (category) {
      case ErrorCategory.NETWORK:
        return <Wifi className="w-6 h-6 text-red-400" />
      case ErrorCategory.VALIDATION:
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      case ErrorCategory.BUSINESS_LOGIC:
        return <Shield className="w-6 h-6 text-red-400" />
      case ErrorCategory.SYSTEM:
        return <Bug className="w-6 h-6 text-red-400" />
      default:
        return <AlertTriangle className="w-6 h-6 text-red-400" />
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, retryCount } = this.state
      const maxRetries = this.props.maxRetries || errorInfo?.maxRetries || 0
      const canRetry = errorInfo?.isRecoverable && retryCount < maxRetries

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
          <Card className="glass border-red-500/20 max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                {errorInfo ? this.getErrorIcon(errorInfo.category) : <AlertTriangle className="w-6 h-6 text-red-400" />}
              </div>
              <CardTitle className="text-white">
                {errorInfo?.category === ErrorCategory.NETWORK ? "Connection Problem" :
                 errorInfo?.category === ErrorCategory.VALIDATION ? "Invalid Input" :
                 errorInfo?.category === ErrorCategory.BUSINESS_LOGIC ? "Action Not Allowed" :
                 errorInfo?.category === ErrorCategory.SYSTEM ? "System Error" :
                 "Something went wrong"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-center">
                {errorInfo?.userMessage || "We encountered an unexpected error. Please try refreshing the page."}
              </p>
              
              {retryCount > 0 && (
                <div className="text-center text-sm text-yellow-400">
                  Retry attempt {retryCount} of {maxRetries}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry ? (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({maxRetries - retryCount} attempts left)
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Dismiss Error
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                  <summary className="cursor-pointer">Error Details</summary>
                  <div className="mt-2 space-y-2">
                    <div><strong>Category:</strong> {errorInfo?.category}</div>
                    <div><strong>Recoverable:</strong> {errorInfo?.isRecoverable ? 'Yes' : 'No'}</div>
                    <div><strong>Technical Message:</strong> {errorInfo?.technicalMessage}</div>
                    <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}