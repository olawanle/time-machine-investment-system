"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  ExternalLink,
  CreditCard,
  X
} from "lucide-react"

interface BalanceTopupProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function BalanceTopup({ user, onUserUpdate }: BalanceTopupProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Listen for messages from payment iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our payment domain
      if (event.origin !== 'https://checkouts.chronostime.fund' && 
          !event.data?.type?.startsWith('PAYMENT_')) {
        return
      }

      if (event.data.type === 'PAYMENT_SUCCESS') {
        setPaymentStatus({
          type: 'success',
          message: event.data.message || 'Payment successful!'
        })
        
        // Update user data to reflect new balance
        if (onUserUpdate && event.data.balance) {
          const updatedUser = { ...user, balance: event.data.balance }
          onUserUpdate(updatedUser)
        }
        
        // Auto-close modal after showing success
        setTimeout(() => {
          setShowPaymentModal(false)
          setPaymentStatus({ type: null, message: '' })
        }, 3000)
      } else if (event.data.type === 'PAYMENT_ERROR') {
        setPaymentStatus({
          type: 'error',
          message: event.data.message || 'Payment failed'
        })
      } else if (event.data.type === 'CLOSE_PAYMENT_MODAL') {
        setShowPaymentModal(false)
        setPaymentStatus({ type: null, message: '' })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  })

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

              {/* Payment Instructions */}
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Click the "Buy with Crypto" button below</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Complete your payment on the secure CPay checkout page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Your balance will be updated automatically within minutes</span>
                  </li>
                </ol>
              </div>

              {/* CPay Checkout Button */}
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-14 text-lg shadow-lg"
              >
                <Bitcoin className="w-6 h-6 mr-2" />
                Buy with Crypto
                <CreditCard className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by CPay • Instant processing
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
    </div>

    {/* Payment Modal with Iframe */}
    {showPaymentModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-background border border-border rounded-lg w-full max-w-4xl h-[80vh] relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Cryptocurrency Payment</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPaymentModal(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Payment Status */}
          {paymentStatus.type && (
            <div className={`mx-4 mt-4 p-3 rounded-lg border ${
              paymentStatus.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {paymentStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{paymentStatus.message}</span>
              </div>
            </div>
          )}
          
          {/* Payment Iframe */}
          <div className="p-4 h-[calc(100%-80px)]">
            <iframe
              src="https://checkouts.chronostime.fund/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7"
              className="w-full h-full border-0 rounded-lg"
              title="Cryptocurrency Payment"
              allow="payment"
            />
          </div>
          
          {/* Modal Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border rounded-b-lg">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure payment powered by ChronosTime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Balance updates automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  )
}
