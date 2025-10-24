"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AsyncWrapper } from "@/components/ui/async-wrapper"
import { useSuccessToast, useErrorToast } from "@/components/ui/toast-system"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Ban,
  UserCheck,
  Bitcoin,
  Wallet,
  BarChart3,
  Search,
  Filter
} from "lucide-react"
import { adminApiService, type PlatformStats, type UserData } from "@/lib/admin-api-service"
import { formatCurrency } from "@/lib/utils"
import type { User } from "@/lib/storage"

interface EnhancedAdminDashboardProps {
  user: User
  onUserUpdate: (user: User) => void
  onLogout: () => void
}

export function EnhancedAdminDashboard({ user, onLogout }: EnhancedAdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'withdrawals' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')

  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      const [statsData, usersData, withdrawalsData] = await Promise.all([
        adminApiService.getPlatformStats(),
        adminApiService.getAllUsers(),
        adminApiService.getPendingWithdrawals()
      ])

      setStats(statsData)
      setUsers(usersData)
      setWithdrawals(withdrawalsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      errorToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, value?: any) => {
    try {
      const success = await adminApiService.updateUser(userId, action, value)
      if (success) {
        successToast(`User ${action} completed successfully`)
        await loadDashboardData()
      } else {
        errorToast('Failed to perform action')
      }
    } catch (err) {
      errorToast('Failed to perform user action')
    }
  }

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      const success = await adminApiService.processWithdrawal(withdrawalId, action)
      if (success) {
        successToast(`Withdrawal ${action}d successfully`)
        await loadDashboardData()
      } else {
        errorToast('Failed to process withdrawal')
      }
    } catch (err) {
      errorToast('Failed to process withdrawal')
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === 'all' || u.tier === filterTier
    return matchesSearch && matchesTier
  })

  if (isLoading && !stats) {
    return (
      <AsyncWrapper
        isLoading={true}
        loadingText="Loading admin dashboard..."
        error={null}
        className="min-h-[600px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  if (error && !stats) {
    return (
      <AsyncWrapper
        isLoading={false}
        error={error}
        onRetry={loadDashboardData}
        className="min-h-[600px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time platform management and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadDashboardData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="glass border-cyan-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold gradient-text">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-cyan-400">Platform members</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-green-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-3xl font-bold text-green-400">${stats.totalInvested.toLocaleString()}</p>
                  <p className="text-xs text-green-400">Platform volume</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-3xl font-bold text-blue-400">${stats.totalEarned.toLocaleString()}</p>
                  <p className="text-xs text-blue-400">User returns</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-yellow-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Machines</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.activeMachines.toLocaleString()}</p>
                  <p className="text-xs text-yellow-400">Currently running</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Activity className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-purple-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.totalPayments.toLocaleString()}</p>
                  <p className="text-xs text-purple-400">Completed</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Bitcoin className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-orange-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">User Balances</p>
                  <p className="text-3xl font-bold text-orange-400">${stats.totalBalance.toLocaleString()}</p>
                  <p className="text-xs text-orange-400">Total holdings</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Wallet className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('overview')}
          className={selectedTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400' : ''}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={selectedTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('users')}
          className={selectedTab === 'users' ? 'bg-cyan-500/20 text-cyan-400' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          Users ({users.length})
        </Button>
        <Button
          variant={selectedTab === 'withdrawals' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('withdrawals')}
          className={selectedTab === 'withdrawals' ? 'bg-cyan-500/20 text-cyan-400' : ''}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Withdrawals ({withdrawals.length})
        </Button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && stats && (
        <div className="space-y-4">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-400/30">
                    <p className="text-sm text-muted-foreground mb-1">Average Investment</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${stats.totalUsers > 0 ? (stats.totalInvested / stats.totalUsers).toFixed(2) : '0'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-500/5 rounded-lg border border-green-400/30">
                    <p className="text-sm text-muted-foreground mb-1">Average ROI</p>
                    <p className="text-2xl font-bold text-green-400">
                      {stats.totalInvested > 0 ? ((stats.totalEarned / stats.totalInvested) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-sm"
            >
              <option value="all">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {/* Users Table */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Platform Users</span>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-400/30">
                  {filteredUsers.length} users
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredUsers.map((userData) => (
                  <div key={userData.id} className="p-4 bg-card/50 rounded-lg border border-border hover:border-cyan-400/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                          {userData.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{userData.username}</p>
                          <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Invested</p>
                          <p className="font-semibold text-green-400">${userData.total_invested.toLocaleString()}</p>
                        </div>
                        <Badge className="capitalize">{userData.tier}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(userData.id, userData.is_suspended ? 'activate' : 'suspend')}
                          className={userData.is_suspended ? 'text-green-400' : 'text-orange-400'}
                        >
                          {userData.is_suspended ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'withdrawals' && (
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Withdrawals</span>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-400/30">
                {withdrawals.length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-4 bg-card/50 rounded-lg border border-orange-400/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">${withdrawal.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{withdrawal.user?.email || 'Unknown user'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                        className="text-red-400 hover:text-red-300"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No pending withdrawals
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
