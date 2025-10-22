"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { AnalyticsPage } from "@/components/analytics-page"
import { AdminPanel } from "@/components/admin-panel"
import { Marketplace } from "@/components/marketplace"
import { Referrals } from "@/components/referrals"
import { Settings } from "@/components/settings"
import { AppShell } from "@/components/app-shell"
import { type User, storage } from "@/lib/storage"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<
    "auth" | "dashboard" | "analytics" | "marketplace" | "referrals" | "settings" | "admin"
  >("auth")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await storage.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setView(currentUser.email === "admin@chronostime.com" ? "admin" : "dashboard")
      }
      setIsLoading(false)
    }
    loadUser()
  }, [])

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser)
    setView(newUser.email === "admin@chronostime.com" ? "admin" : "dashboard")
  }

  const handleLogout = () => {
    localStorage.removeItem("chronostime_current_user")
    setUser(null)
    setView("auth")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-cyan-400 font-semibold">Loading ChronosTime...</p>
        </div>
      </div>
    )
  }

  if (view === "auth") {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  if (view === "admin" && user?.email === "admin@chronostime.com") {
    return <AdminPanel onLogout={handleLogout} onBackToDashboard={() => setView("dashboard")} />
  }

  if (view === "analytics") {
    // legacy full-page layout
    return <AnalyticsPage user={user!} onNavigate={setView} onLogout={handleLogout} />
  }

  // New shell-based layout for authenticated views
  return (
    <AppShell user={user!} currentView={view} onNavigate={setView} onLogout={handleLogout} onAdmin={() => setView("admin") }>
      {view === "dashboard" && (
        <Dashboard user={user!} onLogout={handleLogout} currentView={view} onNavigate={setView} onNavigateToAdmin={() => setView("admin")} useShell />
      )}
      {view === "analytics" && (
        <AnalyticsPage user={user!} onNavigate={setView} onLogout={handleLogout} useShell />
      )}
      {view === "marketplace" && (
        <Marketplace user={user!} onNavigate={setView} onLogout={handleLogout} useShell />
      )}
      {view === "referrals" && (
        <Referrals user={user!} onNavigate={setView} onLogout={handleLogout} useShell />
      )}
      {view === "settings" && (
        <Settings user={user!} onNavigate={setView} onLogout={handleLogout} useShell />
      )}
    </AppShell>
  )
}
