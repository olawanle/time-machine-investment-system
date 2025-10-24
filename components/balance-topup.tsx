"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  DollarSign, 
  CreditCard,
  Bitcoin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  TrendingUp
} from "lucide-react"
import { BitcoinPaymentGateway } from "@/components/bitcoin-payment-gateway"

interface BalanceTopupProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function BalanceTopup({ user, onUserUpdate }: BalanceTopupProps) {
  const [topupAmount, setTopupAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<"bitcoin" | "card" | null>(null)
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false)
  const [pendingTopup, setPendingTopup] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleTopup = async () => {
    setError("")
    setSuccess("")

    const amount = Number.parseFloat(topupAmount)
    if (!amount || amount <= 0) {
      setError("Enter a valid amount")
      return
    }

    if (amount < 10) {
      setError("Minimum top-up amount is $10")
      return
    }

    if (amount > 50000) {
      setError("Maximum top-up amount is $50,000")
      return
    }

    if (selectedMethod === "bitcoin") {
      setPendingTopup(amount)
      setShowBitcoinPayment(true)
      setTopupAmount("")
    } else if (selectedMethod === "card") {
      // Simulate card payment
      const updatedUser = {
        ...user,
        balance: (user.balance || 0) + amount,
        totalInvested: (user.totalInvested || 0) + amount
      }
      onUserUpdate(updatedUser)
      setSuccess(`Successfully added $${amount} to your balance!`)
      setTopupAmount("")
    }
  }

  const handleBitcoinPaymentConfirmed = async (transaction: any) => {
    setError("")
    setSuccess("")

    if (!pendingTopup) return

    const amount = pendingTopup
    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + amount,
      totalInvested: (user.totalInvested || 0) + amount
    }

    try {
      await onUserUpdate(updatedUser)
      setSuccess(`Successfully added $${amount} to your balance via Bitcoin!`)
      setShowBitcoinPayment(false)
      setPendingTopup(null)
    } catch (error) {
      setError("Failed to update balance. Please try again.")
    }
  }

  const handleBitcoinPaymentFailed = () => {
    setError("Bitcoin payment failed. Please try again.")
    setShowBitcoinPayment(false)
    setPendingTopup(null)
  }

  const quickAmounts = [50, 100, 250, 500, 1000, 2500]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Top Up Your Balance
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Add funds to your account to purchase time machines and start earning passive income.
        </p>
        
        {/* Current Balance */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Current Balance:</span>
          <span className="text-lg font-bold text-primary">${(user.balance || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top-up Form */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount ($)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="bg-background border-border text-lg"
                min="10"
                max="50000"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quick Amounts</label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setTopupAmount(amount.toString())}
                    className="hover:bg-primary/10"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={selectedMethod === "bitcoin" ? "default" : "outline"}
                  onClick={() => setSelectedMethod("bitcoin")}
                  className="justify-start h-12"
                >
                  <Bitcoin className="w-5 h-5 mr-3 text-warning" />
                  <div className="text-left">
                    <div className="font-medium">Bitcoin (Cryptocurrency)</div>
                    <div className="text-xs text-muted-foreground">Secure, fast, and anonymous</div>
                  </div>
                </Button>

                <Button
                  variant={selectedMethod === "card" ? "default" : "outline"}
                  onClick={() => setSelectedMethod("card")}
                  className="justify-start h-12"
                >
                  <CreditCard className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-xs text-muted-foreground">Instant processing (Demo mode)</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            {/* Top-up Button */}
            <Button
              onClick={handleTopup}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold h-12"
              disabled={!topupAmount || !selectedMethod || Number(topupAmount) < 10}
            >
              <Wallet className="w-5 h-5 mr-2" />
              {selectedMethod === "bitcoin" ? "Proceed to Bitcoin Payment" : "Add Funds"}
            </Button>

            {/* Info */}
            <div className="text-xs text-muted-foreground text-center">
              Minimum: $10 • Maximum: $50,000
            </div>
          </CardContent>
        </Card>

        {/* Bitcoin Payment Gateway */}
        {showBitcoinPayment && pendingTopup && (
          <BitcoinPaymentGateway
            amount={pendingTopup}
            onPaymentConfirmed={handleBitcoinPaymentConfirmed}
            onPaymentFailed={handleBitcoinPaymentFailed}
          />
        )}

        {/* Info Card */}
        {!showBitcoinPayment && (
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
                    <p className="text-sm text-muted-foreground">Add funds to your account using Bitcoin or card</p>
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps */}
      {success && (
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Balance Updated Successfully!</h3>
                <p className="text-muted-foreground">
                  Your account has been credited. You can now purchase time machines from the marketplace.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Marketplace
                </Button>
                <Button variant="outline">
                  View Portfolio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
