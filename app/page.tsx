"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { AnalyticsPage } from "@/components/analytics-page"
import { AdminPanelV2 } from "@/components/admin-panel-v2"
import { LandingPage } from "@/components/landing-page"
import { ThemeProvider } from "@/components/theme-provider"
import { APIDashboard } from "@/components/api-dashboard"
import { SupremeAdminDashboard } from "@/components/supreme-admin-dashboard"
import { RealUserDashboard } from "@/components/real-user-dashboard"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ToastProvider } from "@/components/ui/toast-system"
import { DatabaseInitializer } from "@/components/database-initializer"
import { type User } from "@/lib/storage"
import { authService } from "@/lib/auth-service"
import { enhancedStorage } from "@/lib/enhanced-storage"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<
    "landing" | "auth" | "dashboard" | "analytics" | "marketplace" | "referrals" | "settings" | "admin" | "api"
  >("landing")
  const [currentSection, setCurrentSection] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadUser = async () => {
      try {
        setError(null)
        // Use enhanced storage service which handles syncing between database and localStorage
        const result = await enhancedStorage.getCurrentUser()
        let currentUser = result.success ? result.data : null
        
        // If we have a user, ensure data is synced across storage systems
        if (currentUser) {
          console.log(`📱 Loaded user with ${currentUser.machines.length} machines`)
          // Trigger sync to ensure consistency
          const syncResult = await enhancedStorage.syncUserData(currentUser.id)
          if (syncResult.success && syncResult.data) {
            currentUser = syncResult.data
          }
        }
        if (currentUser) {
          setUser(currentUser)
          // Check if user is admin and redirect accordingly
          if (currentUser.email === "admin@chronostime.com") {
            setView("admin")
          } else {
            setView("api") // Switch to API view after login
          }
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
    // Check if user is admin and redirect accordingly
    if (newUser.email === "admin@chronostime.com") {
      setView("admin")
    } else {
      setView("api") // Switch to API view after login
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
    setView("landing")
  }

  // Prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">ChronosTime</h2>
            <p className="text-muted-foreground">Loading...</p>
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

  // API endpoint data
  const getEndpointData = (section: string) => {
    const endpoints = {
      login: {
        method: "POST",
        path: "/auth/login",
        title: "Login User",
        description: "Authenticate a user with email and password credentials",
        parameters: [
          { name: "email", type: "string", required: true, description: "User's email address", example: "user@example.com" },
          { name: "password", type: "string", required: true, description: "User's password", example: "password123" }
        ],
        responses: [
          { code: 200, name: "OK", description: "Login successful" },
          { code: 401, name: "Unauthorized", description: "Invalid credentials" },
          { code: 400, name: "Bad Request", description: "Invalid request data" }
        ]
      },
      portfolio: {
        method: "GET",
        path: "/investment/portfolio",
        title: "Get Portfolio",
        description: "Retrieve user's investment portfolio and current holdings",
        responses: [
          { code: 200, name: "OK", description: "Portfolio data retrieved successfully" },
          { code: 401, name: "Unauthorized", description: "User not authenticated" },
          { code: 404, name: "Not Found", description: "Portfolio not found" }
        ]
      },
      invest: {
        method: "POST",
        path: "/investment/create",
        title: "Create Investment",
        description: "Create a new investment portfolio with specified amount",
        parameters: [
          { name: "amount", type: "number", required: true, description: "Investment amount in USD", example: "1000" },
          { name: "strategy", type: "string", required: false, description: "Investment strategy", example: "conservative" }
        ],
        responses: [
          { code: 201, name: "Created", description: "Investment created successfully" },
          { code: 400, name: "Bad Request", description: "Invalid investment amount" },
          { code: 401, name: "Unauthorized", description: "User not authenticated" }
        ]
      }
    }
    return endpoints[section as keyof typeof endpoints] || endpoints.login
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <DatabaseInitializer>
          <ErrorBoundary>
        {view === "landing" && (
          <LandingPage onGetStarted={() => setView("auth")} />
        )}

        {view === "auth" && (
          <AuthForm onAuthSuccess={handleAuthSuccess} onBackToLanding={() => setView("landing")} />
        )}

        {view === "api" && user && (
          <APIDashboard 
            user={user}
            onLogout={handleLogout}
          />
        )}

      {view === "admin" && user?.email === "admin@chronostime.com" && (
        <AdminPanelV2 onLogout={handleLogout} onBackToDashboard={() => setView("dashboard")} />
      )}

      {view === "analytics" && user && (
        <AnalyticsPage 
          user={user} 
          onNavigate={(newView: string) => setView(newView as typeof view)} 
          onLogout={handleLogout} 
        />
      )}

      {(view === "dashboard" || view === "marketplace" || view === "referrals" || view === "settings") && user && (
        <APIDashboard
          user={user}
          onLogout={handleLogout}
        />
        )}
          </ErrorBoundary>
        </DatabaseInitializer>
      </ToastProvider>
    </ThemeProvider>
  )
}