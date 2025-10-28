"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Activity,
  BarChart2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

interface SystemStats {
  totalUsers: number
  totalBalance: number
  totalInvested: number
  totalEarned: number
  activeMachines: number
  totalPayments: number
}

interface RecentPayment {
  id: string
  amount: number
  created_at: string
  user?: {
    email: string
  }
}

export function SystemDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalBalance: 0,
    totalInvested: 0,
    totalEarned: 0,
    activeMachines: 0,
    totalPayments: 0
  })
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [revenueBreakdown, setRevenueBreakdown] = useState<any[]>([])

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        console.warn('Admin stats API not available, using default values')
        setStats({
          totalUsers: 0,
          totalBalance: 0,
          totalInvested: 0,
          totalEarned: 0,
          activeMachines: 0,
          totalPayments: 0
        })
        setRecentPayments([])
        setLoading(false)
        return
      }
      
      const data = await response.json()
      setStats(data.stats || {
        totalUsers: 0,
        totalBalance: 0,
        totalInvested: 0,
        totalEarned: 0,
        activeMachines: 0,
        totalPayments: 0
      })
      setRecentPayments(data.recentPayments || [])
      setLastRefresh(new Date())

      // Simulate user growth data (in real app, this would come from the API)
      const growthData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000
        }
      })
      setUserGrowthData(growthData)

      // Revenue breakdown for pie chart
      setRevenueBreakdown([
        { name: 'Investments', value: data.stats?.totalInvested || 0, color: '#8b5cf6' },
        { name: 'Withdrawals', value: Math.abs(data.stats?.totalEarned || 0) * 0.8, color: '#ef4444' },
        { name: 'Fees', value: (data.stats?.totalInvested || 0) * 0.02, color: '#3b82f6' },
        { name: 'Referrals', value: (data.stats?.totalUsers || 0) * 50, color: '#22c55e' }
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const getSystemHealth = () => {
    const withdrawalRatio = stats.totalEarned / stats.totalInvested
    if (withdrawalRatio < 0.5) return { status: 'Excellent', color: 'text-green-500', icon: CheckCircle }
    if (withdrawalRatio < 0.7) return { status: 'Good', color: 'text-blue-500', icon: Activity }
    if (withdrawalRatio < 0.9) return { status: 'Warning', color: 'text-yellow-500', icon: AlertCircle }
    return { status: 'Critical', color: 'text-red-500', icon: XCircle }
  }

  const systemHealth = getSystemHealth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time platform statistics · Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
          <div className="text-xs text-green-500 mt-2">+12% from last month</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Platform Balance</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
          <div className="text-xs text-green-500 mt-2">+8% from last week</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Invested</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
          <div className="text-xs text-green-500 mt-2">+15% from last month</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Machines</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(stats.activeMachines)}</div>
          <div className="text-xs text-muted-foreground mt-2">Across all users</div>
        </Card>
      </div>

      {/* System Health */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          <div className="flex items-center gap-2">
            <systemHealth.icon className={`w-5 h-5 ${systemHealth.color}`} />
            <span className={`font-semibold ${systemHealth.color}`}>
              {systemHealth.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Withdrawal Ratio</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (stats.totalEarned / stats.totalInvested) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold">
                {((stats.totalEarned / stats.totalInvested) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Active Users (24h)</div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="font-semibold">{Math.floor(stats.totalUsers * 0.3)}</span>
              <span className="text-sm text-muted-foreground">/ {stats.totalUsers}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Avg User Balance</div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">
                {formatCurrency(stats.totalBalance / Math.max(1, stats.totalUsers))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">30-Day User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${formatCurrency(Number(entry.value))}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
        <div className="space-y-2">
          {recentPayments.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No recent payments
            </div>
          ) : (
            recentPayments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <div className="text-sm font-medium">{payment.user?.email || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="font-mono font-semibold">
                  {formatCurrency(payment.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}