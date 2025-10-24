/**
 * Common interfaces for component standardization
 */

import type { ReactNode } from "react"

// Base component props that all components should support
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

// Loading state interface for async components
export interface LoadingState {
  isLoading: boolean
  loadingText?: string
}

// Error state interface for components that can fail
export interface ErrorState {
  error: string | null
  onRetry?: () => void
}

// Combined async component state
export interface AsyncComponentState extends LoadingState, ErrorState {}

// Props for components that handle async operations
export interface AsyncComponentProps extends BaseComponentProps {
  loading?: LoadingState
  error?: ErrorState
}

// User interaction callback types
export interface UserCallbacks {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
  onLoading?: (isLoading: boolean) => void
}

// Standard component state for forms and interactive elements
export interface ComponentState {
  isSubmitting: boolean
  error: string | null
  success: string | null
}

// Props for components that need user feedback
export interface FeedbackComponentProps extends BaseComponentProps {
  state?: ComponentState
  callbacks?: UserCallbacks
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Props for components with validation
export interface ValidatedComponentProps extends BaseComponentProps {
  validation?: ValidationResult
  onValidationChange?: (result: ValidationResult) => void
}