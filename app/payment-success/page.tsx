"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'confirmed' | 'pending' | 'error'>('checking')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    // Get payment info from URL params or localStorage
    const amount = searchParams.get('amount') || localStorage.getItem('pending_payment_amount')
    const userEmail = localStorage.getItem('pending_payment_user_email')
    
    if (!amount || !userEmail) {
      setStatus('error')
      setMessage('Payment information not found. Please check your account balance.')
      return
    }

    // Start checking for payment confirmation
    const checkPayment = async () => {
      try {
        const response = await fetch('/api/payments/check-recent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: userEmail,
            expected_amount: parseFloat(amount),
            since_timestamp: Date.now() - 10 * 60 * 1000 // Check last 10 minutes
          })
        })

        const result = await response.json()

        if (result.status === 'found') {
          setStatus('confirmed')
          setMessage(`Payment confirmed! $${amount} has been added to your account.`)
          
          // Clear stored payment info
          localStorage.removeItem('pending_payment_order_id')
          localStorage.removeItem('pending_payment_amount')
          localStorage.removeItem('pending_payment_user_email')
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard?payment=success')
          }, 3000)
        } else {
          setStatus('pending')
          setMessage(`Payment processing... We're confirming your $${amount} payment.`)
        }
      } catch (error) {
        console.error('Payment check error:', error)
        setStatus('pending')
        setMessage('Checking payment status...')
      }
    }

    // Check immediately
    checkPayment()

    // Then check every 5 seconds
    const interval = setInterval(checkPayment, 5000)

    // Stop checking after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (status === 'checking' || status === 'pending') {
        setStatus('pending')
        setMessage('Payment verification is taking longer than expected. Your balance will update automatically once confirmed.')
      }
    }, 300000) // 5 minutes

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [searchParams, router, status])

  const getIcon = () => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'pending':
      case 'checking':
        return <Clock className="w-16 h-16 text-blue-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600'
      case 'pending':
      case 'checking':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'confirmed' ? 'Payment Confirmed!' : 
             status === 'pending' ? 'Payment Processing' :
             status === 'checking' ? 'Verifying Payment' : 'Payment Status'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className={`text-lg ${getStatusColor()}`}>
            {message}
          </p>

          {status === 'confirmed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Redirecting to your dashboard in a few seconds...
              </p>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                This page will automatically update when your payment is confirmed.
                You can also check your account balance manually.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            {status !== 'confirmed' && (
              <Button 
                variant="outline"
                onClick={() => router.push('/balance-topup')}
                className="w-full"
              >
                Back to Top Up
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>If your balance doesn't update within 30 minutes,</p>
            <p>please contact support with your transaction details.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}