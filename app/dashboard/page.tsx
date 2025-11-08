"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/storage'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Wallet, 
  Zap,
  DollarSign,
  Clock,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userMachines, setUserMachines] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await storage.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  useEffect(() => {
    const fetchUserMachines = async () => {
      if (!user?.id) return
      
      try {
        const res = await fetch(`/api/original-machines?user_id=${user.id}`)
        const data = await res.json()
        
        if (res.ok) {
          setUserMachines(data.machines || [])
        }
      } catch (error) {
        console.error('Error fetching user machines:', error)
      }
    }
    
    fetchUserMachines()
  }, [user?.id])

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser)
  }

  const handleLogout = async () => {
    localStorage.removeItem('chronostime_current_user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3CE7FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = [
    {
      title: "Available Balance",
      value: `$${(user.balance || 0).toLocaleString()}`,
      icon: Wallet,
      color: "from-[#3CE7FF] to-[#6C63FF]",
      badge: "Lifetime",
      change: null
    },
    {
      title: "Total Invested",
      value: `$${(user.totalInvested || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "from-[#6C63FF] to-[#EFBF60]",
      badge: "Total",
      change: null
    },
    {
      title: "Total Earned",
      value: `$${(user.totalEarned || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-[#22c55e] to-[#3CE7FF]",
      badge: "Active",
      change: "+12.5%"
    },
    {
      title: "Time Machines",
      value: userMachines.length.toString(),
      icon: Zap,
      color: "from-[#EFBF60] to-[#6C63FF]",
      badge: "Active",
      change: null
    }
  ]

  const recentActivity = [
    { type: "purchase", desc: "Purchased Time Machine Level 3", amount: "-$500", time: "2 hours ago", icon: ShoppingBag, color: "text-[#6C63FF]" },
    { type: "earning", desc: "Weekly earnings credited", amount: "+$45.50", time: "1 day ago", icon: TrendingUp, color: "text-green-400" },
    { type: "topup", desc: "Balance top-up via Stripe", amount: "+$1,000", time: "3 days ago", icon: Wallet, color: "text-[#3CE7FF]" },
  ]

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="glass p-6 rounded-2xl border border-[#3CE7FF]/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                Welcome back, {user.username}!
              </h2>
              <p className="text-gray-400">
                Your investment portfolio is performing well
              </p>
            </div>
            <Button 
              onClick={() => router.push('/marketplace')}
              className="btn-primary px-6 py-3"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Buy Time Machine
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass border-[#3CE7FF]/20 hover:border-[#3CE7FF]/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.badge && (
                    <Badge className="bg-[#3CE7FF]/10 text-[#3CE7FF] border-[#3CE7FF]/30 text-xs">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  {stat.change && (
                    <span className="text-green-400 text-sm flex items-center">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="glass border-[#3CE7FF]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-[#3CE7FF]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 glass-sm rounded-xl border border-[#3CE7FF]/10 hover:border-[#3CE7FF]/30 transition-all">
                  <div className={`w-10 h-10 bg-[#0b1220] rounded-lg flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.desc}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <p className={`text-sm font-bold ${activity.amount.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                    {activity.amount}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-[#3CE7FF]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-[#3CE7FF]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/wallet')}
                className="w-full justify-start glass-sm border border-[#3CE7FF]/20 hover:border-[#3CE7FF]/40 text-white h-14"
                variant="ghost"
              >
                <Wallet className="w-5 h-5 mr-3 text-[#3CE7FF]" />
                <div className="text-left">
                  <p className="font-semibold">Top Up Balance</p>
                  <p className="text-xs text-gray-400">Add funds to your account</p>
                </div>
              </Button>
              <Button 
                onClick={() => router.push('/marketplace')}
                className="w-full justify-start glass-sm border border-[#6C63FF]/20 hover:border-[#6C63FF]/40 text-white h-14"
                variant="ghost"
              >
                <ShoppingBag className="w-5 h-5 mr-3 text-[#6C63FF]" />
                <div className="text-left">
                  <p className="font-semibold">Browse Marketplace</p>
                  <p className="text-xs text-gray-400">Purchase time machines</p>
                </div>
              </Button>
              <Button 
                onClick={() => router.push('/referrals')}
                className="w-full justify-start glass-sm border border-[#EFBF60]/20 hover:border-[#EFBF60]/40 text-white h-14"
                variant="ghost"
              >
                <Users className="w-5 h-5 mr-3 text-[#EFBF60]" />
                <div className="text-left">
                  <p className="font-semibold">Invite Friends</p>
                  <p className="text-xs text-gray-400">Earn referral bonuses</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Time Machines */}
        {userMachines.length > 0 && (
          <Card className="glass border-[#3CE7FF]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-[#3CE7FF]" />
                  Your Time Machines ({userMachines.length})
                </CardTitle>
                <Button 
                  onClick={() => router.push('/portfolio')}
                  variant="ghost"
                  size="sm"
                  className="text-[#3CE7FF] hover:text-[#3CE7FF]/80"
                >
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMachines.slice(0, 3).map((machine, index) => (
                  <div key={index} className="glass-sm p-4 rounded-xl border border-[#3CE7FF]/10 hover:border-[#3CE7FF]/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30">
                        Level {machine.level}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Investment</p>
                    <p className="text-xl font-bold text-white mb-1">
                      ${machine.investment_amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Weekly ROI: {machine.weekly_roi || 0}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
