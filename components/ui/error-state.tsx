"use client"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import type { ErrorState } from "@/lib/component-interfaces"

interface ErrorStateProps extends ErrorState {
  className?: string
  title?: string
  showRetry?: boolean
}

export function ErrorStateComponent({ 
  error, 
  onRetry,
  className,
  title = "Something went wrong",
  showRetry = true
}: ErrorStateProps) {
  if (!error) return null

  return (
    <Card className={cn("border-destructive/20 bg-destructive/5", className)}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mb-2 font-semibold text-destructive">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{error}</p>
        {showRetry && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Higher-order component for adding error states
export function withErrorState<T extends object>(
  Component: React.ComponentType<T>,
  errorProps?: Partial<ErrorStateProps>
) {
  return function ErrorWrapper(props: T & { error?: ErrorState }) {
    const { error, ...componentProps } = props

    if (error?.error) {
      return <ErrorStateComponent {...error} {...errorProps} />
    }

    return <Component {...(componentProps as T)} />
  }
}