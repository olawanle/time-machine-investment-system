"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Award,
  ArrowUpRight,
  Play,
  CheckCircle
} from "lucide-react"
import type { User } from "@/lib/storage"

interface ModernUserDashboardProps {
  user: User
  onNavigate: (section: string) => void
}

export function ModernUserDashboard({ user, onNavigate }: ModernUserDashboardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const machines = user.machines || []
  const totalInvested = user.totalInvested || 0
  const totalEarned = user.totalEarned || 0
  const roi = totalInvested > 0 ? ((totalEarned / totalInvested) * 100) : 0
  const activeMachines = machines.filter(m => m.isActive).length

  const getTimeUntilClaim = (machine: any) => {
    const nextClaim = machine.lastClaimedAt + machine.claimIntervalMs
    const timeRemaining = Math.max(0, nextClaim - currentTime)
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    return { minutes, seconds, canClaim: timeRemaining === 0 }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.username}
          </h1>
          <p className="text-slate-400">Your investment portfolio is performing well</p>
        </div>
        <Button 
          onClick={() => onNavigate('marketplace')}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Play className="w-4 h-4 mr-2" />
          Buy Time Machine
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Available
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-white">${user.claimedBalance.toFixed(2)}</p>
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Ready to withdraw
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Lifetime
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-white">${totalEarned.toFixed(2)}</p>
            <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
              {roi.toFixed(1)}% ROI
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Total
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mb-1">Total Invested</p>
            <p className="text-3xl font-bold text-white">${totalInvested.toFixed(2)}</p>
            <p className="text-xs text-purple-400 mt-2">
              Capital deployed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Active
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mb-1">Time Machines</p>
            <p className="text-3xl font-bold text-white">{activeMachines}</p>
            <p className="text-xs text-yellow-400 mt-2">
              {machines.length} total owned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Time Machines */}
      {machines.length > 0 ? (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Your Time Machines
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage and claim rewards from your active machines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {machines.map((machine) => {
              const timeInfo = getTimeUntilClaim(machine)
              const earningProgress = machine.maxEarnings > 0 
                ? (machine.currentEarnings / machine.maxEarnings) * 100 
                : 0

              return (
                <div 
                  key={machine.id} 
                  className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{machine.icon || '⏰'}</div>
                      <div>
                        <h3 className="font-semibold text-white">{machine.name}</h3>
                        <p className="text-xs text-slate-400">{machine.description}</p>
                      </div>
                    </div>
                    <Badge className={timeInfo.canClaim 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }>
                      {timeInfo.canClaim ? 'Ready' : `${timeInfo.minutes}:${timeInfo.seconds.toString().padStart(2, '0')}`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-slate-900/50 rounded">
                      <p className="text-xs text-slate-400">Investment</p>
                      <p className="text-sm font-semibold text-white">${machine.investmentAmount}</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded">
                      <p className="text-xs text-slate-400">Per Claim</p>
                      <p className="text-sm font-semibold text-cyan-400">${machine.rewardAmount}</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded">
                      <p className="text-xs text-slate-400">ROI</p>
                      <p className="text-sm font-semibold text-green-400">{machine.roiPercentage?.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Earnings Progress</span>
                      <span className="text-cyan-400 font-medium">
                        ${machine.currentEarnings.toFixed(2)} / ${machine.maxEarnings.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={earningProgress} className="h-2" />
                  </div>

                  {timeInfo.canClaim && (
                    <Button 
                      className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Claim ${machine.rewardAmount}
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-4">
              <Clock className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Time Machines Yet</h3>
            <p className="text-slate-400 mb-6">
              Start earning passive income by purchasing your first time machine
            </p>
            <Button 
              onClick={() => onNavigate('marketplace')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Browse Time Machines
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white">View Analytics</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Track your investment performance</p>
            <Button 
              onClick={() => onNavigate('analytics')} 
              variant="outline" 
              size="sm"
              className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">Invite Friends</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Earn bonus rewards for referrals</p>
            <Button 
              onClick={() => onNavigate('referrals')} 
              variant="outline" 
              size="sm"
              className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              Get Referral Link
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 backdrop-blur-sm cursor-pointer hover:border-green-500/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Wallet className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Withdraw Funds</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Transfer earnings to your wallet</p>
            <Button 
              onClick={() => onNavigate('wallet')} 
              variant="outline" 
              size="sm"
              className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              Withdraw Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
