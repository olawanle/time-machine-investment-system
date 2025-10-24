"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  LogOut,
  Ban,
  UserCheck,
  Wallet,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  Settings,
  BarChart3
} from "lucide-react"
import { adminApiService, type PlatformStats, type UserData } from "@/lib/admin-api-service"
import type { User } from "@/lib/storage"

interface ModernAdminDashboardProps {
  user: User
  onUserUpdate: (user: User) => void
  onLogout: () => void
}

export function ModernAdminDashboard({ user, onLogout }: ModernAdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [selectedView, setSelectedView] = useState<'dashboard' | 'users' | 'withdrawals'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')

  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statsData, usersData, withdrawalsData] = await Promise.all([
        adminApiService.getPlatformStats(),
        adminApiService.getAllUsers(),
        adminApiService.getPendingWithdrawals()
      ])
      setStats(statsData)
      setUsers(usersData)
      setWithdrawals(withdrawalsData)
    } catch (err) {
      errorToast('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserToggle = async (userId: string, isSuspended: boolean) => {
    try {
      const success = await adminApiService.updateUser(userId, 'suspend', !isSuspended)
      if (success) {
        successToast(isSuspended ? 'User activated' : 'User suspended')
        await loadData()
      }
    } catch {
      errorToast('Action failed')
    }
  }

  const handleWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      const success = await adminApiService.processWithdrawal(withdrawalId, action)
      if (success) {
        successToast(`Withdrawal ${action}d`)
        await loadData()
      }
    } catch {
      errorToast('Action failed')
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
      <AsyncWrapper isLoading={true} loadingText="Loading..." error={null} className="min-h-screen">
        <div />
      </AsyncWrapper>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Control Panel</h1>
            <p className="text-slate-400">Manage your platform in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={loadData} 
              variant="outline" 
              size="sm"
              className="border-slate-700 hover:border-cyan-500 hover:text-cyan-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-slate-700 hover:border-red-500 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-cyan-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-green-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    Platform
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Investments</p>
                  <p className="text-3xl font-bold text-white">${stats.totalInvested.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    Returns
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-white">${stats.totalEarned.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-orange-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-orange-400" />
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    {withdrawals.length} Pending
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">User Balances</p>
                  <p className="text-3xl font-bold text-white">${stats.totalBalance.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <Button
            onClick={() => setSelectedView('dashboard')}
            variant={selectedView === 'dashboard' ? 'default' : 'ghost'}
            className={selectedView === 'dashboard' 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
              : 'text-slate-400 hover:text-white'
            }
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            onClick={() => setSelectedView('users')}
            variant={selectedView === 'users' ? 'default' : 'ghost'}
            className={selectedView === 'users' 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
              : 'text-slate-400 hover:text-white'
            }
          >
            <Users className="w-4 h-4 mr-2" />
            Users ({users.length})
          </Button>
          <Button
            onClick={() => setSelectedView('withdrawals')}
            variant={selectedView === 'withdrawals' ? 'default' : 'ghost'}
            className={selectedView === 'withdrawals' 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
              : 'text-slate-400 hover:text-white'
            }
          >
            <Wallet className="w-4 h-4 mr-2" />
            Withdrawals ({withdrawals.length})
          </Button>
        </div>

        {/* Dashboard Overview */}
        {selectedView === 'dashboard' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Platform Metrics
                </CardTitle>
                <CardDescription className="text-slate-400">Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-400">Average Investment per User</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${stats.totalUsers > 0 ? (stats.totalInvested / stats.totalUsers).toFixed(2) : '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-400">Platform ROI</p>
                    <p className="text-2xl font-bold text-green-400">
                      {stats.totalInvested > 0 ? ((stats.totalEarned / stats.totalInvested) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-400">Active Time Machines</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.activeMachines}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-400">Latest platform actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {withdrawals.slice(0, 3).map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm text-white font-medium">Withdrawal Request</p>
                        <p className="text-xs text-slate-400">{w.user?.email || 'User'}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-orange-400">${w.amount}</p>
                  </div>
                ))}
                {withdrawals.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending actions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management */}
        {selectedView === 'users' && (
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">User Management</CardTitle>
                  <CardDescription className="text-slate-400">Manage platform members</CardDescription>
                </div>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                  {filteredUsers.length} users
                </Badge>
              </div>
              
              <div className="flex gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm"
                >
                  <option value="all">All Tiers</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              {filteredUsers.map((userData) => (
                <div 
                  key={userData.id} 
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {userData.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{userData.username}</p>
                      <p className="text-sm text-slate-400">{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Invested</p>
                      <p className="font-semibold text-green-400">${userData.total_invested?.toLocaleString() || '0'}</p>
                    </div>
                    <Badge className={
                      userData.tier === 'platinum' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      userData.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      userData.tier === 'silver' ? 'bg-slate-400/20 text-slate-400 border-slate-400/30' :
                      'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }>
                      {userData.tier}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserToggle(userData.id, userData.is_suspended || false)}
                      className={userData.is_suspended 
                        ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' 
                        : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                      }
                    >
                      {userData.is_suspended ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-1" />
                          Suspend
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Withdrawals Management */}
        {selectedView === 'withdrawals' && (
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Withdrawal Requests</CardTitle>
                  <CardDescription className="text-slate-400">Review and process withdrawals</CardDescription>
                </div>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  {withdrawals.length} pending
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div 
                  key={withdrawal.id} 
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-orange-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <Wallet className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">${withdrawal.amount.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">{withdrawal.user?.email || 'Unknown user'}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(withdrawal.created_at).toLocaleDateString()} at {new Date(withdrawal.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleWithdrawal(withdrawal.id, 'approve')}
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWithdrawal(withdrawal.id, 'reject')}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              
              {withdrawals.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">All Clear!</p>
                  <p className="text-sm">No pending withdrawal requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
