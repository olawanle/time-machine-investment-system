"use client"

import { useState } from "react"
import { type User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { ChronosTimeLogo } from "./logo"
import { RealAdminDashboard } from "@/components/real-admin-dashboard"
import {
  LogOut,
  ArrowLeft,
} from "lucide-react"

interface AdminPanelProps {
  onLogout: () => void
  onBackToDashboard: () => void
}

export function AdminPanel({ onLogout, onBackToDashboard }: AdminPanelProps) {
  const [adminUser] = useState<User>({
    id: "admin-001",
    email: "admin@chronostime.com",
    username: "Administrator",
    balance: 0,
    claimedBalance: 0,
    machines: [],
    referralCode: "ADMIN",
    referrals: [],
    lastWithdrawalDate: 0,
    createdAt: Date.now(),
    tier: "platinum",
    totalInvested: 0,
    totalEarned: 0,
    roi: 0,
  })



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <ChronosTimeLogo />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
            <div className="h-6 w-px bg-border" />
            <Button onClick={onBackToDashboard} variant="ghost" className="btn-ghost gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <Button onClick={onLogout} variant="ghost" className="btn-ghost gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - Use the real admin dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <RealAdminDashboard 
          user={adminUser}
          onUserUpdate={() => {}}
          onLogout={onLogout}
        />
      </main>
    </div>
  )
}
