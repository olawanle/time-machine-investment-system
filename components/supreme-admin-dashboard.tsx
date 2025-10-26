"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Settings,
  Ban,
  Check,
  X,
  Crown,
  Zap,
  Eye,
  Clock,
  Mail,
  BarChart3,
  Wallet
} from "lucide-react"

interface SupremeAdminDashboardProps {
  user: any
  onNavigate: (view: string) => void
  onLogout: () => void
}

export function SupremeAdminDashboard({ user, onNavigate, onLogout }: SupremeAdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalInvested: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0,
    activeMachines: 0,
    platformRevenue: 0,
    conversionRate: 0
  })

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {})
        setRecentActivity(data.recentActivity || [])
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
    }
  }

  return (
    <div className="min-h-screen admin-theme">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Admin Header */}
      <div className="relative z-10 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/50 to-fuchsia-950/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/50 admin-pulse">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold admin-gradient-text">Supreme Admin Control Center</h1>
                <p className="text-sm text-purple-300">Full platform management & oversight</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="admin-badge">
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
              <Button onClick={onLogout} variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats - Purple Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="admin-glass hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">
                    {stats.activeUsers} active now
                  </p>
                </div>
                <Users className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-fuchsia-300 mb-1">Platform Revenue</p>
                  <p className="text-3xl font-bold text-white">${stats.platformRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">
                    +{stats.conversionRate}% this week
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-fuchsia-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-300 mb-1">Total Invested</p>
                  <p className="text-3xl font-bold text-white">${stats.totalInvested.toLocaleString()}</p>
                  <p className="text-xs text-purple-400 mt-1">
                    {stats.activeMachines} machines active
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-pink-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300 mb-1">Pending Withdrawals</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingWithdrawals}</p>
                  <p className="text-xs text-red-400 mt-1">
                    Requires attention
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <Card className="admin-alert mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Critical Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="font-semibold text-white">{alert.title}</p>
                      <p className="text-sm text-red-300">{alert.description}</p>
                    </div>
                  </div>
                  <Button className="admin-btn-danger px-4 py-2 text-sm">
                    Review
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Admin Quick Actions */}
          <Card className="admin-glass">
            <CardHeader>
              <CardTitle className="admin-gradient-text flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onNavigate('admin')}
                className="admin-btn-primary h-20 flex flex-col items-center justify-center gap-2"
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button 
                onClick={() => onNavigate('withdraw')}
                className="admin-btn-primary h-20 flex flex-col items-center justify-center gap-2"
              >
                <Wallet className="w-6 h-6" />
                <span className="text-sm">Withdrawals</span>
              </Button>
              <Button 
                onClick={() => onNavigate('analytics')}
                className="admin-btn-primary h-20 flex flex-col items-center justify-center gap-2"
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button 
                onClick={() => onNavigate('settings')}
                className="admin-btn-primary h-20 flex flex-col items-center justify-center gap-2"
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="admin-glass">
            <CardHeader>
              <CardTitle className="admin-gradient-text flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-300">Server Status</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300">Database</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300">Payment Gateway</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300">Support Email</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Mail className="w-3 h-3 mr-1" />
                  support@chronostime.fund
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="admin-glass">
          <CardHeader>
            <CardTitle className="admin-gradient-text flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-purple-300 py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{activity.user}</p>
                        <p className="text-sm text-purple-300">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-sm text-purple-400">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-400 text-sm">
          <p>Admin Support: <a href="mailto:support@chronostime.fund" className="text-fuchsia-400 hover:underline">support@chronostime.fund</a></p>
        </div>
      </div>
    </div>
  )
}
