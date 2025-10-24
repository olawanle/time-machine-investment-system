"use client"

import React, { type ReactNode } from "react"
import { LoadingStateComponent } from "./loading-state"
import { ErrorStateComponent } from "./error-state"
import type { AsyncComponentState } from "@/lib/component-interfaces"

interface AsyncWrapperProps extends AsyncComponentState {
  children: ReactNode
  className?: string
  loadingSize?: "sm" | "md" | "lg"
  errorTitle?: string
  showRetry?: boolean
}

export function AsyncWrapper({
  children,
  isLoading,
  loadingText,
  error,
  onRetry,
  className,
  loadingSize = "md",
  errorTitle,
  showRetry = true
}: AsyncWrapperProps) {
  // Show error state if there's an error and not loading
  if (error && !isLoading) {
    return (
      <ErrorStateComponent
        error={error}
        onRetry={onRetry}
        className={className}
        title={errorTitle}
        showRetry={showRetry}
      />
    )
  }

  // Show loading state if loading
  if (isLoading) {
    return (
      <LoadingStateComponent
        isLoading={isLoading}
        loadingText={loadingText}
        className={className}
        size={loadingSize}
      />
    )
  }

  // Show children if no error and not loading
  return <>{children}</>
}

// Hook for managing async component state
export function useAsyncState(initialState?: Partial<AsyncComponentState>) {
  const [state, setState] = React.useState<AsyncComponentState>({
    isLoading: false,
    error: null,
    ...initialState
  })

  const setLoading = (isLoading: boolean, loadingText?: string) => {
    setState(prev => ({ ...prev, isLoading, loadingText, error: null }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }))
  }

  const reset = () => {
    setState({ isLoading: false, error: null })
  }

  return {
    state,
    setLoading,
    setError,
    reset
  }
}

