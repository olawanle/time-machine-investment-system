"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import type { ErrorMessage } from "@/lib/error-messages"

interface Toast extends ErrorMessage {
  id: string
  timestamp: number
  autoClose?: boolean
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: ErrorMessage, options?: { autoClose?: boolean; duration?: number }) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: ErrorMessage, options?: { autoClose?: boolean; duration?: number }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const toast: Toast = {
      ...message,
      id,
      timestamp: Date.now(),
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? (message.severity === 'error' ? 8000 : 5000)
    }

    setToasts(prev => {
      const newToasts = [toast, ...prev].slice(0, maxToasts)
      return newToasts
    })

    // Auto-remove toast after duration
    if (toast.autoClose) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => removeToast(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.severity) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'error':
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />
    }
  }

  const getColorClasses = () => {
    switch (toast.severity) {
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-100'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100'
      case 'error':
      case 'critical':
        return 'bg-red-500/10 border-red-500/20 text-red-100'
      default:
        return 'bg-green-500/10 border-green-500/20 text-green-100'
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 ease-out",
        getColorClasses(),
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            
            {toast.suggestion && (
              <p className="text-xs opacity-75 mt-2">{toast.suggestion}</p>
            )}
            
            {toast.action && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 h-6 px-2 text-xs hover:bg-white/10"
                onClick={() => {
                  // Handle action click
                  console.log('Toast action clicked:', toast.action)
                  handleClose()
                }}
              >
                {toast.action}
              </Button>
            )}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/10"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Progress bar for auto-close */}
      {toast.autoClose && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white/40 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `toast-progress ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Utility hooks for common toast patterns
export function useErrorToast() {
  const { addToast } = useToast()
  
  return useCallback((error: Error | string, context?: string) => {
    const message = typeof error === 'string' ? error : error.message
    return addToast({
      title: 'Error',
      message,
      severity: 'error',
      suggestion: context ? `Error occurred in: ${context}` : undefined
    })
  }, [addToast])
}

export function useSuccessToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, title = 'Success') => {
    return addToast({
      title,
      message,
      severity: 'info'
    })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, title = 'Warning') => {
    return addToast({
      title,
      message,
      severity: 'warning'
    })
  }, [addToast])
}