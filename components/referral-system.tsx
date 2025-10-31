"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, Users, TrendingUp, Clock, Share2, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/storage"
import { storage } from "@/lib/storage"

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

interface ReferralSystemProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function ReferralSystem({ user, onUserUpdate }: ReferralSystemProps) {
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applying, setApplying] = useState(false)

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

  const handleCopyReferralLink = () => {
    const referralCodeToUse = referralData?.user_info.referral_code || user.referralCode
    const link = `${window.location.origin}?ref=${referralCodeToUse}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseReferralCode = async () => {
    if (!referralCode.trim()) return

    // Check if user already has a referrer
    if (referralData?.user_info.referred_by) {
      setError("You already have a referrer")
      return
    }

    try {
      setApplying(true)
      setError("")

      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          referral_code: referralCode.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh referral data
        await fetchReferralData()
        setReferralCode("")
        
        // Update user data
        const updatedUser = { ...user, referredBy: referralCode.trim() }
        onUserUpdate(updatedUser)
      } else {
        setError(result.error || 'Failed to apply referral code')
      }
    } catch (err) {
      console.error('Error applying referral code:', err)
      setError('Failed to apply referral code')
    } finally {
      setApplying(false)
    }
  }

  const totalReferrals = referralData?.statistics.total_referrals || 0
  const referralBonus = totalReferrals >= 3 ? "5 min" : "10 min"
  const claimSpeedBonus = totalReferrals >= 3 ? "2x faster" : "Normal speed"

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Referral System</h1>
        <p className="text-muted-foreground">Invite friends and earn bonuses for faster time machine claims.</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">{referralData?.statistics.total_referrals || 0}</p>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Referrals</p>
                <p className="text-2xl font-bold text-foreground">{referralData?.statistics.active_referrals || 0}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bonuses Earned</p>
                <p className="text-2xl font-bold text-foreground">${referralData?.statistics.total_bonus_earned || 0}</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{referralData?.statistics.pending_referrals || 0}</p>
              </div>
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Referral Link */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={`${typeof window !== 'undefined' ? window.location.origin : 'timemachine.io'}?ref=${referralData?.user_info.referral_code || user.referralCode}`}
              readOnly
              className="bg-background border-border font-mono text-sm"
            />
            <Button onClick={handleCopyReferralLink} variant="outline" className="whitespace-nowrap">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link with friends to earn referral bonuses
          </p>
        </CardContent>
      </Card>

      {/* Use Referral Code */}
      {!referralData?.user_info.referred_by && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Use Referral Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-background border-border"
                disabled={applying}
              />
              <Button 
                onClick={handleUseReferralCode} 
                disabled={!referralCode.trim() || applying}
              >
                {applying ? 'Applying...' : 'Apply Code'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a friend's referral code to get bonus benefits
            </p>
          </CardContent>
        </Card>
      )}

      {/* Referral Benefits */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Referral Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">For You:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Faster claim intervals with 3+ referrals</li>
                <li>• Bonus time machines for successful referrals</li>
                <li>• Increased earning potential</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">For Your Friends:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Welcome bonus on first investment</li>
                <li>• Faster claim intervals from day one</li>
                <li>• Access to premium features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral List */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referralData?.referrals_made.length ? (
            <div className="space-y-2">
              {referralData.referrals_made.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-mono text-sm">
                        {referral.referred_user?.username || referral.referred_user?.name || referral.referred_user?.email?.split('@')[0] || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(referral.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">
                      +${referral.bonus_earned || 5}
                    </span>
                    <Badge 
                      variant={referral.referred_user?.created_at ? "default" : "secondary"}
                      className={referral.referred_user?.created_at ? "bg-green-100 text-green-800" : ""}
                    >
                      {referral.referred_user?.created_at ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground">Share your referral link to start earning bonuses!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}