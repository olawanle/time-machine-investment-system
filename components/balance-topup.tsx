"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Bitcoin,
  ExternalLink
} from "lucide-react"
import { ManualPaymentConfirm } from "./manual-payment-confirm"
import { IframePayment } from "./iframe-payment"

interface BalanceTopupProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function BalanceTopup({ user, onUserUpdate }: BalanceTopupProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pollingStatus, setPollingStatus] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [showPaymentIframe, setShowPaymentIframe] = useState(false)

  const handleStartCryptoCheckout = () => {
    try {
      setError("")
      const value = Number(amount)
      if (!value || value < 10) {
        setError("Enter a valid amount (min $10)")
        return
      }

      // Generate a unique order ID for tracking
      const generatedOrderId = `topup_${user.id}_${Date.now()}_${value}`
      
      // Store payment info for tracking
      setOrderId(generatedOrderId)
      localStorage.setItem('pending_payment_order_id', generatedOrderId)
      localStorage.setItem('pending_payment_amount', amount)
      localStorage.setItem('pending_payment_user_email', user.email)
      
      // Show iframe payment instead of opening new window
      setShowPaymentIframe(true)
      
      // Start polling for payment status
      startPaymentPolling(generatedOrderId)
      
      setPollingStatus(`Complete your $${value} payment below. Your balance will update automatically.`)
      
    } catch (e: any) {
      setError(e?.message || 'Unable to start checkout')
    }
  }

  const startPaymentPolling = (orderIdToCheck: string) => {
    setPollingStatus('Waiting for payment confirmation...')
    const expectedAmount = localStorage.getItem('pending_payment_amount')
    const startTime = Date.now()
    
    const pollInterval = setInterval(async () => {
      try {
        // Check for recent payments for this user
        const response = await fetch('/api/payments/check-recent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            user_email: user.email,
            expected_amount: expectedAmount ? parseFloat(expectedAmount) : null,
            since_timestamp: startTime
          })
        })
        
        const result = await response.json()
        
        if (result.status === 'found') {
          clearInterval(pollInterval)
          setPollingStatus('Payment confirmed! Your balance has been updated.')
          
          // Clear stored payment info
          localStorage.removeItem('pending_payment_order_id')
          localStorage.removeItem('pending_payment_amount')
          localStorage.removeItem('pending_payment_user_email')
          
          // Update user balance in UI
          const updatedUser = { ...user, balance: result.new_balance }
          onUserUpdate(updatedUser)
          
          // Show success message and hide iframe
          setTimeout(() => {
            setPollingStatus(null)
            setOrderId(null)
            setAmount("")
            setShowPaymentIframe(false)
          }, 3000)
          
        } else if (result.status === 'pending') {
          setPollingStatus(`Payment processing... Checking for $${expectedAmount} payment.`)
        }
        
      } catch (pollError) {
        console.error('Polling error:', pollError)
        setPollingStatus('Checking for payment confirmation...')
      }
    }, 8000) // Poll every 8 seconds (less frequent since we're checking recent payments)
    
    // Stop polling after 15 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (pollingStatus && pollingStatus.includes('Waiting')) {
        setPollingStatus('Payment verification taking longer than expected. Use manual confirmation below if you completed the payment.')
      }
    }, 900000) // 15 minutes
  }

  // Check for pending payments on component mount
  React.useEffect(() => {
    const pendingOrderId = localStorage.getItem('pending_payment_order_id')
    if (pendingOrderId) {
      setOrderId(pendingOrderId)
      setShowPaymentIframe(true)
      startPaymentPolling(pendingOrderId)
    }
  }, [])

  // Handle iframe messages for payment completion
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from CPay domain
      if (event.origin !== 'https://checkouts.cpay.world') {
        return
      }

      if (event.data.type === 'payment_completed') {
        console.log('Payment completed in iframe:', event.data)
        setPollingStatus('Payment completed! Verifying and updating your balance...')
        
        // Force a status check
        if (orderId) {
          setTimeout(() => {
            startPaymentPolling(orderId)
          }, 2000)
        }
      } else if (event.data.type === 'payment_cancelled') {
        console.log('Payment cancelled in iframe')
        setShowPaymentIframe(false)
        setPollingStatus(null)
        setError('Payment was cancelled. Please try again.')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [orderId])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Top Up Your Balance
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Add funds to your account using cryptocurrency to purchase time machines and start earning passive income.
        </p>
        
        {/* Current Balance */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Current Balance:</span>
          <span className="text-lg font-bold text-primary">${(user.balance || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Enhanced Iframe Payment Section */}
      {showPaymentIframe && orderId && (
        <div className="mb-8">
          <IframePayment
            amount={amount}
            orderId={orderId}
            user={user}
            onPaymentComplete={(success, creditedAmount) => {
              if (success && creditedAmount) {
                setPollingStatus(`Payment completed! $${creditedAmount} has been added to your balance.`)
                
                // Update user balance in UI
                const updatedUser = { ...user, balance: (user.balance || 0) + creditedAmount }
                onUserUpdate(updatedUser)
                
                // Clear payment state
                setTimeout(() => {
                  setShowPaymentIframe(false)
                  setPollingStatus(null)
                  setOrderId(null)
                  setAmount("")
                  
                  // Clear stored payment info
                  localStorage.removeItem('pending_payment_order_id')
                  localStorage.removeItem('pending_payment_amount')
                  localStorage.removeItem('pending_payment_user_email')
                }, 3000)
              } else {
                setError('Payment failed. Please try again or use manual confirmation.')
              }
            }}
            onClose={() => {
              setShowPaymentIframe(false)
              setPollingStatus(null)
              setError('Payment cancelled. You can try again anytime.')
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Payment Confirmation - Show if there's a pending payment or user needs it */}
        {(orderId || pollingStatus) && (
          <div className="lg:col-span-2">
            <ManualPaymentConfirm user={user} onUserUpdate={onUserUpdate} />
          </div>
        )}
        {/* CPay Checkout Card */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              Cryptocurrency Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Buy crypto securely and add funds to your ChronosTime account instantly.
              </p>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount (USD)</label>
                <Input
                  type="number"
                  min="10"
                  placeholder="Enter amount e.g. 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              {/* Payment Instructions */}
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Click "Buy with Crypto" to open secure checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Complete payment directly on this page (no redirects)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Your balance updates automatically within seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span>Manual confirmation available if needed</span>
                  </li>
                </ol>
              </div>

              {/* CPay Checkout Button */}
              <div>
                {error && (
                  <div className="mb-3 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                {pollingStatus && (
                  <div className="mb-3 text-sm text-blue-600 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <CheckCircle className="w-4 h-4" />
                    {pollingStatus}
                  </div>
                )}
                <Button 
                  onClick={handleStartCryptoCheckout}
                  disabled={!amount || Number(amount) < 10}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-14 text-lg shadow-lg"
                >
                  <Bitcoin className="w-6 h-6 mr-2" />
                  Buy with Crypto
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by CPay • Instant processing<br/>
                💡 Payment opens directly on this page - no redirects needed
              </p>
            </div>

            {/* Supported Cryptocurrencies */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-3">Accepted Cryptocurrencies:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-background/50">Bitcoin (BTC)</Badge>
                <Badge variant="outline" className="bg-background/50">Ethereum (ETH)</Badge>
                <Badge variant="outline" className="bg-background/50">USDT</Badge>
                <Badge variant="outline" className="bg-background/50">And more...</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Top Up Balance</h4>
                  <p className="text-sm text-muted-foreground">Add funds to your account using cryptocurrency</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Purchase Time Machines</h4>
                  <p className="text-sm text-muted-foreground">Use your balance to buy time machines from the marketplace</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Earn Passive Income</h4>
                  <p className="text-sm text-muted-foreground">Time machines generate weekly returns automatically</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Withdraw Profits</h4>
                  <p className="text-sm text-muted-foreground">Withdraw your earnings to your wallet anytime</p>
                </div>
              </div>
            </div>

            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="font-medium text-success">Investment Tips</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with smaller amounts to test the system</li>
                <li>• Diversify across different time machine tiers</li>
                <li>• Reinvest returns to compound your growth</li>
                <li>• Use referral bonuses to maximize earnings</li>
              </ul>
            </div>

            {/* Security Badge */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-500">100% Secure</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All payments are processed through CPay's secure checkout. Your funds will reflect in your account within 5-10 minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-1">How long does it take for my balance to update?</h4>
            <p className="text-sm text-muted-foreground">
              After completing the CPay checkout, your balance will be updated automatically within 5-10 minutes once the blockchain confirms your transaction.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">What cryptocurrencies can I use?</h4>
            <p className="text-sm text-muted-foreground">
              CPay supports Bitcoin, Ethereum, USDT, USDC, and many other popular cryptocurrencies. You'll see all available options on the checkout page.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Is there a minimum deposit amount?</h4>
            <p className="text-sm text-muted-foreground">
              The minimum deposit depends on the cryptocurrency you choose. Typically, it's around $10-20 to ensure the transaction fees don't eat into your deposit.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">What if my payment doesn't show up?</h4>
            <p className="text-sm text-muted-foreground">
              If your balance doesn't update within 30 minutes, please contact our support team with your transaction ID. We'll investigate and credit your account manually if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Payment Confirmation Section */}
      {!orderId && !pollingStatus && (
        <div className="mt-8">
          <ManualPaymentConfirm user={user} onUserUpdate={onUserUpdate} />
        </div>
      )}
    </div>
  )
}

