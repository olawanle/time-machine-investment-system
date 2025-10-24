"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AsyncWrapper, useAsyncState } from "@/components/ui/async-wrapper"
import type { TimeMachine, User } from "@/lib/storage"
import type { BaseComponentProps } from "@/lib/component-interfaces"
import { formatCurrency, formatTime } from "@/lib/utils"
import { Zap, CheckCircle2, TrendingUp, Clock, DollarSign, Activity } from "lucide-react"

interface TimeMachineCardProps extends BaseComponentProps {
  machine: TimeMachine
  user: User
  onClaim: (machineId: string) => Promise<void>
  onUpdate: (user: User) => void
}

export function TimeMachineCard({ machine, user, onClaim, onUpdate, className }: TimeMachineCardProps) {
  const [timeUntilClaim, setTimeUntilClaim] = useState(0)
  const [progress, setProgress] = useState(0)
  const { state, setLoading, setError, reset } = useAsyncState()

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastClaim = now - machine.lastClaimedAt
      const timeRemaining = Math.max(0, machine.claimIntervalMs - timeSinceLastClaim)

      setTimeUntilClaim(timeRemaining)
      setProgress(((machine.claimIntervalMs - timeRemaining) / machine.claimIntervalMs) * 100)
    }, 100)

    return () => clearInterval(interval)
  }, [machine])

  const canClaim = timeUntilClaim === 0

  const handleClaim = async () => {
    if (!canClaim) return
    
    try {
      setLoading(true, "Claiming reward...")
      await onClaim(machine.id)
      reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to claim reward")
    }
  }

  const portfolioImages = [
    "/futuristic-time-machine-car.jpg",
    "/cyan-glowing-time-machine-device.jpg",
    "/robot-time-machine.jpg",
    "/advanced-time-machine-technology.jpg",
    "/holographic-time-machine.jpg",
  ]

  const getPortfolioType = (level: number) => {
    const types = [
      "Conservative Growth",
      "Balanced Portfolio", 
      "Aggressive Growth",
      "High-Yield Strategy",
      "Premium Investment"
    ]
    return types[level - 1] || "Investment Strategy"
  }

  const getRiskLevel = (level: number) => {
    const risks = ["Low", "Low-Medium", "Medium", "Medium-High", "High"]
    return risks[level - 1] || "Medium"
  }

  return (
    <Card className="glass glow-cyan overflow-hidden hover:border-cyan-400/50 transition-all duration-300 group">
      <div className="h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center overflow-hidden relative">
        <img
          src={portfolioImages[machine.level - 1] || portfolioImages[0]}
          alt={`Portfolio ${machine.level}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-xs font-semibold text-white">
            {getRiskLevel(machine.level)} Risk
          </span>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Portfolio #{machine.level}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{getPortfolioType(machine.level)}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold gradient-text-cyan">{formatCurrency(machine.rewardAmount)}</div>
            <p className="text-xs text-muted-foreground">projected return</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next Payout In:</span>
            <span className={`font-semibold ${canClaim ? "text-green-400" : "text-cyan-400"}`}>
              {formatTime(timeUntilClaim)}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 transition-all duration-100 shadow-lg shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleClaim}
          disabled={!canClaim}
          className={`w-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            canClaim
              ? "btn-secondary hover:shadow-lg hover:shadow-cyan-500/50"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {canClaim ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Collect Returns
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Processing
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-2 pt-3 border-t border-border/50">
          <div className="flex justify-between">
            <span>Payout Cycle:</span>
            <span className="text-cyan-400">{formatTime(machine.claimIntervalMs)}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={machine.isActive ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
              {machine.isActive ? "🟢 Active" : "🔴 Inactive"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Risk Level:</span>
            <span className="text-cyan-400 font-semibold">{getRiskLevel(machine.level)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}