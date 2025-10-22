"use client"

import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "./navigation"
import { Copy, Send, Users, TrendingUp, Clock } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface ReferralsProps {
  user: User
  onNavigate: (view: string) => void
  onLogout: () => void
  useShell?: boolean
}

export function Referrals({ user, onNavigate, onLogout, useShell }: ReferralsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Content = (
    <>
      <div className="mb-12">
        <h1 className={useShell ? "text-3xl font-bold" : "text-4xl font-bold gradient-text mb-3"}>Invite Friends, Earn Faster!</h1>
        <p className="text-muted-foreground text-lg">Share your unique link with friends to earn bonuses and unlock time machines quicker.</p>
      </div>

      <Card className={useShell ? "border mb-12" : "glass glow-cyan mb-12 border border-cyan-400/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            Your Unique Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input value={`timemachine.io/ref/${user.referralCode}`} readOnly className={useShell ? "font-mono text-sm" : "glass-sm font-mono text-sm"} />
            <Button onClick={handleCopy} className="btn-secondary gap-2 whitespace-nowrap">
              <Copy size={18} />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-12">
        <h2 className={useShell ? "text-2xl font-bold mb-6" : "text-2xl font-bold gradient-text mb-6"}>Share on:</h2>
        <div className="flex gap-4 flex-wrap">
          <Button className={useShell ? "border text-cyan-600 hover:bg-muted gap-2" : "glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 gap-2"}>
            <Send size={18} /> Telegram
          </Button>
          <Button className={useShell ? "border text-cyan-600 hover:bg-muted gap-2" : "glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 gap-2"}>
            <Users size={18} /> Facebook
          </Button>
          <Button className={useShell ? "border text-cyan-600 hover:bg-muted gap-2" : "glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 gap-2"}>
            <Copy size={18} /> Copy Link
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className={useShell ? "border group" : "glass glow-cyan group hover:border-cyan-400/50 transition-all"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Friends Invited</CardTitle>
              <Users className={useShell ? "w-5 h-5 text-cyan-500" : "w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{user.referrals.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Active referrals</p>
          </CardContent>
        </Card>

        <Card className={useShell ? "border group" : "glass glow-blue group hover:border-blue-400/50 transition-all"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Bonuses Earned</CardTitle>
              <TrendingUp className={useShell ? "w-5 h-5 text-blue-500" : "w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform"} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">+5%</div>
            <p className="text-xs text-muted-foreground mt-2">Claim speed boost</p>
          </CardContent>
        </Card>

        <Card className={useShell ? "border group" : "glass glow-cyan group hover:border-cyan-400/50 transition-all"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pending Invites</CardTitle>
              <Clock className={useShell ? "w-5 h-5 text-cyan-500" : "w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">3</div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting activation</p>
          </CardContent>
        </Card>
      </div>
    </>
  )

  if (useShell) {
    return <div className="space-y-6">{Content}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navigation user={user} currentView="referrals" onNavigate={onNavigate} onLogout={onLogout} onAdmin={() => {}} />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {Content}
      </main>
    </div>
  )
}
