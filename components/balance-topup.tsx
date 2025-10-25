"use client"

import { useState } from "react"
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
  ExternalLink
} from "lucide-react"

interface BalanceTopupProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function BalanceTopup({ user, onUserUpdate }: BalanceTopupProps) {
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
              <a
                href="https://checkouts.cpay.world/checkout/fdc3a1a4-cb66-4bfe-a93e-6d32670257fa"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-14 text-lg shadow-lg"
                >
                  <Bitcoin className="w-6 h-6 mr-2" />
                  Buy with Crypto
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>

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
  )
}
