"use client"

import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"
import type { LoadingState } from "@/lib/component-interfaces"

interface LoadingStateProps extends LoadingState {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingStateComponent({ 
  isLoading, 
  loadingText = "Loading...", 
  className,
  size = "md" 
}: LoadingStateProps) {
  if (!isLoading) return null

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <LoadingSpinner size={size} text={loadingText} />
    </div>
  )
}

// Higher-order component for adding loading states
export function withLoadingState<T extends object>(
  Component: React.ComponentType<T>,
  loadingProps?: Partial<LoadingStateProps>
) {
  return function LoadingWrapper(props: T & { loading?: LoadingState }) {
    const { loading, ...componentProps } = props

    if (loading?.isLoading) {
      return <LoadingStateComponent {...loading} {...loadingProps} />
    }

    return <Component {...(componentProps as T)} />
  }
}