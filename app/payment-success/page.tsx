"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, ArrowRight, Wallet, Zap } from 'lucide-react'

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
          
          // Force refresh user data from database
          if (result.user) {
            // Update localStorage with fresh user data
            const users = JSON.parse(localStorage.getItem('chronostime_users') || '{}')
            users[result.user.id] = result.user
            localStorage.setItem('chronostime_users', JSON.stringify(users))
            
            // Trigger a storage event to notify other components
            window.dispatchEvent(new Event('storage'))
          }
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
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
        return (
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        )
      case 'checking':
        return (
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
        )
      case 'error':
        return (
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass glow-cyan border-cyan-500/20">
        <CardHeader className="text-center">
          {getIcon()}
          <CardTitle className="text-3xl gradient-text">
            {status === 'confirmed' ? 'Payment Successful!' : 
             status === 'checking' ? 'Verifying Payment...' : 'Payment Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className={`text-lg ${
            status === 'confirmed' ? 'text-green-400' :
            status === 'checking' ? 'text-cyan-400' :
            'text-red-400'
          }`}>
            {message}
          </p>

          {status === 'confirmed' && amount && (
            <div className="glass glow-green p-6 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Wallet className="w-6 h-6 text-green-400" />
                <span className="font-semibold text-green-300 text-lg">Balance Updated</span>
              </div>
              <p className="text-3xl font-bold gradient-text mb-2">
                +${amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">
                Successfully added to your ChronosTime account
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
                <Zap className="w-4 h-4" />
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="glass p-6 rounded-lg border border-red-500/20">
              <p className="text-sm text-gray-400 mb-4">
                If you believe this is an error, please contact support with your session ID.
              </p>
              {searchParams.get('session_id') && (
                <code className="bg-gray-800/50 px-3 py-2 rounded text-xs block break-all text-gray-300">
                  {searchParams.get('session_id')}
                </code>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full btn-primary h-12 text-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            {status === 'confirmed' && (
              <Button 
                variant="outline"
                onClick={() => router.push('/marketplace')}
                className="w-full glass-sm h-12"
              >
                <Zap className="w-5 h-5 mr-2" />
                Browse Time Machines
              </Button>
            )}

            {status === 'error' && (
              <Button 
                variant="outline"
                onClick={() => router.push('/wallet')}
                className="w-full glass-sm h-12"
              >
                Try Again
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>🔒 Payments are processed securely through Stripe</p>
            <p>⚡ Your balance updates instantly after successful payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass glow-cyan">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <CardTitle className="text-3xl gradient-text">Loading Payment Status...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-cyan-400">Please wait while we check your payment status.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
