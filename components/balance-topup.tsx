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
  CreditCard,
  Shield,
  Clock
} from "lucide-react"

interface BalanceTopupProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function BalanceTopup({ user, onUserUpdate }: BalanceTopupProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleStripeCheckout = async () => {
    try {
      setError("")
      setSuccess("")
      setLoading(true)

      const value = Number(amount)
      if (!value || value < 10) {
        setError("Enter a valid amount (minimum $10)")
        return
      }

      if (value > 10000) {
        setError("Maximum amount is $10,000 per transaction")
        return
      }

      // Create Stripe checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: value,
          user_id: user.id,
          user_email: user.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      window.location.href = result.checkout_url

    } catch (e: any) {
      setError(e?.message || 'Unable to start checkout')
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [50, 100, 250, 500, 1000]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Top Up Your Balance
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Add funds to your account securely with Stripe to purchase time machines and start earning passive income.
        </p>
        
        {/* Current Balance */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Current Balance:</span>
          <span className="text-lg font-bold text-primary">${(user.balance || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stripe Payment Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Secure Card Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pay securely with your credit or debit card. Powered by Stripe for maximum security.
              </p>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount (USD)</label>
                <Input
                  type="number"
                  min="10"
                  max="10000"
                  placeholder="Enter amount e.g. 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-background border-border text-lg h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: $10 • Maximum: $10,000 per transaction
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quick Select:</label>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="bg-background/50 hover:bg-primary/10"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Enter the amount you want to add</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Click "Pay with Card" to open secure Stripe checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Complete payment with your card details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span>Your balance updates instantly after payment</span>
                  </li>
                </ol>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="text-sm text-destructive flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              {/* Stripe Checkout Button */}
              <Button 
                onClick={handleStripeCheckout}
                disabled={loading || !amount || Number(amount) < 10}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold h-14 text-lg shadow-lg"
              >
                <CreditCard className="w-6 h-6 mr-2" />
                {loading ? 'Creating Checkout...' : 'Pay with Card'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by Stripe • Instant processing<br/>
                🔒 Your card details are never stored on our servers
              </p>
            </div>

            {/* Supported Payment Methods */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-3">Accepted Payment Methods:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-background/50">Visa</Badge>
                <Badge variant="outline" className="bg-background/50">Mastercard</Badge>
                <Badge variant="outline" className="bg-background/50">American Express</Badge>
                <Badge variant="outline" className="bg-background/50">Discover</Badge>
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
                  <p className="text-sm text-muted-foreground">Add funds to your account using your credit/debit card</p>
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
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-500">Bank-Level Security</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All payments are processed through Stripe's secure infrastructure. Your card details are encrypted and never stored on our servers.
              </p>
            </div>

            {/* Processing Time */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-500">Instant Processing</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your balance will be updated immediately after successful payment. No waiting time required.
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
              Your balance updates instantly after successful payment. There's no waiting time with Stripe payments.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">What payment methods are accepted?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover through Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Is there a minimum or maximum deposit amount?</h4>
            <p className="text-sm text-muted-foreground">
              The minimum deposit is $10 and the maximum is $10,000 per transaction. You can make multiple transactions if needed.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Is my payment information secure?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, all payments are processed through Stripe's secure infrastructure. Your card details are encrypted and never stored on our servers.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">What if my payment fails?</h4>
            <p className="text-sm text-muted-foreground">
              If your payment fails, you'll be redirected back to this page with an error message. You can try again or contact support if the issue persists.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}