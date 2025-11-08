"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home,
  Zap, 
  Wallet, 
  BarChart3,
  Users,
  Settings,
  LogOut,
  ShoppingBag,
  TrendingUp,
  Activity
} from "lucide-react"
import type { User } from "@/lib/storage"

interface UserDashboardProps {
  user: User
  onLogout: () => void
}

export function UserDashboard({ user: initialUser, onLogout }: UserDashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [activeSection, setActiveSection] = useState("dashboard")

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "marketplace", label: "Time Machines", icon: Zap, badge: "Shop" },
    { id: "portfolio", label: "My Portfolio", icon: Activity },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId)
    // You can add routing logic here if needed
    // router.push(`/dashboard?section=${sectionId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">⏱</span>
            </div>
            <div>
              <h1 className="font-bold text-white">ChronosTime</h1>
              <p className="text-xs text-cyan-400">Investment Platform</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-xs text-slate-400 mb-1">Balance</p>
            <p className="text-2xl font-bold text-white">${(user.balance || 0).toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">Tier:</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {user.tier || 'bronze'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-cyan-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 text-sm">Your investment portfolio is performing well</p>
            </div>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Buy Time Machine
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Stats Cards */}
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-cyan-400" />
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Lifetime</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">${(user.balance || 0).toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Total</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-white">${(user.totalInvested || 0).toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-green-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-white">${(user.totalEarned || 0).toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-1">Time Machines</p>
                <p className="text-2xl font-bold text-white">{user.machines?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Purchased Time Machine Level 3</p>
                      <p className="text-xs text-slate-400">2 hours ago</p>
                    </div>
                    <p className="text-sm font-bold text-slate-400">-$500</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-slate-800/50 hover:bg-slate-800 text-white border border-cyan-500/20">
                  <Wallet className="w-5 h-5 mr-3 text-cyan-400" />
                  <div className="text-left">
                    <p className="font-semibold">Top Up Balance</p>
                    <p className="text-xs text-slate-400">Add funds to your account</p>
                  </div>
                </Button>
                <Button className="w-full justify-start bg-slate-800/50 hover:bg-slate-800 text-white border border-purple-500/20">
                  <ShoppingBag className="w-5 h-5 mr-3 text-purple-400" />
                  <div className="text-left">
                    <p className="font-semibold">Browse Marketplace</p>
                    <p className="text-xs text-slate-400">Purchase time machines</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
