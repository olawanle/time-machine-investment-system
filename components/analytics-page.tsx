"use client"

import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { InvestorInsights } from "./investor-insights"
import { Navigation } from "./navigation"
import { ArrowLeft } from "lucide-react"

interface AnalyticsPageProps {
  user: User
  onNavigate: (view: string) => void
  onLogout: () => void
}

export function AnalyticsPage({ user, onNavigate, onLogout }: AnalyticsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navigation user={user} currentView="analytics" onNavigate={onNavigate} onLogout={onLogout} onAdmin={() => {}} />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => onNavigate("dashboard")} variant="ghost" className="btn-ghost gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Analytics & Insights</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnalyticsDashboard user={user} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Investor Insights</h2>
            <InvestorInsights user={user} />
          </div>
        </div>
      </main>
    </div>
  )
}
