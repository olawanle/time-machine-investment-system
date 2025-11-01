"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bitcoin, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Shield,
  X,
  RefreshCw,
  ExternalLink
} from "lucide-react"

interface IframePaymentProps {
  amount: string
  orderId: string
  user: any
  onPaymentComplete: (success: boolean, amount?: number) => void
  onClose: () => void
}

export function IframePayment({ amount, orderId, user, onPaymentComplete, onClose }: IframePaymentProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'completed' | 'error'>('loading')
  const [message, setMessage] = useState('Loading secure checkout...')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Timer for tracking payment duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle iframe load
  const handleIframeLoad = () => {
    setStatus('ready')
    setMessage('Complete your payment in the secure checkout below')
  }

  // Handle iframe errors
  const handleIframeError = () => {
    setStatus('error')
    setMessage('Failed to load payment checkout. Please try again.')
  }

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from CPay domain
      if (event.origin !== 'https://checkouts.cpay.world') {
        return
      }

      console.log('Received iframe message:', event.data)

      switch (event.data.type) {
        case 'payment_started':
          setStatus('processing')
          setMessage('Processing your payment...')
          break
          
        case 'payment_completed':
        case 'payment_success':
          setStatus('completed')
          setMessage('Payment completed successfully! Updating your balance...')
          onPaymentComplete(true, parseFloat(amount))
          break
          
        case 'payment_failed':
        case 'payment_error':
          setStatus('error')
          setMessage('Payment failed. Please try again or contact support.')
          break
          
        case 'payment_cancelled':
          setStatus('error')
          setMessage('Payment was cancelled.')
          break
          
        default:
          console.log('Unknown message type:', event.data.type)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [amount, onPaymentComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-blue-500'
      case 'ready': return 'text-green-500'
      case 'processing': return 'text-yellow-500'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Card className="w-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-blue-500" />
            Secure Crypto Payment
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              ${amount}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {message}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-background/30 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Amount</div>
            <div className="font-semibold">${amount} USD</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Account</div>
            <div className="font-semibold text-sm">{user.email}</div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="relative">
          <iframe
            ref={iframeRef}
            src="https://checkouts.cpay.world/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7"
            className="w-full h-[500px] border border-border rounded-lg bg-white"
            title="CPay Secure Checkout"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox"
          />
          
          {/* Loading Overlay */}
          {status === 'loading' && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading secure checkout...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {status === 'error' && (
            <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center rounded-lg">
              <div className="text-center p-4">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-700 mb-3">{message}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    onClick={() => {
                      setStatus('loading')
                      setMessage('Reloading checkout...')
                      if (iframeRef.current) {
                        iframeRef.current.src = iframeRef.current.src
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.open('https://checkouts.cpay.world/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7', '_blank')
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="w-4 h-4 text-green-600" />
          <div className="text-sm text-green-700">
            <span className="font-medium">Secure Payment:</span> This checkout is protected by CPay's enterprise security. Your payment information is encrypted and never stored on our servers.
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-2">Payment Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Choose your preferred cryptocurrency</li>
            <li>• Follow the payment instructions in the checkout</li>
            <li>• Your balance will update automatically after confirmation</li>
            <li>• Keep this page open until payment is complete</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel Payment
          </Button>
          <Button
            onClick={() => {
              window.open('https://checkouts.cpay.world/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7', '_blank')
            }}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}