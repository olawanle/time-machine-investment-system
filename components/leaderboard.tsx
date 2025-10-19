"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Users, Crown, Medal, Award } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  username: string
  value: number
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  currentUserId: string
  currentUsername: string
}

export function Leaderboard({ currentUserId, currentUsername }: LeaderboardProps) {
  const [category, setCategory] = useState<"investors" | "earners" | "referrers">("investors")

  // Mock data - will be replaced with real data from Supabase
  const mockInvestors: LeaderboardEntry[] = [
    { rank: 1, username: "CryptoKing", value: 5000 },
    { rank: 2, username: "TimeLord", value: 3500 },
    { rank: 3, username: "InvestPro", value: 2800 },
    { rank: 4, username: "WealthBuilder", value: 2100 },
    { rank: 5, username: currentUsername, value: 1500, isCurrentUser: true },
  ]

  const mockEarners: LeaderboardEntry[] = [
    { rank: 1, username: "ProfitMaster", value: 850 },
    { rank: 2, username: "MoneyMaker", value: 720 },
    { rank: 3, username: "EarnKing", value: 650 },
    { rank: 4, username: "WealthFlow", value: 580 },
    { rank: 5, username: currentUsername, value: 420, isCurrentUser: true },
  ]

  const mockReferrers: LeaderboardEntry[] = [
    { rank: 1, username: "NetworkGuru", value: 25 },
    { rank: 2, username: "InfluencerPro", value: 18 },
    { rank: 3, username: "SocialKing", value: 15 },
    { rank: 4, username: "TeamBuilder", value: 12 },
    { rank: 5, username: currentUsername, value: 8, isCurrentUser: true },
  ]

  const getCurrentData = () => {
    switch (category) {
      case "investors":
        return mockInvestors
      case "earners":
        return mockEarners
      case "referrers":
        return mockReferrers
    }
  }

  const getIcon = () => {
    switch (category) {
      case "investors":
        return TrendingUp
      case "earners":
        return Trophy
      case "referrers":
        return Users
    }
  }

  const getLabel = () => {
    switch (category) {
      case "investors":
        return "Total Invested"
      case "earners":
        return "Total Earned"
      case "referrers":
        return "Referrals"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const data = getCurrentData()
  const Icon = getIcon()

  return (
    <Card className="glass glow-cyan">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => setCategory("investors")}
            variant={category === "investors" ? "default" : "outline"}
            size="sm"
            className={category === "investors" ? "btn-primary" : "glass-sm"}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Investors
          </Button>
          <Button
            onClick={() => setCategory("earners")}
            variant={category === "earners" ? "default" : "outline"}
            size="sm"
            className={category === "earners" ? "btn-primary" : "glass-sm"}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Earners
          </Button>
          <Button
            onClick={() => setCategory("referrers")}
            variant={category === "referrers" ? "default" : "outline"}
            size="sm"
            className={category === "referrers" ? "btn-primary" : "glass-sm"}
          >
            <Users className="w-4 h-4 mr-1" />
            Referrers
          </Button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {data.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                entry.isCurrentUser
                  ? "bg-cyan-500/20 border-2 border-cyan-400/50 shadow-lg"
                  : "glass-sm hover:bg-card/80"
              }`}
            >
              {/* Rank */}
              <div className="w-10 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Username */}
              <div className="flex-1">
                <p className={`font-semibold ${
                  entry.isCurrentUser ? "text-cyan-400" : ""
                }`}>
                  {entry.username}
                  {entry.isCurrentUser && (
                    <Badge variant="outline" className="ml-2 bg-cyan-500/20 border-cyan-400/50 text-xs">
                      You
                    </Badge>
                  )}
                </p>
              </div>

              {/* Value */}
              <div className="flex items-center gap-1">
                <Icon className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-cyan-400">
                  {category === "referrers" ? entry.value : formatCurrency(entry.value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="glass-sm p-3 rounded-lg text-xs text-muted-foreground text-center">
          <p>Rankings update every hour • {getLabel()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

