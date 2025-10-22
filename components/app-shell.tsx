"use client"

import type { ReactNode } from "react"
import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, BarChart3, ShoppingBag, Users, Settings as SettingsIcon, LogOut, Shield } from "lucide-react"

interface AppShellProps {
  user: User
  currentView: string
  onNavigate: (view: string) => void
  onLogout: () => void
  onAdmin?: () => void
  children: ReactNode
}

export function AppShell({ user, currentView, onNavigate, onLogout, onAdmin, children }: AppShellProps) {
  const isAdmin = user.email === "admin@chronostime.com"

  const NavButton = (
    {
      view,
      label,
      icon: Icon,
    }: { view: string; label: string; icon: any }
  ) => (
    <Button
      onClick={() => onNavigate(view)}
      variant={currentView === view ? "default" : "ghost"}
      className={`w-full justify-start gap-3 rounded-lg transition-all ${
        currentView === view
          ? "bg-cyan-500/15 text-cyan-600 border border-cyan-600/30"
          : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
      }`}
    >
      <Icon size={18} />
      {label}
    </Button>
  )

  return (
    <div className="app-light min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[260px_1fr] grid-rows-[64px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="col-start-1 row-span-2 border-r border-border bg-card/60 backdrop-blur-xl">
          <div className="h-16 px-4 flex items-center gap-3 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-white text-base font-bold">⏱</span>
            </div>
            <div className="leading-tight">
              <div className="font-bold">ChronosTime</div>
              <div className="text-xs text-muted-foreground">Investment Platform</div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {NavButton({ view: "dashboard", label: "Overview", icon: LayoutDashboard })}
            {NavButton({ view: "analytics", label: "Analytics", icon: BarChart3 })}
            {NavButton({ view: "marketplace", label: "Marketplace", icon: ShoppingBag })}
            {NavButton({ view: "referrals", label: "Referrals", icon: Users })}
            {NavButton({ view: "settings", label: "Settings", icon: SettingsIcon })}
            {isAdmin && (
              <Button onClick={onAdmin} className="w-full justify-start gap-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mt-2">
                <Shield size={18} /> Admin
              </Button>
            )}
          </nav>
          <div className="px-3 mt-auto pb-4 hidden md:block">
            <Button onClick={onLogout} variant="outline" className="w-full justify-center border-border hover:bg-muted">
              <LogOut size={16} />
            </Button>
          </div>
        </aside>

        {/* Topbar */}
        <header className="col-start-2 row-start-1 h-16 border-b border-border bg-card/60 backdrop-blur-xl flex items-center">
          <div className="w-full px-5 flex items-center gap-3">
            <div className="text-sm text-muted-foreground capitalize">{currentView}</div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden lg:block">
                <Input placeholder="Search" className="glass-sm w-80" />
              </div>
              <Button className="btn-primary h-9 px-4">Save</Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="col-start-2 row-start-2 p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
