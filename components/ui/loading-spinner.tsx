"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <div className="relative">
        <div className={cn(
          "border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin",
          sizeClasses[size]
        )} />
        <div className={cn(
          "absolute inset-0 border-4 border-transparent border-r-blue-500/40 rounded-full animate-spin",
          sizeClasses[size]
        )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      {text && (
        <p className="text-sm text-cyan-400 animate-pulse">{text}</p>
      )}
    </div>
  )
}