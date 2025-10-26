"use client"

import { useState, useEffect } from "react"
import { type User, storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IOSLayout } from "./ios-layout"
import { resetAllUserBalances } from "@/lib/reset-balances"
import { ReferralSystem } from "@/components/referral-system"
import { LiveAnalytics } from "@/components/live-analytics"
import { NotificationSystem } from "@/components/notification-system"
import { AchievementSystem } from "@/components/achievement-system"
import { AdvancedDashboard } from "@/components/advanced-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminPanelV2 } from "@/components/admin-panel-v2"
import { RealUserDashboard } from "@/components/real-user-dashboard"
import { ModernSidebar } from "@/components/modern-sidebar"
import { ModernUserDashboard } from "@/components/modern-user-dashboard"
import { RealAnalytics } from "@/components/real-analytics"
import { ActivityFeed } from "@/components/activity-feed"
import { TimeMachineMarketplace } from "@/components/time-machine-marketplace"
import { InvestmentAnalytics } from "@/components/investment-analytics"
import { BalanceTopup } from "@/components/balance-topup"
import { MachineClaiming } from "@/components/machine-claiming"
import { WorkflowOverview } from "@/components/workflow-overview"
import { MobileNavigation } from "@/components/mobile-navigation"
import { LiveUserCounter, TransactionTicker, SecurityBadges } from "@/components/trust-indicators"
import { InvestmentProgress, AchievementToast } from "@/components/engagement-features"
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Clock, 
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Activity,
  Wallet,
  CreditCard,
  Bitcoin,
  Calendar,
  Shield,
  Star,
  Award,
  Settings,
  Bell,
  HelpCircle,
  Play,
  Save,
  Trash2,
  Eye,
  Code,
  FileText,
  Grid,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Copy,
  Globe,
  Lock,
  RefreshCw,
  User as UserIcon
} from "lucide-react"

interface APIDashboardProps {
  user: User
  onLogout: () => void
}

export function APIDashboard({ user, onLogout }: APIDashboardProps) {
  const [currentSection, setCurrentSection] = useState("overview")
  const [investAmount, setInvestAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false)
  const [pendingInvestment, setPendingInvestment] = useState<number | null>(null)
  const [userData, setUserData] = useState(user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(async () => {
      try {
        const currentUser = await storage.getCurrentUser()
        if (currentUser) {
          setUserData(currentUser)
        }
      } catch (error) {
        console.error("Error updating user:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleInvest = async () => {
    setError("")
    setSuccess("")

    const amount = Number.parseFloat(investAmount)
    if (!amount || amount <= 0) {
      setError("Enter a valid amount")
      return
    }

    if (amount < 100 || amount > 10000) {
      setError("Investment must be between $100 and $10,000")
      return
    }

    if ((userData.machines || []).length >= 5) {
      setError("Maximum 5 machines allowed")
      return
    }

    // Redirect to CPay checkout
    setError("Please use the Balance Top-up section to add funds before investing.")
    return
  }

  const handleMachinePurchase = async (machineId: number, quantity: number) => {
    setError("")
    setSuccess("")

    // This function will be called by the TimeMachineMarketplace component
    // The actual purchase logic is handled in the marketplace component
    console.log(`Purchasing machine ${machineId} with quantity ${quantity}`)
  }

  const handleBitcoinPaymentConfirmed = async (transaction: any) => {
    setError("")
    setSuccess("")

    if (!pendingInvestment) return

    const amount = pendingInvestment
    const updatedUser = { ...userData }
    updatedUser.balance += amount
    updatedUser.totalInvested += amount

    // Unlock a new time machine with ROI limits
    const machineLevel = (userData.machines || []).length + 1
    const roiPercentage = 10 + Math.random() * 10 // 10-20% ROI
    const maxEarnings = amount * (roiPercentage / 100)
    const weeklyEarnings = maxEarnings / 7 // Spread over 1 week
    const dailyEarnings = weeklyEarnings / 7
    const hourlyEarnings = dailyEarnings / 24
    const rewardAmount = hourlyEarnings / 6 // 6 claims per hour (10min intervals)
    
    const newMachine = {
      id: Math.random().toString(36).substr(2, 9),
      level: machineLevel,
      name: `Time Machine ${machineLevel}`,
      description: `Advanced temporal device - Level ${machineLevel}`,
      unlockedAt: Date.now(),
      lastClaimedAt: 0,
      isActive: true,
      rewardAmount: Math.max(1, Math.round(rewardAmount)), // Minimum $1 per claim
      claimIntervalMs: userData.referrals && userData.referrals.length >= 3 ? 5 * 60 * 1000 : 10 * 60 * 1000, // 5min with 3+ referrals, 10min default
      icon: "⏰",
      investmentAmount: amount,
      maxEarnings: maxEarnings,
      currentEarnings: 0,
      roiPercentage: roiPercentage
    }

    updatedUser.machines = [...(userData.machines || []), newMachine]

    try {
      await storage.saveUser(updatedUser)
      setUserData(updatedUser)
      setSuccess(`Time Machine ${machineLevel} unlocked! Earns $${newMachine.rewardAmount} every ${newMachine.claimIntervalMs / 60000} minutes.`)
      setShowBitcoinPayment(false)
      setPendingInvestment(null)
    } catch (error) {
      console.error("Error saving machine:", error)
      setError("Failed to save machine. Please try again.")
    }
  }

  const handleBitcoinPaymentFailed = (error: string) => {
    setError(error)
    setShowBitcoinPayment(false)
    setPendingInvestment(null)
  }

  const handleWithdraw = async () => {
    setError("")
    setSuccess("")

    const amount = Number.parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      setError("Enter a valid amount")
      return
    }

    if (amount > userData.claimedBalance) {
      setError("Insufficient claimed balance")
      return
    }

    if (!walletAddress) {
      setError("Enter wallet address")
      return
    }

    // Check 12-day cooldown
    const daysSinceLastWithdrawal = userData.lastWithdrawalDate 
      ? (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24)
      : 999 // Allow first withdrawal
    
    if (daysSinceLastWithdrawal < 12) {
      const daysRemaining = Math.ceil(12 - daysSinceLastWithdrawal)
      setError(`You can withdraw again in ${daysRemaining} days`)
      return
    }

    const updatedUser = { ...userData }
    updatedUser.claimedBalance -= amount
    updatedUser.lastWithdrawalDate = Date.now()

    const request = {
      id: Math.random().toString(36).substr(2, 9),
      userId: userData.id,
      amount,
      walletAddress,
      status: "pending" as const,
      createdAt: Date.now(),
    }

    await storage.saveWithdrawalRequest(request)
    await storage.saveUser(updatedUser)
    setUserData(updatedUser)
    setWithdrawAmount("")
    setWalletAddress("")
    setSuccess("Withdrawal request submitted! Processing within 24 hours.")
  }

  const handleClaim = async (machineId: string) => {
    setError("")
    setSuccess("")

    const machine = (userData.machines || []).find(m => m.id === machineId)
    if (!machine) {
      setError("Machine not found")
      return
    }

    // Check if machine has reached its ROI limit
    if (machine.currentEarnings >= machine.maxEarnings) {
      setError("This machine has reached its maximum earnings limit")
      return
    }

    const now = Date.now()
    const timeSinceLastClaim = now - machine.lastClaimedAt
    const canClaim = timeSinceLastClaim >= machine.claimIntervalMs

    if (!canClaim) {
      const timeRemaining = machine.claimIntervalMs - timeSinceLastClaim
      const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60))
      setError(`Please wait ${minutesRemaining} more minutes`)
      return
    }

    const updatedUser = { ...userData }
    const updatedMachines = [...(userData.machines || [])]
    const machineIndex = updatedMachines.findIndex(m => m.id === machineId)
    
    // Calculate actual reward (don't exceed max earnings)
    const remainingEarnings = machine.maxEarnings - machine.currentEarnings
    const actualReward = Math.min(machine.rewardAmount, remainingEarnings)
    
    updatedMachines[machineIndex] = {
      ...machine,
      lastClaimedAt: now,
      currentEarnings: machine.currentEarnings + actualReward
    }
    
    updatedUser.machines = updatedMachines
    updatedUser.claimedBalance += actualReward
    updatedUser.totalEarned += actualReward

    await storage.saveUser(updatedUser)
    setUserData(updatedUser)
    setSuccess(`Claimed $${actualReward} from ${machine.name}!`)
  }

  const handleResetBalances = async () => {
    if (confirm('Are you sure you want to reset ALL user balances? This action cannot be undone.')) {
      try {
        const result = await resetAllUserBalances()
        if (result.success) {
          setSuccess('All user balances have been reset successfully!')
          // Refresh user data
          const currentUser = await storage.getCurrentUser()
          if (currentUser) {
            setUserData(currentUser)
          }
        } else {
          setError('Failed to reset balances: ' + result.error)
        }
      } catch (error) {
        setError('Failed to reset balances')
      }
    }
  }

  const renderOverview = () => (
    <div className="p-4 lg:p-6">
      <RealUserDashboard 
        user={userData}
        onUserUpdate={setUserData}
        onLogout={onLogout}
      />
    </div>
  )

  const renderOverviewOld = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground text-base lg:text-lg mb-6">
          Manage your time machine investments and grow your wealth.
        </p>
        
        {/* Investment Portfolio Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Investment</p>
                  <p className="text-lg font-bold text-foreground">${(userData.balance || 0).toFixed(0)}</p>
                </div>
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rewards</p>
                  <p className="text-lg font-bold text-foreground">${(userData.claimedBalance || 0).toFixed(0)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Machines</p>
                  <p className="text-lg font-bold text-foreground">{(userData.machines || []).length}/5</p>
                </div>
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Referrals</p>
                  <p className="text-lg font-bold text-foreground">{(userData.referrals || []).length}</p>
                </div>
                <Users className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                Unlock Time Machines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Invest to unlock new time machines (max 5 machines)
              </div>
              <Input
                type="number"
                placeholder="Investment Amount ($)"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="bg-background border-border"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              {success && <p className="text-success text-sm">{success}</p>}
              <Button onClick={handleInvest} className="w-full btn-primary">
                Invest & Unlock Machine
              </Button>
              <div className="text-xs text-muted-foreground">
                Current machines: {(userData.machines || []).length}/5
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-success" />
                Withdraw Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Withdraw claimed rewards (12-day cycle)
              </div>
              
              {/* Withdrawal Cooldown Display */}
              {userData.lastWithdrawalDate && (() => {
                const daysSinceLastWithdrawal = (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24)
                const daysRemaining = Math.ceil(12 - daysSinceLastWithdrawal)
                const canWithdraw = daysSinceLastWithdrawal >= 12
                
                return (
                  <div className={`p-3 rounded-lg text-sm ${
                    canWithdraw 
                      ? 'bg-success/10 text-success border border-success/20' 
                      : 'bg-warning/10 text-warning border border-warning/20'
                  }`}>
                    {canWithdraw ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        Ready to withdraw
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        Next withdrawal in {daysRemaining} days
                      </div>
                    )}
                  </div>
                )
              })()}
              
              <Input
                type="number"
                placeholder="Withdrawal Amount ($)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-background border-border"
                disabled={!!(userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12)}
              />
              <Input
                type="text"
                placeholder="Crypto Wallet Address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="bg-background border-border"
                disabled={!!(userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12)}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              {success && <p className="text-success text-sm">{success}</p>}
              <Button 
                onClick={handleWithdraw} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={!!(userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12)}
              >
                {userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12 
                  ? 'Withdrawal Cooldown Active' 
                  : 'Request Withdrawal'
                }
              </Button>
              <div className="text-xs text-muted-foreground">
                Available: ${(userData.claimedBalance || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Reset Button */}
        {userData.email === "admin@chronostime.com" && (
          <Card className="bg-destructive/10 border-destructive/20 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-destructive">Admin Actions</h3>
                  <p className="text-sm text-muted-foreground">Reset all user balances</p>
                </div>
                <Button 
                  onClick={handleResetBalances}
                  variant="destructive"
                  size="sm"
                >
                  Reset All Balances
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Active Time Machines */}
        {(userData.machines || []).length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Active Time Machines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.machines.map((machine, index) => {
                // Use a consistent time calculation to prevent hydration mismatches
                const now = mounted ? Date.now() : machine.lastClaimedAt
                const timeSinceLastClaim = now - machine.lastClaimedAt
                const claimInterval = (userData.referrals || []).length >= 3 ? 5 * 60 * 1000 : 10 * 60 * 1000 // 5 or 10 minutes
                const isReady = timeSinceLastClaim >= claimInterval
                const timeRemaining = Math.max(0, claimInterval - timeSinceLastClaim)
                const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000))

                return (
                  <Card key={machine.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-foreground">Machine {index + 1}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isReady ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                        }`}>
                          {isReady ? 'Ready' : `${minutesRemaining}m`}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="text-foreground font-medium">${machine.rewardAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interval:</span>
                          <span className="text-foreground">
                            {machine.claimIntervalMs / 60000} min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={isReady ? 'text-success' : 'text-warning'}>
                            {isReady ? 'Ready to claim' : 'Generating...'}
                          </span>
                        </div>
                      </div>

                          <Button
                            className="w-full"
                            disabled={!isReady}
                            onClick={async () => {
                              try {
                                setError("")
                                setSuccess("")
                                
                                // Update the machine's last claimed time
                                const updatedMachines = userData.machines.map(m => 
                                  m.id === machine.id 
                                    ? { ...m, lastClaimedAt: Date.now() }
                                    : m
                                )
                                
                                // Add $20 to claimed balance
                                const updatedUser = {
                                  ...userData,
                                  machines: updatedMachines,
                                  claimedBalance: userData.claimedBalance + 20,
                                  totalEarned: userData.totalEarned + 20
                                }
                                
                                await storage.saveUser(updatedUser)
                                setUserData(updatedUser)
                                setSuccess("Successfully claimed $20!")
                                
                                // Show success animation
                                setTimeout(() => setSuccess(""), 3000)
                              } catch (error) {
                                console.error("Error claiming reward:", error)
                                setError("Failed to claim reward. Please try again.")
                              }
                            }}
                          >
                            {isReady ? 'Claim $20' : `Wait ${minutesRemaining}m`}
                          </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="mt-8">
          <ActivityFeed currentUser={userData} />
        </div>
      </div>
    </div>
  )

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const renderReferrals = () => (
    <div className="p-4 lg:p-6">
      <ReferralSystem 
        user={userData} 
        onUserUpdate={setUserData}
      />
    </div>
  )

  const renderAnalytics = () => (
    <div className="p-4 lg:p-6">
      <RealAnalytics user={userData} />
    </div>
  )

  const renderNotifications = () => (
    <div className="p-4 lg:p-6">
      <NotificationSystem 
        user={userData} 
        onUserUpdate={setUserData}
      />
    </div>
  )

  const renderAchievements = () => (
    <div className="p-4 lg:p-6">
      <AchievementSystem user={userData} />
    </div>
  )

  const renderAdvancedDashboard = () => (
    <div className="p-4 lg:p-6">
      <AdvancedDashboard user={userData} />
    </div>
  )

  const renderPortfolio = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
        <p className="text-muted-foreground">Track your investment performance and portfolio growth.</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold text-foreground">${(userData.balance || 0).toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-foreground">${(userData.totalEarned || 0).toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold text-foreground">
                  {(userData.balance || 0) > 0 ? (((userData.totalEarned || 0) / (userData.balance || 1)) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Machines</p>
                <p className="text-2xl font-bold text-foreground">{(userData.machines || []).length}/5</p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment History */}
      <Card className="bg-card border-border shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(userData.machines || []).length > 0 ? (
              userData.machines.map((machine, index) => (
                <div key={machine.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <p className="font-medium">Time Machine {index + 1}</p>
                      <p className="text-sm text-muted-foreground">Generating $20 rewards</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    Active
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No time machines yet. Start investing to unlock your first machine!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Performance chart coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInvestment = () => (
    <div className="p-4 lg:p-6">
      <BalanceTopup 
        user={userData}
        onUserUpdate={setUserData}
      />

      {/* Active Time Machines */}
      {(userData.machines || []).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Your Time Machines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(userData.machines || []).map((machine, index) => {
              const now = mounted ? Date.now() : machine.lastClaimedAt
              const timeSinceLastClaim = now - machine.lastClaimedAt
              const claimInterval = (userData.referrals || []).length >= 3 ? 5 * 60 * 1000 : 10 * 60 * 1000
              const isReady = timeSinceLastClaim >= claimInterval
              const timeRemaining = Math.max(0, claimInterval - timeSinceLastClaim)
              const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000))

              return (
                <Card key={machine.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Machine {index + 1}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isReady ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                        {isReady ? 'Ready' : `${minutesRemaining}m`}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reward:</span>
                        <span className="text-foreground font-medium">${machine.rewardAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interval:</span>
                        <span className="text-foreground">
                          {machine.claimIntervalMs / 60000} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={isReady ? 'text-success' : 'text-warning'}>
                          {isReady ? 'Ready to claim' : 'Generating...'}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={!isReady}
                      onClick={() => handleClaim(machine.id)}
                    >
                      {isReady ? `Claim $${machine.rewardAmount}` : `Wait ${minutesRemaining}m`}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="mt-8">
        <ActivityFeed currentUser={userData} />
      </div>
    </div>
  )

  const renderWithdraw = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Withdraw your claimed rewards to your crypto wallet.</p>
      </div>

      {/* Withdrawal Period Display */}
      <Card className="bg-card border-border shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Current Withdrawal Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="font-semibold text-primary">Active Withdrawal Period</span>
            </div>
            <p className="text-sm text-muted-foreground">
              November 11th - 13th, 2024
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All withdrawal requests will be processed during this period
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Form */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Withdraw Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Withdraw claimed rewards (12-day cycle)
            </div>
            
            {/* Withdrawal Cooldown Display */}
            {userData.lastWithdrawalDate && (() => {
              const daysSinceLastWithdrawal = (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24)
              const daysRemaining = Math.ceil(12 - daysSinceLastWithdrawal)
              const canWithdraw = daysSinceLastWithdrawal >= 12
              
              return (
                <div className={`p-3 rounded-lg text-sm ${
                  canWithdraw 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-warning/10 text-warning border border-warning/20'
                }`}>
                  {canWithdraw ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      Ready to withdraw
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                      Next withdrawal in {daysRemaining} days
                    </div>
                  )}
                </div>
              )
            })()}
            
            <Input
              type="number"
              placeholder="Withdrawal Amount ($)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-background border-border"
              disabled={!!(userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12)}
            />
            <Input
              type="text"
              placeholder="Crypto Wallet Address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="bg-background border-border"
              disabled={!!(userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12)}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {success && <p className="text-success text-sm">{success}</p>}
            <Button 
              onClick={handleWithdraw} 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={!!(userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12)}
            >
              {userData.lastWithdrawalDate && (Date.now() - userData.lastWithdrawalDate) / (1000 * 60 * 60 * 24) < 12 
                ? 'Withdrawal Cooldown Active' 
                : 'Request Withdrawal'
              }
            </Button>
            <div className="text-xs text-muted-foreground">
              Available: ${(userData.claimedBalance || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.lastWithdrawalDate ? (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Last Withdrawal</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(userData.lastWithdrawalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      Processed
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No withdrawals yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMachines = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">My Time Machines</h1>
        <p className="text-muted-foreground">Manage your time machines and claim rewards.</p>
      </div>

      {(userData.machines || []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userData.machines.map((machine, index) => {
            const now = mounted ? Date.now() : machine.lastClaimedAt
            const timeSinceLastClaim = now - machine.lastClaimedAt
            const claimInterval = (userData.referrals || []).length >= 3 ? 5 * 60 * 1000 : 10 * 60 * 1000
            const isReady = timeSinceLastClaim >= claimInterval
            const timeRemaining = Math.max(0, claimInterval - timeSinceLastClaim)
            const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000))

            return (
              <Card key={machine.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Machine {index + 1}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isReady ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                      {isReady ? 'Ready' : `${minutesRemaining}m`}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reward:</span>
                      <span className="text-foreground font-medium">${machine.rewardAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interval:</span>
                      <span className="text-foreground">
                        {machine.claimIntervalMs / 60000} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={isReady ? 'text-success' : 'text-warning'}>
                        {isReady ? 'Ready to claim' : 'Generating...'}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!isReady}
                    onClick={() => handleClaim(machine.id)}
                  >
                    {isReady ? `Claim $${machine.rewardAmount}` : `Wait ${minutesRemaining}m`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Time Machines Yet</h3>
          <p className="text-muted-foreground mb-6">Start investing to unlock your first time machine!</p>
          <Button onClick={() => setCurrentSection("investment")} className="btn-primary">
            Make Investment
          </Button>
        </div>
      )}
    </div>
  )

  const renderHistory = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View your investment and withdrawal history.</p>
      </div>

      <div className="space-y-4">
        {/* Investment History */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Investment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.balance > 0 ? (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Initial Investment</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">+${(userData.balance || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Investment</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No investments yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-success" />
              Earnings History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.totalEarned > 0 ? (
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Time Machine Rewards</p>
                        <p className="text-sm text-muted-foreground">
                          {(userData.machines || []).length} active machines
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">+${(userData.totalEarned || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total Earned</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No earnings yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-warning" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.lastWithdrawalDate ? (
                <div className="p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">Last Withdrawal</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(userData.lastWithdrawalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-warning">Processed</p>
                      <p className="text-xs text-muted-foreground">Withdrawal</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No withdrawals yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderClaim = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Claim Rewards</h1>
        <p className="text-muted-foreground">Claim your time machine rewards and manage your earnings.</p>
      </div>

      {(userData.machines || []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(userData.machines || []).map((machine, index) => {
            const now = mounted ? Date.now() : machine.lastClaimedAt
            const timeSinceLastClaim = now - machine.lastClaimedAt
            const claimInterval = (userData.referrals || []).length >= 3 ? 5 * 60 * 1000 : 10 * 60 * 1000
            const isReady = timeSinceLastClaim >= claimInterval
            const timeRemaining = Math.max(0, claimInterval - timeSinceLastClaim)
            const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000))

            return (
              <Card key={machine.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Machine {index + 1}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isReady ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                      {isReady ? 'Ready' : `${minutesRemaining}m`}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reward:</span>
                      <span className="text-foreground font-medium">${machine.rewardAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interval:</span>
                      <span className="text-foreground">
                        {machine.claimIntervalMs / 60000} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={isReady ? 'text-success' : 'text-warning'}>
                        {isReady ? 'Ready to claim' : 'Generating...'}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!isReady}
                    onClick={async () => {
                      try {
                        setError("")
                        setSuccess("")
                        
                        const updatedMachines = (userData.machines || []).map(m => 
                          m.id === machine.id 
                            ? { ...m, lastClaimedAt: Date.now() }
                            : m
                        )
                        
                        const updatedUser = {
                          ...userData,
                          machines: updatedMachines,
                          claimedBalance: (userData.claimedBalance || 0) + 20,
                          totalEarned: (userData.totalEarned || 0) + 20
                        }
                        
                        await storage.saveUser(updatedUser)
                        setUserData(updatedUser)
                        setSuccess("Successfully claimed $20!")
                        
                        setTimeout(() => setSuccess(""), 3000)
                      } catch (error) {
                        console.error("Error claiming reward:", error)
                        setError("Failed to claim reward. Please try again.")
                      }
                    }}
                  >
                    {isReady ? 'Claim $20' : `Wait ${minutesRemaining}m`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Time Machines Yet</h3>
          <p className="text-muted-foreground mb-6">Start investing to unlock your first time machine!</p>
          <Button onClick={() => setCurrentSection("investment")} className="btn-primary">
            Make Investment
          </Button>
        </div>
      )}
    </div>
  )

  const renderSettings = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  value={userData.email}
                  disabled
                  className="bg-background border-border mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">User ID</label>
                <Input
                  value={userData.id}
                  disabled
                  className="bg-background border-border mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Join Date</label>
                <Input
                  value={new Date(userData.createdAt).toLocaleDateString()}
                  disabled
                  className="bg-background border-border mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reward Claims</p>
                  <p className="text-sm text-muted-foreground">Get notified when rewards are ready</p>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Withdrawal Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about withdrawal status</p>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Referral Bonuses</p>
                  <p className="text-sm text-muted-foreground">Get notified about referral activities</p>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ModernSidebar 
          user={userData}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onLogout={onLogout}
        />
      </div>
      
      {/* Mobile Navigation - Bottom Tab Bar */}
      <div className="lg:hidden">
        <MobileNavigation 
          currentView={currentSection}
          onNavigate={setCurrentSection}
          notifications={3}
          rewards={2}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {currentSection === "overview" && (
          <div className="space-y-6">
            {/* Trust Indicators Bar */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-purple-500/20 p-4">
              <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-between">
                <LiveUserCounter />
                <TransactionTicker />
                <SecurityBadges />
              </div>
            </div>
            
            <ModernUserDashboard 
              user={userData}
              onNavigate={setCurrentSection}
            />
          </div>
        )}
      {currentSection === "wallet" && (
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wallet</h1>
            <p className="text-muted-foreground">Manage your funds, deposits, and withdrawals</p>
          </div>
          
          <Tabs defaultValue="topup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topup">Top Up Balance</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
            </TabsList>
            <TabsContent value="topup" className="mt-6">
              <BalanceTopup user={userData} onUserUpdate={setUserData} />
            </TabsContent>
            <TabsContent value="withdraw" className="mt-6">
              {renderWithdraw()}
            </TabsContent>
          </Tabs>
        </div>
      )}
        {currentSection === "marketplace" && (
          <div className="p-6">
            <TimeMachineMarketplace 
              user={userData}
              onPurchase={(machineId) => handleMachinePurchase(machineId, 1)}
              onUserUpdate={setUserData}
            />
          </div>
        )}
      {currentSection === "upgrades" && (
        <div className="p-4 lg:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Machine Upgrades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Machine upgrades are now available directly in the Marketplace.</p>
              <Button 
                onClick={() => setCurrentSection("marketplace")}
                className="btn-primary mt-4"
              >
                Go to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {currentSection === "investment-analytics" && (
        <div className="p-4 lg:p-6">
          <InvestmentAnalytics user={userData} />
        </div>
      )}
      {currentSection === "withdraw" && renderWithdraw()}
      {currentSection === "history" && renderHistory()}
      {currentSection === "machines" && renderMachines()}
      {currentSection === "claim" && (
        <div className="p-4 lg:p-6">
          <MachineClaiming 
            user={userData}
            onUserUpdate={setUserData}
          />
        </div>
      )}
      {currentSection === "referrals" && renderReferrals()}
      {currentSection === "analytics" && renderAnalytics()}
      {currentSection === "notifications" && renderNotifications()}
      {currentSection === "achievements" && renderAchievements()}
      {currentSection === "advanced" && renderAdvancedDashboard()}
      {currentSection === "settings" && renderSettings()}
        {currentSection === "admin" && userData?.email === "admin@chronostime.com" && (
          <AdminPanelV2 />
        )}
      
        {!["overview", "portfolio", "investment", "invest", "withdraw", "history", "machines", "claim", "referrals", "analytics", "notifications", "achievements", "advanced", "settings", "marketplace", "admin"].includes(currentSection) && (
          <div className="p-4 lg:p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-slate-400">This feature is under development.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
