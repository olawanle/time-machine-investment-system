"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

interface ToastProps {
  message: string
  type: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor =
    type === "success"
      ? "bg-green-500/20 border-green-500/30"
      : type === "error"
        ? "bg-red-500/20 border-red-500/30"
        : "bg-blue-500/20 border-blue-500/30"

  const textColor = type === "success" ? "text-green-400" : type === "error" ? "text-red-400" : "text-blue-400"

  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm glass border ${bgColor} rounded-lg p-4 flex items-center gap-3 animate-slide-in z-50`}
    >
      <Icon className={`w-5 h-5 ${textColor} flex-shrink-0`} />
      <p className="text-sm text-foreground flex-1">{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
