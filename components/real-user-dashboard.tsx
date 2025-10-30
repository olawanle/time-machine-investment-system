"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-provider"
import { formatCurrency, generateId } from "@/lib/utils"
import { storage, type User, type TimeMachine } from "@/lib/storage"
import { 
  Home,
  TrendingUp, 
  Wallet, 
  History,
  Settings,
  Users,
  BarChart3,
  Award,
  Search,
  Bell,
  User as UserIcon,
  Moon,
  Sun,
  Zap,
  DollarSign,
  Clock,
  Activity,
  Copy,
  ExternalLink,
  RefreshCw
} from "lucide-react"

interface RealUserDashboardProps {
  user: User
  onUserUpdate: (user: User) => void
  onLogout: () => void
}

export function RealUserDashboard({ user: initialUser, onUserUpdate, onLogout }: RealUserDashboardProps) {
  const [user, setUser] = useState(initialUser)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [investAmount, setInvestAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = await storage.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          onUserUpdate(currentUser)
        }
      } catch (error) {
        console.error("Error updating user:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [onUserUpdate])

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

    const portfolioCount = updatedUser.machines.length
    if (portfolioCount < 5 && updatedUser.balance >= (portfolioCount + 1) * 100) {
      const newMachine: TimeMachine = {
        id: generateId(),
        level: portfolioCount + 1,
        name: `Machine ${portfolioCount + 1}`,
        description: `Time Machine Level ${portfolioCount + 1}`,
        unlockedAt: Date.now(),
        lastClaimedAt: Date.now(),
        isActive: true,
        rewardAmount: 20 + portfolioCount * 5,
        claimIntervalMs: 7 * 24 * 60 * 60 * 1000,
        icon: "⚡",
        investmentAmount: (portfolioCount + 1) * 100,
        maxEarnings: ((portfolioCount + 1) * 100) * 2,
        currentEarnings: 0,
        roiPercentage: 15 + portfolioCount * 2
      }
      updatedUser.machines.push(newMachine)
      updatedUser.balance -= newMachine.investmentAmount
      setSuccess(`Machine ${newMachine.level} unlocked!`)
    }

    await storage.saveUser(updatedUser)
    setUser(updatedUser)
    onUserUpdate(updatedUser)
    setInvestAmount("")
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
    onUserUpdate(updatedUser)
    setWithdrawAmount("")
    setWalletAddress("")
    setSuccess("Withdrawal request submitted!")
  }

  const handleClaimRewards = async (machineId: string) => {
    const updatedUser = { ...user }
    const machine = updatedUser.machines.find((m) => m.id === machineId)

    if (machine && machine.isActive) {
      const timeSinceLastClaim = Date.now() - machine.lastClaimedAt
      if (timeSinceLastClaim >= machine.claimIntervalMs) {
        updatedUser.claimedBalance += machine.rewardAmount
        machine.lastClaimedAt = Date.now()
        machine.currentEarnings += machine.rewardAmount
        
        await storage.saveUser(updatedUser)
        setUser(updatedUser)
        onUserUpdate(updatedUser)
        setSuccess(`Claimed ${formatCurrency(machine.rewardAmount)} from ${machine.name}!`)
      }
    }
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "investment", label: "Investment", icon: TrendingUp },
    { id: "portfolio", label: "My Portfolio", icon: Wallet },
    { id: "withdraw", label: "Withdraw Funds", icon: DollarSign },
    { id: "history", label: "Transaction History", icon: History },
    { id: "machines", label: "Time Machines", icon: Zap },
    { id: "my-machines", label: "My Machines", icon: Activity },
    { id: "claim", label: "Claim Rewards", icon: Award },
    { id: "analytics", label: "Machine Analytics", icon: BarChart3 },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">ChronosTime</h1>
              <p className="text-xs text-gray-500">Investment Platform</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search features..." 
              className="pl-10 bg-gray-50 border-gray-200 text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">{user.tier} tier</p>
            </div>
            <Button onClick={onLogout} variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600">Manage your time machine investments and grow your wealth.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" title="Notifications">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Profile">
                <UserIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                        <p className="text-2xl font-bold text-gray-900">${user.balance.toFixed(0)}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-gray-900">${user.claimedBalance.toFixed(0)}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Machines</p>
                        <p className="text-2xl font-bold text-gray-900">{user.machines.length}/5</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Referrals</p>
                        <p className="text-2xl font-bold text-gray-900">{user.referrals.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unlock Time Machines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Unlock Time Machines
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Invest to unlock new time machines (max 5 machines)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Investment Amount ($)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current machines: {user.machines.length}/5</p>
                    </div>
                    
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}
                    
                    <Button 
                      onClick={handleInvest} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={user.machines.length >= 5}
                    >
                      {user.machines.length >= 5 ? "Maximum Machines Reached" : "Invest & Unlock Machine"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Withdraw Rewards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Withdraw Rewards
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Withdraw claimed rewards (12-day cycle)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Withdrawal Amount ($)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Available: ${user.claimedBalance.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Crypto Wallet Address</label>
                      <Input
                        type="text"
                        placeholder="Enter wallet address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleWithdraw} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={user.claimedBalance <= 0}
                    >
                      Request Withdrawal
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Active Time Machines */}
              {user.machines.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active Time Machines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.machines.map((machine, index) => {
                        const timeSinceLastClaim = Date.now() - machine.lastClaimedAt
                        const canClaim = timeSinceLastClaim >= machine.claimIntervalMs
                        const timeUntilNextClaim = machine.claimIntervalMs - timeSinceLastClaim
                        const hoursUntilClaim = Math.max(0, Math.ceil(timeUntilNextClaim / (1000 * 60 * 60)))

                        return (
                          <div key={machine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Machine {index + 1}</h4>
                                <p className="text-sm text-gray-600">
                                  Reward: ${machine.rewardAmount} • 
                                  {canClaim ? " Ready to claim!" : ` Next claim in ${hoursUntilClaim}h`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={machine.isActive ? "default" : "secondary"}>
                                {machine.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                onClick={() => handleClaimRewards(machine.id)}
                                disabled={!canClaim}
                                size="sm"
                                variant={canClaim ? "default" : "outline"}
                              >
                                {canClaim ? "Claim" : "Pending"}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Investment Tab */}
          {activeTab === "investment" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Investment Center</h2>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Create New Investment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Investment Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum investment: $100</p>
                  </div>
                  
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  {success && <p className="text-green-600 text-sm">{success}</p>}
                  
                  <Button 
                    onClick={handleInvest} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={user.machines.length >= 5}
                  >
                    {user.machines.length >= 5 ? "Maximum Machines Reached" : "Create Investment"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">My Portfolio</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Invested</p>
                      <p className="text-3xl font-bold text-gray-900">${user.totalInvested.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Earned</p>
                      <p className="text-3xl font-bold text-green-600">${user.claimedBalance.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">ROI</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {user.totalInvested > 0 ? ((user.claimedBalance / user.totalInvested) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {user.machines.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Time Machines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.machines.map((machine, index) => (
                        <div key={machine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{machine.name}</h4>
                              <p className="text-sm text-gray-600">
                                Invested: ${machine.investmentAmount} • Earned: ${machine.currentEarnings}
                              </p>
                            </div>
                          </div>
                          <Badge variant={machine.isActive ? "default" : "secondary"}>
                            {machine.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Investments Yet</h3>
                    <p className="text-gray-600 mb-4">Start investing to build your portfolio</p>
                    <Button onClick={() => setActiveTab("investment")}>
                      Create First Investment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === "withdraw" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Withdraw Funds</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Request Withdrawal
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Available balance: ${user.claimedBalance.toFixed(2)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Withdrawal Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Crypto Wallet Address</label>
                    <Input
                      type="text"
                      placeholder="Enter wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  {success && <p className="text-green-600 text-sm">{success}</p>}
                  
                  <Button 
                    onClick={handleWithdraw} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={user.claimedBalance <= 0}
                  >
                    Request Withdrawal
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* My Machines Tab */}
          {activeTab === "my-machines" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">My Time Machines</h2>
              
              {user.machines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.machines.map((machine, index) => {
                    const timeSinceLastClaim = Date.now() - machine.lastClaimedAt
                    const canClaim = timeSinceLastClaim >= machine.claimIntervalMs
                    const timeUntilNextClaim = machine.claimIntervalMs - timeSinceLastClaim
                    const hoursUntilClaim = Math.max(0, Math.ceil(timeUntilNextClaim / (1000 * 60 * 60)))

                    return (
                      <Card key={machine.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            Machine {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Invested:</span>
                              <span className="text-sm font-medium">${machine.investmentAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Earned:</span>
                              <span className="text-sm font-medium text-green-600">${machine.currentEarnings}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Next Reward:</span>
                              <span className="text-sm font-medium">${machine.rewardAmount}</span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            {canClaim ? (
                              <Button 
                                onClick={() => handleClaimRewards(machine.id)}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                Claim ${machine.rewardAmount}
                              </Button>
                            ) : (
                              <Button disabled className="w-full">
                                Next claim in {hoursUntilClaim}h
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Machines</h3>
                    <p className="text-gray-600 mb-4">Create your first investment to unlock time machines</p>
                    <Button onClick={() => setActiveTab("investment")}>
                      Start Investing
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Referral Program</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Your Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={user.referralCode} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode)
                        setSuccess("Referral code copied!")
                      }}
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{user.referrals.length}</p>
                      <p className="text-sm text-gray-600">Total Referrals</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${(user.referrals.length * 5).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Referral Earnings</p>
                    </div>
                  </div>
                  
                  {success && <p className="text-green-600 text-sm">{success}</p>}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <Input value={user.username} readOnly className="mt-1" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input value={user.email} readOnly className="mt-1" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Tier</label>
                    <Input value={user.tier} readOnly className="mt-1 capitalize" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <Input 
                      value={new Date(user.createdAt).toLocaleDateString()} 
                      readOnly 
                      className="mt-1" 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={toggleTheme}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    {mounted && theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    Switch to {mounted && theme === "dark" ? "Light" : "Dark"} Mode
                  </Button>
                  
                  <Button 
                    onClick={onLogout} 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Default for other tabs */}
          {!["dashboard", "investment", "portfolio", "withdraw", "my-machines", "referrals", "settings"].includes(activeTab) && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {sidebarItems.find(item => item.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600">This section will be available soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}