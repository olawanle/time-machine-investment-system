"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, Users, TrendingUp, Clock, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/storage"

interface ReferralSystemProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function ReferralSystem({ user, onUserUpdate }: ReferralSystemProps) {
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState("")

  const handleCopyReferralLink = () => {
    const link = `${window.location.origin}?ref=${user.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseReferralCode = async () => {
    if (!referralCode.trim()) return

    // Check if user already has a referrer
    if (user.referredBy) {
      return
    }

    // Simulate referral code validation and application
    const updatedUser = {
      ...user,
      referredBy: referralCode
    }

    // Save to storage for persistence
    const { storage } = await import('@/lib/storage')
    await storage.saveUser(updatedUser)

    onUserUpdate(updatedUser)
    setReferralCode("")
  }

  const referralBonus = (user.referrals || []).length >= 3 ? "5 min" : "10 min"
  const claimSpeedBonus = (user.referrals || []).length >= 3 ? "2x faster" : "Normal speed"

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Referral System</h1>
        <p className="text-muted-foreground">Invite friends and earn bonuses for faster time machine claims.</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">{(user.referrals || []).length}</p>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Claim Speed</p>
                <p className="text-2xl font-bold text-foreground">{claimSpeedBonus}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Next Claim</p>
                <p className="text-2xl font-bold text-foreground">{referralBonus}</p>
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
              value={`${typeof window !== 'undefined' ? window.location.origin : 'timemachine.io'}?ref=${user.referralCode}`}
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
      {!user.referredBy && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Use Referral Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-background border-border"
              />
              <Button onClick={handleUseReferralCode} disabled={!referralCode.trim()}>
                Apply Code
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
      {(user.referrals || []).length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(user.referrals || []).map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm">{referral}</span>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}