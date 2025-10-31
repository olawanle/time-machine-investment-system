"use client"

import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "./navigation"
import { Copy, Send, Users, TrendingUp, Clock, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface ReferralData {
  referrals_made: Array<{
    id: string
    referral_code: string
    bonus_earned: number
    created_at: string
    referred_user: {
      id: string
      email: string
      username: string
      name: string
      created_at: string
    }
  }>
  bonus_transactions: Array<{
    id: string
    amount: number
    created_at: string
  }>
  statistics: {
    total_referrals: number
    active_referrals: number
    total_bonus_earned: number
    pending_referrals: number
  }
  user_info: {
    referral_code: string
    referred_by: string | null
  }
}

interface ReferralsProps {
  user: User
  onNavigate: (view: string) => void
  onLogout: () => void
}

export function Referrals({ user, onNavigate, onLogout }: ReferralsProps) {
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchReferralData()
  }, [user.id])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/referrals?user_id=${user.id}`)
      const result = await response.json()
      
      if (result.success) {
        setReferralData(result.data)
      } else {
        setError(result.error || 'Failed to fetch referral data')
      }
    } catch (err) {
      console.error('Error fetching referral data:', err)
      setError('Failed to load referral data')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    const referralCode = referralData?.user_info.referral_code || user.referralCode
    const referralLink = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} currentView="referrals" onNavigate={onNavigate} onLogout={onLogout} onAdmin={() => {}} />
        <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading referral data...</p>
          </div>
        </main>
      </div>
    )
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-3">Invite Friends, Earn Faster!</h1>
          <p className="text-muted-foreground text-lg">
            Share your unique link with friends to earn bonuses and unlock time machines quicker.
          </p>
        </div>

        <Card className="glass glow-cyan mb-12 border border-cyan-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Your Unique Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={`${typeof window !== 'undefined' ? window.location.origin : 'timemachine.io'}?ref=${referralData?.user_info.referral_code || user.referralCode}`}
                readOnly
                className="glass-sm font-mono text-sm"
              />
              <Button onClick={handleCopy} className="btn-secondary gap-2 whitespace-nowrap">
                <Copy size={18} />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-bold gradient-text mb-6">Share on:</h2>
          <div className="flex gap-4 flex-wrap">
            <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 gap-2">
              <Send size={18} />
              Telegram
            </Button>
            <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 gap-2">
              <Users size={18} />
              Facebook
            </Button>
            <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 gap-2">
              <Copy size={18} />
              Copy Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="glass glow-cyan group hover:border-cyan-400/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Friends Invited</CardTitle>
                <Users className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text-cyan">
                {referralData?.statistics.total_referrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total referrals</p>
            </CardContent>
          </Card>

          <Card className="glass glow-green group hover:border-green-400/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Active Referrals</CardTitle>
                <TrendingUp className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {referralData?.statistics.active_referrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Successfully joined</p>
            </CardContent>
          </Card>

          <Card className="glass glow-blue group hover:border-blue-400/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Bonuses Earned</CardTitle>
                <DollarSign className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                ${referralData?.statistics.total_bonus_earned || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total earned</p>
            </CardContent>
          </Card>

          <Card className="glass glow-yellow group hover:border-yellow-400/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Pending Invites</CardTitle>
                <Clock className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {referralData?.statistics.pending_referrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Awaiting activation</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold gradient-text mb-6">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Share", desc: "Share your unique link with friends.", icon: "📤" },
              { num: "2", title: "Invest", desc: "Your friend invests in their first Time Machine.", icon: "💰" },
              { num: "3", title: "Earn", desc: "You both receive a bonus machine with faster claims.", icon: "🎁" },
            ].map((step) => (
              <Card
                key={step.num}
                className="glass glow-cyan text-center group hover:border-cyan-400/50 transition-all"
              >
                <CardContent className="pt-8">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{step.icon}</div>
                  <div className="text-3xl font-bold gradient-text-cyan mb-2">{step.num}</div>
                  <h3 className="font-semibold mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="glass glow-cyan border border-cyan-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Friend</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Bonus Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData?.referrals_made.length ? (
                    referralData.referrals_made.map((ref, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-cyan-500/5 transition-colors">
                        <td className="py-4 px-4 font-mono text-cyan-400">
                          {ref.referred_user?.username || ref.referred_user?.name || ref.referred_user?.email?.split('@')[0] || 'Anonymous'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={
                              ref.referred_user?.created_at
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                            }
                          >
                            {ref.referred_user?.created_at ? "Active" : "Pending"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-cyan-400 font-semibold">
                          ${ref.bonus_earned || 5}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 px-4 text-center text-muted-foreground">
                        No referrals yet. Share your link to start earning!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
