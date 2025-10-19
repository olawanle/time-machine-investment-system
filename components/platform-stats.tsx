"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, TrendingUp, Activity, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { AnimatedCounter } from "./animated-counter"
import { storage } from "@/lib/storage"

interface PlatformStats {
  totalUsers: number
  totalInvestments: number
  totalReferrals: number
}

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 2547, // Fake but realistic
    totalInvestments: 185000, // Fake but realistic
    totalReferrals: 823, // Fake but realistic
  })

  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Fetch real data and mix with allowed fake metrics
    const fetchStats = async () => {
      const allUsers = await storage.getAllUsers()
      
      // Calculate real metrics
      const realInvested = allUsers.reduce((sum, u) => sum + u.totalInvested, 0)
      
      // Mix real with fake (for the 3 allowed metrics)
      setStats({
        totalUsers: 2547 + allUsers.length, // Fake base + real users
        totalInvestments: 185000 + realInvested, // Fake base + real investments
        totalReferrals: 823 + allUsers.reduce((sum, u) => sum + u.referrals.length, 0), // Fake base + real referrals
      })
    }

    fetchStats()

    // Update every 30 seconds
    const interval = setInterval(fetchStats, 30000)

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
        <div className="grid grid-cols-3 gap-4">
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

          {/* Total Referrals */}
          <div className="glass-sm p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              <AnimatedCounter value={stats.totalReferrals} />
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

