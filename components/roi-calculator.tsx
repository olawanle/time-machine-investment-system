"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function ROICalculator() {
  const [investment, setInvestment] = useState("")
  const [duration, setDuration] = useState("30")
  const [result, setResult] = useState<{
    total: number
    profit: number
    roi: number
  } | null>(null)

  const calculateROI = () => {
    const amount = parseFloat(investment) || 0
    const days = parseInt(duration) || 30

    if (amount <= 0) {
      return
    }

    // Base APY: 15% annual
    const baseAPY = 0.15
    const dailyRate = baseAPY / 365

    // Bonus multipliers based on investment size
    let multiplier = 1
    if (amount >= 1000) multiplier = 1.5
    else if (amount >= 500) multiplier = 1.3
    else if (amount >= 200) multiplier = 1.2
    else if (amount >= 100) multiplier = 1.1

    // Calculate compound interest
    const total = amount * Math.pow(1 + dailyRate * multiplier, days)
    const profit = total - amount
    const roiPercent = (profit / amount) * 100

    setResult({
      total: Math.round(total * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      roi: Math.round(roiPercent * 100) / 100,
    })
  }

  return (
    <Card className="glass glow-cyan">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Investment Amount
            </label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="glass-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Duration (Days)
            </label>
            <div className="flex gap-2">
              {["7", "30", "60", "90"].map((days) => (
                <Button
                  key={days}
                  onClick={() => setDuration(days)}
                  variant={duration === days ? "default" : "outline"}
                  size="sm"
                  className={duration === days ? "btn-primary" : "glass-sm"}
                >
                  {days}d
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Custom days"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="glass-sm"
            />
          </div>
        </div>

        <Button onClick={calculateROI} className="w-full btn-primary">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Returns
        </Button>

        {/* Results Section */}
        {result && (
          <div className="space-y-3 animate-fade-in">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-sm p-3 rounded-lg text-center space-y-1">
                <p className="text-xs text-muted-foreground">Total Return</p>
                <p className="text-lg font-bold text-cyan-400">
                  {formatCurrency(result.total)}
                </p>
              </div>
              <div className="glass-sm p-3 rounded-lg text-center space-y-1">
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="text-lg font-bold text-green-400">
                  +{formatCurrency(result.profit)}
                </p>
              </div>
              <div className="glass-sm p-3 rounded-lg text-center space-y-1">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="text-lg font-bold text-yellow-400">
                  {result.roi}%
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="glass-sm p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial Investment:</span>
                <span className="font-semibold">{formatCurrency(parseFloat(investment))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{duration} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Compound:</span>
                <span className="font-semibold text-green-400">✓ Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus Multiplier:</span>
                <span className="font-semibold text-cyan-400">
                  {parseFloat(investment) >= 1000 ? "1.5x" :
                   parseFloat(investment) >= 500 ? "1.3x" :
                   parseFloat(investment) >= 200 ? "1.2x" :
                   parseFloat(investment) >= 100 ? "1.1x" : "1.0x"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="glass-sm p-3 rounded-lg text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            Base APY: 15% with daily compound interest
          </p>
          <p>• Invest $100+: 1.1x multiplier</p>
          <p>• Invest $200+: 1.2x multiplier</p>
          <p>• Invest $500+: 1.3x multiplier</p>
          <p>• Invest $1000+: 1.5x multiplier</p>
        </div>
      </CardContent>
    </Card>
  )
}

