"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard,
  Store,
  Wallet,
  TrendingUp,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight
} from "lucide-react"
import type { User } from "@/lib/storage"

interface ModernSidebarProps {
  user: User
  currentSection: string
  onSectionChange: (section: string) => void
  onLogout: () => void
}

export function ModernSidebar({ user, currentSection, onSectionChange, onLogout }: ModernSidebarProps) {
  const isAdmin = (user as any).is_admin === true

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Your investment overview',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'marketplace',
      label: 'Time Machines',
      icon: Store,
      description: 'Buy time machines',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      badge: 'Shop'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      description: 'Manage your funds',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Performance metrics',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'referrals',
      label: 'Referrals',
      icon: Users,
      description: 'Invite friends',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      badge: user.referrals?.length > 0 ? `${user.referrals.length}` : undefined
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30'
    }
  ]

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      description: 'Platform management',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      badge: 'Admin'
    })
  }

  return (
    <div className="w-80 bg-slate-900/50 border-r border-slate-800 backdrop-blur-sm flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{user.username}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-sm font-semibold text-green-400">${user.claimedBalance.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400">Tier</p>
            <p className="text-sm font-semibold text-purple-400 capitalize">{user.tier || 'bronze'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg transition-all
                ${isActive 
                  ? `${item.bgColor} ${item.borderColor} border ${item.color}` 
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                }
              `}
            >
              <div className={`p-2 ${isActive ? item.bgColor : 'bg-slate-800/50'} rounded-lg`}>
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.badge && (
                    <Badge className={`${item.bgColor} ${item.color} ${item.borderColor} text-xs`}>
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              {isActive && <ChevronRight className={`w-4 h-4 ${item.color}`} />}
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
