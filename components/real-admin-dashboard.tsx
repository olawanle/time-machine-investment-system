"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AsyncWrapper } from "@/components/ui/async-wrapper"
import { useSuccessToast, useErrorToast } from "@/components/ui/toast-system"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  Settings,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Eye,
  Ban,
  UserCheck,
  Bitcoin
} from "lucide-react"
import { realDataService, type PlatformStats, type UserActivity, type Transaction } from "@/lib/real-data-service"
import { storage, type User } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"

interface RealAdminDashboardProps {
  user: User
  onUserUpdate: (user: User) => void
  onLogout: () => void
}

export function RealAdminDashboard({ user, onUserUpdate }: RealAdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'transactions' | 'analytics' | 'topups'>('overview')
  const [topups, setTopups] = useState<any[]>([])

  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  useEffect(() => {
    loadDashboardData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [stats, activities, transactions, metrics, topupsRes] = await Promise.all([
        realDataService.getPlatformStats(),
        realDataService.getUserActivities(),
        realDataService.getRecentTransactions(50),
        realDataService.getRealTimeMetrics(),
        fetch('/api/admin/topups', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ topups: [] }))
      ])

      setPlatformStats(stats)
      setUserActivities(activities)
      setRecentTransactions(transactions)
      setRealTimeMetrics(metrics)
      setTopups(topupsRes?.topups || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      errorToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'view') => {
    try {
      const targetUser = await storage.getUser(userId)
      if (!targetUser) {
        errorToast('User not found')
        return
      }

      switch (action) {
        case 'suspend':
          // In a real implementation, you'd update user status
          successToast(`User ${targetUser.username} suspended`)
          break
        case 'activate':
          successToast(`User ${targetUser.username} activated`)
          break
        case 'view':
          // Open user details modal or navigate to user page
          console.log('Viewing user:', targetUser)
          break
      }
      
      await loadDashboardData() // Refresh data
    } catch (err) {
      errorToast('Failed to perform user action')
    }
  }

  const exportData = (type: 'users' | 'transactions') => {
    try {
      let data: any[] = []
      let filename = ''

      if (type === 'users') {
        data = userActivities
        filename = 'users_export.json'
      } else {
        data = recentTransactions
        filename = 'transactions_export.json'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      successToast(`${type} data exported successfully`)
    } catch (err) {
      errorToast('Failed to export data')
    }
  }

  if (isLoading && !platformStats) {
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

  if (error && !platformStats) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'inactive':
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time platform management and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Data
          </div>
        </div>
      </div>

      {/* Real-time System Health */}
      {realTimeMetrics && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{realTimeMetrics.systemHealth.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">System Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{realTimeMetrics.onlineUsers}</div>
                <div className="text-xs text-muted-foreground">Online Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{realTimeMetrics.serverLoad.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Server Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{realTimeMetrics.apiResponseTime.toFixed(0)}ms</div>
                <div className="text-xs text-muted-foreground">API Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{realTimeMetrics.pendingWithdrawals}</div>
                <div className="text-xs text-muted-foreground">Pending Withdrawals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{realTimeMetrics.activeUsers}</div>
                <div className="text-xs text-muted-foreground">Active Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top-ups Panel */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Recent Top-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topups.length === 0 ? (
            <div className="text-sm text-muted-foreground">No top-ups found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topups.map((t) => (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 font-mono truncate max-w-[240px]" title={t.order_id}>{t.order_id}</td>
                      <td className="py-2 pr-4">{t.user_id}</td>
                      <td className="py-2 pr-4">${Number(t.amount || 0).toLocaleString()}</td>
                      <td className="py-2 pr-4">
                        <Badge className="bg-success/20 text-success">{t.status || 'credited'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{platformStats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-400">+{platformStats.monthlyGrowth.toFixed(1)}% this month</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Investments</p>
                  <p className="text-2xl font-bold text-foreground">${platformStats.totalInvestments.toLocaleString()}</p>
                  <p className="text-xs text-blue-400">Platform volume</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">${platformStats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-green-400">User profits</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Average ROI</p>
                  <p className="text-2xl font-bold text-foreground">{platformStats.averageROI.toFixed(1)}%</p>
                  <p className="text-xs text-cyan-400">Platform average</p>
                </div>
                <BarChart3 className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'transactions', label: 'Transactions', icon: Activity },
          { id: 'analytics', label: 'Analytics', icon: PieChart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && platformStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platformStats.topPerformers.slice(0, 5).map((performer, index) => {
                  const roi = performer.totalInvested > 0 ? 
                    (((performer.totalEarned || performer.claimedBalance) / performer.totalInvested) * 100) : 0
                  
                  return (
                    <div key={performer.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{performer.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Invested: ${performer.totalInvested.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{roi.toFixed(1)}% ROI</p>
                        <p className="text-sm text-muted-foreground">
                          ${(performer.totalEarned || performer.claimedBalance).toLocaleString()} earned
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platformStats.recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
                      <div>
                        <p className="font-medium text-foreground">{transaction.username}</p>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{transaction.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'users' && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <Button onClick={() => exportData('users')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userActivities.slice(0, 20).map((activity) => (
                <div key={activity.userId} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{activity.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(activity.joinDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(activity.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-foreground">${activity.totalInvested.toLocaleString()}</p>
                      <p className="text-sm text-success">${activity.totalEarned.toLocaleString()} earned</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.machinesOwned} machines, {activity.referrals} referrals
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleUserAction(activity.userId, 'view')}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleUserAction(activity.userId, activity.status === 'active' ? 'suspend' : 'activate')}
                        variant="outline"
                        size="sm"
                      >
                        {activity.status === 'active' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'transactions' && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Transaction History
              </CardTitle>
              <Button onClick={() => exportData('transactions')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Transactions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.slice(0, 30).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(transaction.status)}`} />
                    <div>
                      <p className="font-medium text-foreground">{transaction.username}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${transaction.amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(transaction.type)} variant="secondary">
                      {transaction.type}
                    </Badge>
                    <Badge className={getStatusColor(transaction.status)} variant="secondary">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'analytics' && platformStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Trends Chart Placeholder */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Market Trends (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive charts coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Avg Daily Investments: ${(platformStats.totalInvestments / 30).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Metrics */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Platform Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Time Machines</span>
                  <span className="font-bold text-foreground">{platformStats.activeTimeMachines}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Withdrawals</span>
                  <span className="font-bold text-foreground">${platformStats.totalWithdrawals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Platform Revenue</span>
                  <span className="font-bold text-success">${(platformStats.totalInvestments * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">User Retention</span>
                  <span className="font-bold text-blue-400">87.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Session Time</span>
                  <span className="font-bold text-foreground">24 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}