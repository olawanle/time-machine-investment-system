"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, TrendingUp, Activity, Zap, Award } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { AnimatedCounter } from "./animated-counter"

interface PlatformStats {
  totalUsers: number
  activeUsers24h: number
  totalInvestments: number
  totalRewardsPaid: number
  totalReferrals: number
  averageROI: number
}

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 1247,
    activeUsers24h: 342,
    totalInvestments: 125000,
    totalRewardsPaid: 45230,
    totalReferrals: 523,
    averageROI: 15.5,
  })

  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        activeUsers24h: prev.activeUsers24h + Math.floor(Math.random() * 2),
        totalInvestments: prev.totalInvestments + Math.floor(Math.random() * 100),
        totalRewardsPaid: prev.totalRewardsPaid + Math.floor(Math.random() * 50),
        totalReferrals: prev.totalReferrals + Math.floor(Math.random() * 2),
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="glass glow-cyan relative overflow-hidden">
      {/* Live Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
        <span className="text-xs text-muted-foreground">LIVE</span>
      </div>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Platform Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Users */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              <AnimatedCounter value={stats.totalUsers} />
            </p>
          </div>

          {/* Active Users (24h) */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Active (24h)</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              <AnimatedCounter value={stats.activeUsers24h} />
            </p>
          </div>

          {/* Total Investments */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total Invested</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              <AnimatedCounter value={stats.totalInvestments} prefix="$" />
            </p>
          </div>

          {/* Total Rewards Paid */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Rewards Paid</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              <AnimatedCounter value={stats.totalRewardsPaid} prefix="$" />
            </p>
          </div>

          {/* Total Referrals */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Referrals</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              <AnimatedCounter value={stats.totalReferrals} />
            </p>
          </div>

          {/* Average ROI */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Avg ROI</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              <AnimatedCounter value={stats.averageROI} suffix="%" decimals={1} />
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-xs text-green-300">
            ✓ 99.9% Uptime
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-xs text-blue-300">
            ✓ Instant Payouts
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-xs text-purple-300">
            ✓ 24/7 Support
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

