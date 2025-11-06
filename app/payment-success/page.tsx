"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, ArrowRight, Wallet } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'confirmed' | 'error'>('checking')
  const [message, setMessage] = useState('Verifying your payment...')
  const [amount, setAmount] = useState<number | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setStatus('error')
      setMessage('No payment session found. Please check your account balance.')
      return
    }

    // Verify the Stripe payment session
    const verifyPayment = async () => {
      try {
        // Get user from localStorage
        const currentUserId = localStorage.getItem('chronostime_current_user')
        
        if (!currentUserId) {
          setStatus('error')
          setMessage('User session not found. Please log in again.')
          return
        }

        const response = await fetch('/api/payments/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: currentUserId
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          const paymentAmount = result.session.amount_total / 100 // Convert from cents
          setAmount(paymentAmount)
          setStatus('confirmed')
          setMessage(`Payment confirmed! $${paymentAmount.toFixed(2)} has been added to your account.`)
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard?payment=success')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Payment verification failed. Please contact support.')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setStatus('error')
        setMessage('Failed to verify payment. Please contact support.')
      }
    }

    // Verify payment immediately
    verifyPayment()
  }, [searchParams, router])

  const getIcon = () => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-16 h-16 text-green-500" />
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
      case 'checking':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'confirmed' ? 'Payment Successful!' : 
             status === 'checking' ? 'Verifying Payment...' : 'Payment Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className={`text-lg ${getStatusColor()}`}>
            {message}
          </p>

          {status === 'confirmed' && amount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Balance Updated</span>
              </div>
              <p className="text-sm text-green-700">
                ${amount.toFixed(2)} has been successfully added to your ChronosTime account.
              </p>
              <p className="text-xs text-green-600 mt-2">
                Redirecting to your dashboard in a few seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                If you believe this is an error, please contact support with your session ID.
              </p>
              {searchParams.get('session_id') && (
                <code className="bg-red-100 px-2 py-1 rounded text-xs mt-2 block">
                  {searchParams.get('session_id')}
                </code>
              )}
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
            
            {status === 'confirmed' && (
              <Button 
                variant="outline"
                onClick={() => router.push('/marketplace')}
                className="w-full"
              >
                Browse Time Machines
              </Button>
            )}

            {status === 'error' && (
              <Button 
                variant="outline"
                onClick={() => router.push('/balance-topup')}
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Payments are processed securely through Stripe.</p>
            <p>Your balance updates instantly after successful payment.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="w-16 h-16 text-blue-500 animate-pulse" />
            </div>
            <CardTitle className="text-2xl">Loading Payment Status...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-blue-600">Please wait while we check your payment status.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}