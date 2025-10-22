"use client"

import type { User } from "@/lib/storage"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info, Zap } from "lucide-react"

interface InvestorInsightsProps {
  user: User
}

export function InvestorInsights({ user }: InvestorInsightsProps) {
  const insights = []

  // Portfolio health
  if (user.machines.length === 5) {
    insights.push({
      type: "success",
      title: "Portfolio Maximized",
      description: "You have unlocked all 5 time machines. Your earning potential is at maximum.",
      icon: CheckCircle,
    })
  } else if (user.machines.length >= 3) {
    insights.push({
      type: "info",
      title: "Strong Portfolio",
      description: `You have ${5 - user.machines.length} slots remaining. Consider investing more to maximize returns.`,
      icon: Info,
    })
  }

  // ROI performance
  const roi = user.balance > 0 ? (user.claimedBalance / user.balance) * 100 : 0
  if (roi > 50) {
    insights.push({
      type: "success",
      title: "Excellent ROI",
      description: `Your return on investment is ${roi.toFixed(1)}%. You're outperforming expectations.`,
      icon: Zap,
    })
  } else if (roi > 20) {
    insights.push({
      type: "info",
      title: "Good Performance",
      description: `Your ROI is ${roi.toFixed(1)}%. Keep investing to accelerate growth.`,
      icon: Info,
    })
  }

  // Referral opportunity
  if (user.referrals.length < 5) {
    insights.push({
      type: "info",
      title: "Referral Opportunity",
      description: `Invite ${5 - user.referrals.length} more friends to unlock bonus machines and accelerate earnings.`,
      icon: AlertCircle,
    })
  }

  // Withdrawal readiness
  const daysSinceWithdrawal = (Date.now() - user.lastWithdrawalDate) / (1000 * 60 * 60 * 24)
  if (daysSinceWithdrawal >= 12 && user.claimedBalance > 100) {
    insights.push({
      type: "success",
      title: "Ready to Withdraw",
      description: `You have ${user.claimedBalance.toFixed(2)} available to withdraw. Your 12-day cycle is complete.`,
      icon: CheckCircle,
    })
  }

  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <Card className="glass glow-cyan">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No insights available yet. Keep investing!</p>
          </CardContent>
        </Card>
      ) : (
        insights.map((insight, idx) => {
          const Icon = insight.icon
          const bgColor =
            insight.type === "success"
              ? "bg-green-500/10 border-green-500/30"
              : insight.type === "warning"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-blue-500/10 border-blue-500/30"
          const textColor =
            insight.type === "success"
              ? "text-green-400"
              : insight.type === "warning"
                ? "text-yellow-400"
                : "text-blue-400"

          return (
            <Card key={idx} className={`glass ${bgColor} border`}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Icon className={`w-5 h-5 ${textColor} flex-shrink-0 mt-1`} />
                  <div>
                    <p className="font-semibold text-foreground">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
