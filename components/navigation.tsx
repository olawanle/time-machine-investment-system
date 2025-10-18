"use client"

import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Shield, BarChart3 } from "lucide-react"

interface NavigationProps {
  user: User
  currentView: string
  onNavigate: (view: string) => void
  onLogout: () => void
  onAdmin: () => void
}

export function Navigation({ user, currentView, onNavigate, onLogout, onAdmin }: NavigationProps) {
  const isAdmin = user.email === "admin@chronostime.com"

  return (
    <header className="glass border-b border-cyan-400/30 sticky top-0 z-50 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
              <span className="text-white font-bold text-lg">⏱</span>
            </div>
            <div>
              <span className="font-bold text-lg gradient-text">ChronosTime</span>
              <p className="text-xs text-muted-foreground">Investment Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Button
              onClick={() => onNavigate("dashboard")}
              variant={currentView === "dashboard" ? "default" : "ghost"}
              className={`gap-2 transition-all ${
                currentView === "dashboard"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Button>
            <Button
              onClick={() => onNavigate("analytics")}
              variant={currentView === "analytics" ? "default" : "ghost"}
              className={`gap-2 transition-all ${
                currentView === "analytics"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
              }`}
            >
              <BarChart3 size={18} />
              Analytics
            </Button>
            <Button
              onClick={() => onNavigate("marketplace")}
              variant={currentView === "marketplace" ? "default" : "ghost"}
              className={`gap-2 transition-all ${
                currentView === "marketplace"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
              }`}
            >
              <ShoppingBag size={18} />
              Marketplace
            </Button>
            <Button
              onClick={() => onNavigate("referrals")}
              variant={currentView === "referrals" ? "default" : "ghost"}
              className={`gap-2 transition-all ${
                currentView === "referrals"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
              }`}
            >
              <Users size={18} />
              Referrals
            </Button>
            <Button
              onClick={() => onNavigate("settings")}
              variant={currentView === "settings" ? "default" : "ghost"}
              className={`gap-2 transition-all ${
                currentView === "settings"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
              }`}
            >
              <Settings size={18} />
              Settings
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                onClick={onAdmin}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 shadow-lg shadow-purple-500/30"
              >
                <Shield size={18} />
                Admin
              </Button>
            )}
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-cyan-400/30 hover:bg-cyan-500/10 text-muted-foreground hover:text-foreground transition-all bg-transparent"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
