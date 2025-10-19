"use client"

import { useState, useEffect } from "react"
import { type User, storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TimeMachineCard } from "./time-machine-card"
import { Marketplace } from "./marketplace"
import { Referrals } from "./referrals"
import { Settings } from "./settings"
import { Navigation } from "./navigation"
import { AnimatedStatCard } from "./animated-stat-card"
import { AnimatedCounter } from "./animated-counter"
import { TimeMachine3D } from "./time-machine-3d"
import { DailySpinWheel } from "./daily-spin-wheel"
import { Achievements } from "./achievements"
import { Leaderboard } from "./leaderboard"
import { PlatformStats } from "./platform-stats"
import { ROICalculator } from "./roi-calculator"
import { formatCurrency, generateId } from "@/lib/utils"
import { successConfetti } from "@/lib/confetti"
import type { TimeMachine } from "@/lib/storage"
import { TrendingUp, Zap, Users, Clock, Lightbulb, Award, ArrowUpRight } from "lucide-react"

interface DashboardProps {
  user: User
  onLogout: () => void
  currentView: string
  onNavigate: (view: string) => void
  onNavigateToAdmin: () => void
}

export function Dashboard({ user: initialUser, onLogout, currentView, onNavigate, onNavigateToAdmin }: DashboardProps) {
  const [user, setUser] = useState(initialUser)
  const [investAmount, setInvestAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{ title: string; description: string; action: string }>>([])

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentUser = await storage.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        generateSuggestions(currentUser)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const generateSuggestions = (currentUser: User) => {
    const newSuggestions = []

    if (currentUser.machines.length < 5) {
      newSuggestions.push({
        title: "Unlock More Machines",
        description: `You have ${5 - currentUser.machines.length} slots available. Invest to maximize earnings.`,
        action: "Invest Now",
      })
    }

    if (
      currentUser.claimedBalance > 100 &&
      (Date.now() - currentUser.lastWithdrawalDate) / (1000 * 60 * 60 * 24) > 12
    ) {
      newSuggestions.push({
        title: "Withdraw Your Earnings",
        description: `You have ${formatCurrency(currentUser.claimedBalance)} ready to withdraw.`,
        action: "Withdraw",
      })
    }

    if (currentUser.referrals.length < 5) {
      newSuggestions.push({
        title: "Grow Your Network",
        description: `Invite ${5 - currentUser.referrals.length} more friends to unlock bonus machines.`,
        action: "Share Referral",
      })
    }

    if (currentUser.balance < 500) {
      newSuggestions.push({
        title: "Boost Your Portfolio",
        description: "Increase your investment to unlock higher-tier machines with better returns.",
        action: "Invest More",
      })
    }

    setSuggestions(newSuggestions.slice(0, 3))
  }

  const handleDailySpin = async (reward: number) => {
    const updatedUser = { ...user }
    // Store discount percentage for future use
    updatedUser.lastSpinDate = Date.now()
    updatedUser.totalSpins = (updatedUser.totalSpins || 0) + 1
    
    await storage.saveUser(updatedUser)
    setUser(updatedUser)
    setSuccess(`Won ${reward}% discount on next purchase!`)
  }

  const handleInvest = async () => {
    setError("")
    setSuccess("")

    const amount = Number.parseFloat(investAmount)
    if (!amount || amount <= 0) {
      setError("Enter a valid amount")
      return
    }

    const updatedUser = { ...user }
    updatedUser.balance += amount
    updatedUser.totalInvested += amount

    const machineCount = updatedUser.machines.length
    if (machineCount < 5 && updatedUser.balance >= (machineCount + 1) * 100) {
      const newMachine: TimeMachine = {
        id: generateId(),
        level: machineCount + 1,
        name: `Time Machine ${machineCount + 1}`,
        description: `Advanced temporal investment unit`,
        unlockedAt: Date.now(),
        lastClaimedAt: Date.now(),
        isActive: true,
        rewardAmount: 20 + machineCount * 5,
        claimIntervalMs: 7 * 24 * 60 * 60 * 1000,
        icon: "⏰",
      }
      updatedUser.machines.push(newMachine)
      setSuccess(`Machine #${newMachine.level} unlocked!`)
      successConfetti()
    }

    await storage.saveUser(updatedUser)
    setUser(updatedUser)
    setInvestAmount("")
    successConfetti()
  }

  const handleClaim = async (machineId: string) => {
    const updatedUser = { ...user }
    const machine = updatedUser.machines.find((m) => m.id === machineId)

    if (machine) {
      updatedUser.claimedBalance += machine.rewardAmount
      machine.lastClaimedAt = Date.now()
      await storage.saveUser(updatedUser)
      setUser(updatedUser)
      setSuccess(`Claimed ${formatCurrency(machine.rewardAmount)}!`)
      successConfetti()
    }
  }

  const handleWithdraw = async () => {
    setError("")
    setSuccess("")

    const amount = Number.parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      setError("Enter a valid amount")
      return
    }

    if (amount > user.claimedBalance) {
      setError("Insufficient claimed balance")
      return
    }

    if (!walletAddress) {
      setError("Enter wallet address")
      return
    }

    const daysSinceLastWithdrawal = (Date.now() - user.lastWithdrawalDate) / (1000 * 60 * 60 * 24)
    if (daysSinceLastWithdrawal < 12) {
      setError(`Can withdraw again in ${Math.ceil(12 - daysSinceLastWithdrawal)} days`)
      return
    }

    const updatedUser = { ...user }
    updatedUser.claimedBalance -= amount
    updatedUser.lastWithdrawalDate = Date.now()

    const request = {
      id: generateId(),
      userId: user.id,
      amount,
      walletAddress,
      status: "pending" as const,
      createdAt: Date.now(),
    }

    await storage.saveWithdrawalRequest(request)
    await storage.saveUser(updatedUser)
    setUser(updatedUser)
    setWithdrawAmount("")
    setWalletAddress("")
    setSuccess("Withdrawal request submitted!")
  }

  if (currentView === "marketplace") {
    return <Marketplace user={user} onNavigate={onNavigate} onLogout={onLogout} />
  }

  if (currentView === "referrals") {
    return <Referrals user={user} onNavigate={onNavigate} onLogout={onLogout} />
  }

  if (currentView === "settings") {
    return <Settings user={user} onNavigate={onNavigate} onLogout={onLogout} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navigation
        user={user}
        currentView={currentView}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onAdmin={onNavigateToAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnimatedStatCard
            title="Total Earnings"
            value={<AnimatedCounter value={user.claimedBalance} prefix="$" decimals={2} />}
            description="Ready to withdraw"
            icon={<TrendingUp className="w-5 h-5" />}
            gradient="from-cyan-400 to-blue-400"
            glow="glow-cyan"
          />

          <AnimatedStatCard
            title="Total Investment"
            value={<AnimatedCounter value={user.balance} prefix="$" decimals={2} />}
            description="Deployed capital"
            icon={<Zap className="w-5 h-5" />}
            gradient="from-blue-400 to-cyan-400"
            glow="glow-blue"
          />

          <AnimatedStatCard
            title="Referral Bonuses"
            value={<AnimatedCounter value={user.referrals.length * 50} prefix="$" decimals={2} />}
            description={`${user.referrals.length} friends invited`}
            icon={<Users className="w-5 h-5" />}
            gradient="from-cyan-400 to-emerald-400"
            glow="glow-cyan"
          />

          <AnimatedStatCard
            title="Active Machines"
            value={`${user.machines.length}/5`}
            description="Earning in parallel"
            icon={<Clock className="w-5 h-5" />}
            gradient="from-blue-400 to-purple-400"
            glow="glow-blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Time Machines Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Your Time Machines</h2>
                <span className="text-sm text-muted-foreground">{user.machines.length} of 5 unlocked</span>
              </div>

              {user.machines.length === 0 ? (
                <Card className="glass glow-cyan">
                  <CardContent className="py-16 text-center">
                    <Clock className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-6 text-lg">
                      No machines yet. Invest to unlock your first machine!
                    </p>
                    <Button onClick={() => setInvestAmount("100")} className="btn-primary">
                      Invest Now
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.machines.map((machine) => (
                    <TimeMachineCard
                      key={machine.id}
                      machine={machine}
                      user={user}
                      onClaim={handleClaim}
                      onUpdate={setUser}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 3D Visualization */}
            <Card className="glass glow-cyan overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Portfolio Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <TimeMachine3D />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card className="glass glow-cyan border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-card/50 rounded-lg border border-border hover:border-cyan-500/50 transition-all"
                    >
                      <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                      <button className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 font-semibold flex items-center gap-1">
                        {suggestion.action}
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Invest Card */}
            <Card className="glass glow-cyan">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Quick Invest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount ($)"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="glass-sm"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {success && <p className="text-green-400 text-xs">{success}</p>}
                <Button onClick={handleInvest} className="w-full btn-primary">
                  Invest
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw Card */}
            <Card className="glass glow-blue">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Withdraw
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount ($)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="glass-sm"
                />
                <Input
                  type="text"
                  placeholder="Wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="glass-sm"
                />
                <Button
                  onClick={handleWithdraw}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-green-500/30"
                >
                  Withdraw
                </Button>
              </CardContent>
            </Card>

            {/* Referral Card */}
            <Card className="glass glow-cyan">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={user.referralCode} readOnly className="glass-sm font-mono text-xs" />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(user.referralCode)
                      setSuccess("Copied!")
                    }}
                    size="sm"
                    className="btn-secondary"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-cyan-400 font-semibold">{user.referrals.length}</span> friends invited
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Features Section */}
        <div className="mt-12 space-y-8">
          {/* Platform Statistics */}
          <PlatformStats />

          {/* Daily Spin Wheel & ROI Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DailySpinWheel 
              userId={user.id}
              lastSpinDate={user.lastSpinDate || 0}
              onSpin={handleDailySpin}
            />
            <ROICalculator />
          </div>

          {/* Achievements & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Achievements 
              userStats={{
                totalInvested: user.totalInvested,
                totalEarned: user.claimedBalance,
                machinesOwned: user.machines.length,
                referralsCount: user.referrals.length,
                daysActive: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
              }}
            />
            <Leaderboard 
              currentUserId={user.id}
              currentUsername={user.username}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
