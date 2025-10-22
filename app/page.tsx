"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { AnalyticsPage } from "@/components/analytics-page"
import { AdminPanel } from "@/components/admin-panel"
import { LandingPage } from "@/components/landing-page"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { type User, storage } from "@/lib/storage"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<
    "landing" | "auth" | "dashboard" | "analytics" | "marketplace" | "referrals" | "settings" | "admin"
  >("landing")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setError(null)
        const currentUser = await storage.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setView(currentUser.email === "admin@chronostime.com" ? "admin" : "dashboard")
        }
      } catch (error) {
        console.error("Error loading user:", error)
        setError("Failed to load user data. Please try again.")
      } finally {
        setIsLoading(false)
      }
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
    setView("landing")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="text-center space-y-6 relative z-10">
          <LoadingSpinner size="lg" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">ChronosTime</h2>
            <p className="text-cyan-400 font-medium animate-pulse">Initializing secure connection...</p>
          </div>
          
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-400 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-white">Connection Error</h2>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {view === "landing" && (
        <LandingPage onGetStarted={() => setView("auth")} />
      )}

      {view === "auth" && (
        <AuthForm onAuthSuccess={handleAuthSuccess} onBackToLanding={() => setView("landing")} />
      )}

      {view === "admin" && user?.email === "admin@chronostime.com" && (
        <AdminPanel onLogout={handleLogout} onBackToDashboard={() => setView("dashboard")} />
      )}

      {view === "analytics" && user && (
        <AnalyticsPage 
          user={user} 
          onNavigate={(newView: string) => setView(newView as typeof view)} 
          onLogout={handleLogout} 
        />
      )}

      {(view === "dashboard" || view === "marketplace" || view === "referrals" || view === "settings") && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          currentView={view}
          onNavigate={(newView: string) => setView(newView as typeof view)}
          onNavigateToAdmin={() => setView("admin")}
        />
      )}
    </ErrorBoundary>
  )
}