"use client"

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  LogOut,
  ShoppingBag
} from "lucide-react"
import { useState, useEffect } from "react"

interface DashboardLayoutProps {
  children: ReactNode
  user: any
  onLogout?: () => void
}

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Force dark theme for neon design
    setTheme('dark')
    document.documentElement.classList.add('dark')
  }, [])

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "marketplace", label: "Time Machines", icon: Zap, path: "/marketplace", badge: "Shop" },
    { id: "portfolio", label: "My Portfolio", icon: Activity, path: "/portfolio" },
    { id: "wallet", label: "Wallet", icon: Wallet, path: "/wallet" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "referrals", label: "Referrals", icon: Users, path: "/referrals" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ]

  const handleLogout = () => {
    localStorage.removeItem('chronostime_current_user')
    if (onLogout) {
      onLogout()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] flex">
      {/* Sidebar - Neon Theme */}
      <div className="w-64 glass border-r border-[#3CE7FF]/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#3CE7FF]/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3CE7FF] to-[#6C63FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#3CE7FF]/30">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">ChronosTime</h1>
              <p className="text-xs text-[#3CE7FF]">Investment Platform</p>
            </div>
          </div>
        </div>

        {/* User Balance Card */}
        <div className="p-4 border-b border-[#3CE7FF]/20">
          <div className="glass-sm p-3 rounded-xl border border-[#3CE7FF]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Balance</span>
              <Wallet className="w-4 h-4 text-[#3CE7FF]" />
            </div>
            <p className="text-2xl font-bold gradient-text">
              ${(user?.balance || 0).toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-400">Tier:</span>
              <Badge className="bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30 text-xs">
                {user?.tier || 'Bronze'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#3CE7FF]/20 to-[#6C63FF]/20 text-[#3CE7FF] border border-[#3CE7FF]/30 shadow-lg shadow-[#3CE7FF]/20"
                    : "text-gray-400 hover:bg-[#0b1220]/50 hover:text-white hover:border hover:border-[#3CE7FF]/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="bg-[#6C63FF] text-white text-xs px-2 py-0.5 shadow-lg shadow-[#6C63FF]/30">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#3CE7FF]/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3CE7FF] to-[#6C63FF] rounded-full flex items-center justify-center shadow-lg shadow-[#3CE7FF]/30">
              <span className="text-black font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all duration-300"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Neon Theme */}
        <header className="glass border-b border-[#3CE7FF]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                {sidebarItems.find(item => item.path === pathname)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {pathname === '/dashboard' && 'Your investment portfolio is performing well'}
                {pathname === '/marketplace' && 'Buy time machines and start earning passive income'}
                {pathname === '/portfolio' && 'Manage your time machine investments'}
                {pathname === '/wallet' && 'Manage your funds and transactions'}
                {pathname === '/analytics' && 'Track your performance metrics'}
                {pathname === '/referrals' && 'Invite friends and earn rewards'}
                {pathname === '/settings' && 'Manage your account preferences'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 glass-sm px-4 py-2 rounded-xl border border-[#3CE7FF]/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="glass-sm border border-[#3CE7FF]/20 hover:border-[#3CE7FF]/40 rounded-xl"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-[#3CE7FF]" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817]">
          {children}
        </main>
      </div>
    </div>
  )
}
