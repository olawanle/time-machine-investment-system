"use client"

import { useState, useEffect } from "react"
import { storage, type WithdrawalRequest, type User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChronosTimeLogo } from "./logo"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  ArrowLeft,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react"

interface AdminPanelProps {
  onLogout: () => void
  onBackToDashboard: () => void
}

export function AdminPanel({ onLogout, onBackToDashboard }: AdminPanelProps) {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "withdrawals" | "users">("overview")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvested: 0,
    totalClaimed: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const requests = storage.getWithdrawalRequests()
      const allUsers = storage.getAllUsers()

      setWithdrawalRequests(requests)
      setUsers(allUsers)

      const totalInvested = allUsers.reduce((sum, u) => sum + u.balance, 0)
      const totalClaimed = allUsers.reduce((sum, u) => sum + u.claimedBalance, 0)
      const pendingWithdrawals = requests.filter((r) => r.status === "pending").length
      const totalWithdrawn = requests.filter((r) => r.status === "approved").reduce((sum, r) => sum + r.amount, 0)
      const activeUsers = allUsers.filter((u) => u.machines.length > 0).length

      setStats({
        totalUsers: allUsers.length,
        totalInvested,
        totalClaimed,
        pendingWithdrawals,
        totalWithdrawn,
        activeUsers,
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleApproveWithdrawal = (id: string) => {
    storage.updateWithdrawalRequest(id, {
      status: "approved",
      processedAt: Date.now(),
    })
    setWithdrawalRequests(storage.getWithdrawalRequests())
  }

  const handleRejectWithdrawal = (id: string) => {
    storage.updateWithdrawalRequest(id, {
      status: "rejected",
      processedAt: Date.now(),
    })
    setWithdrawalRequests(storage.getWithdrawalRequests())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <ChronosTimeLogo />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
            <div className="h-6 w-px bg-border" />
            <Button onClick={onBackToDashboard} variant="ghost" className="btn-ghost gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <Button onClick={onLogout} variant="ghost" className="btn-ghost gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass glow-cyan card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total Users</CardDescription>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeUsers} active</p>
            </CardContent>
          </Card>

          <Card className="glass glow-blue card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total Invested</CardDescription>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">${(stats.totalInvested / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Platform TVL</p>
            </CardContent>
          </Card>

          <Card className="glass glow-success card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total Claimed</CardDescription>
                <Zap className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${(stats.totalClaimed / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Rewards paid</p>
            </CardContent>
          </Card>

          <Card className="glass card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Pending Withdrawals</CardDescription>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pendingWithdrawals}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="glass card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total Withdrawn</CardDescription>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">${(stats.totalWithdrawn / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Processed</p>
            </CardContent>
          </Card>

          <Card className="glass card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Platform Health</CardDescription>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">98%</div>
              <p className="text-xs text-muted-foreground mt-1">Operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["overview", "withdrawals", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-card/50 text-muted-foreground hover:bg-card/80"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Withdrawal Requests Tab */}
        {activeTab === "withdrawals" && (
          <Card className="glass glow-cyan">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Withdrawal Requests
                  </CardTitle>
                  <CardDescription>Manage user payout requests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">User</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Wallet</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No withdrawal requests
                        </td>
                      </tr>
                    ) : (
                      withdrawalRequests.map((request) => {
                        const user = users.find((u) => u.id === request.userId)
                        return (
                          <tr key={request.id} className="border-b border-border hover:bg-card/50 transition-colors">
                            <td className="py-3 px-4 font-semibold">{user?.username || "Unknown"}</td>
                            <td className="py-3 px-4 text-cyan-400 font-bold">{formatCurrency(request.amount)}</td>
                            <td className="py-3 px-4 font-mono text-xs text-muted-foreground truncate max-w-xs">
                              {request.walletAddress}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                  request.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : request.status === "approved"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {request.status === "pending" && <Clock className="w-3 h-3" />}
                                {request.status === "approved" && <CheckCircle className="w-3 h-3" />}
                                {request.status === "rejected" && <XCircle className="w-3 h-3" />}
                                {request.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {request.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApproveWithdrawal(request.id)}
                                    size="sm"
                                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectWithdrawal(request.id)}
                                    size="sm"
                                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="glass glow-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    User Management
                  </CardTitle>
                  <CardDescription>All registered users and their statistics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Username</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Tier</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Invested</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Claimed</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Machines</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users yet
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-card/50 transition-colors">
                          <td className="py-3 px-4 font-semibold">{user.username}</td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                              {user.tier.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-cyan-400 font-semibold">{formatCurrency(user.balance)}</td>
                          <td className="py-3 px-4 text-green-400 font-semibold">
                            {formatCurrency(user.claimedBalance)}
                          </td>
                          <td className="py-3 px-4 text-blue-400 font-semibold">{user.machines.length}/5</td>
                          <td className="py-3 px-4 text-yellow-400 font-semibold">{user.referrals.length}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass glow-cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Platform Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="text-muted-foreground">Total Platform Value</span>
                  <span className="text-xl font-bold text-cyan-400">
                    ${((stats.totalInvested + stats.totalClaimed) / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="text-muted-foreground">Average Investment</span>
                  <span className="text-xl font-bold text-blue-400">
                    ${stats.totalUsers > 0 ? (stats.totalInvested / stats.totalUsers).toFixed(0) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="text-muted-foreground">Withdrawal Rate</span>
                  <span className="text-xl font-bold text-green-400">
                    {stats.totalClaimed > 0 ? ((stats.totalWithdrawn / stats.totalClaimed) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass glow-blue">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="text-xl font-bold text-green-400">{stats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="text-muted-foreground">Pending Approvals</span>
                  <span className="text-xl font-bold text-yellow-400">{stats.pendingWithdrawals}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="text-muted-foreground">System Status</span>
                  <span className="text-xl font-bold text-green-400">Operational</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
