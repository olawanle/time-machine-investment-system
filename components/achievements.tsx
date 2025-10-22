"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, Target, Users, TrendingUp, Award, 
  Star, Zap, Gift, Crown, Shield 
} from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  progress: number
  target: number
  reward: number
  unlocked: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface AchievementsProps {
  userStats: {
    totalInvested: number
    totalEarned: number
    machinesOwned: number
    referralsCount: number
    daysActive: number
  }
}

export function Achievements({ userStats }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: "first-investment",
      name: "First Step",
      description: "Make your first investment",
      icon: Target,
      progress: userStats.totalInvested > 0 ? 1 : 0,
      target: 1,
      reward: 10,
      unlocked: userStats.totalInvested > 0,
      rarity: "common"
    },
    {
      id: "investor-100",
      name: "Rising Investor",
      description: "Invest a total of $100",
      icon: TrendingUp,
      progress: Math.min(userStats.totalInvested, 100),
      target: 100,
      reward: 25,
      unlocked: userStats.totalInvested >= 100,
      rarity: "common"
    },
    {
      id: "investor-500",
      name: "Serious Investor",
      description: "Invest a total of $500",
      icon: Trophy,
      progress: Math.min(userStats.totalInvested, 500),
      target: 500,
      reward: 50,
      unlocked: userStats.totalInvested >= 500,
      rarity: "rare"
    },
    {
      id: "investor-1000",
      name: "High Roller",
      description: "Invest a total of $1,000",
      icon: Crown,
      progress: Math.min(userStats.totalInvested, 1000),
      target: 1000,
      reward: 100,
      unlocked: userStats.totalInvested >= 1000,
      rarity: "epic"
    },
    {
      id: "machine-collector-3",
      name: "Machine Collector",
      description: "Own 3 time machines",
      icon: Zap,
      progress: userStats.machinesOwned,
      target: 3,
      reward: 30,
      unlocked: userStats.machinesOwned >= 3,
      rarity: "rare"
    },
    {
      id: "machine-master-5",
      name: "Machine Master",
      description: "Own all 5 time machines",
      icon: Shield,
      progress: userStats.machinesOwned,
      target: 5,
      reward: 75,
      unlocked: userStats.machinesOwned >= 5,
      rarity: "epic"
    },
    {
      id: "referrer-5",
      name: "Network Builder",
      description: "Refer 5 friends",
      icon: Users,
      progress: userStats.referralsCount,
      target: 5,
      reward: 50,
      unlocked: userStats.referralsCount >= 5,
      rarity: "rare"
    },
    {
      id: "referrer-10",
      name: "Influencer",
      description: "Refer 10 friends",
      icon: Star,
      progress: userStats.referralsCount,
      target: 10,
      reward: 100,
      unlocked: userStats.referralsCount >= 10,
      rarity: "epic"
    },
    {
      id: "earner-100",
      name: "Profit Maker",
      description: "Earn a total of $100",
      icon: Gift,
      progress: Math.min(userStats.totalEarned, 100),
      target: 100,
      reward: 20,
      unlocked: userStats.totalEarned >= 100,
      rarity: "common"
    },
    {
      id: "earner-500",
      name: "Wealth Builder",
      description: "Earn a total of $500",
      icon: Award,
      progress: Math.min(userStats.totalEarned, 500),
      target: 500,
      reward: 75,
      unlocked: userStats.totalEarned >= 500,
      rarity: "legendary"
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500/20 border-gray-500/50 text-gray-300"
      case "rare":
        return "bg-blue-500/20 border-blue-500/50 text-blue-300"
      case "epic":
        return "bg-purple-500/20 border-purple-500/50 text-purple-300"
      case "legendary":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-300"
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <Card className="glass glow-cyan">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Achievements
          </span>
          <Badge variant="outline" className="bg-cyan-500/20 border-cyan-400/50">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const progressPercent = (achievement.progress / achievement.target) * 100

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? getRarityColor(achievement.rarity) + " shadow-lg"
                    : "bg-card/30 border-border opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                      : "bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      achievement.unlocked ? "text-white" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress}/{achievement.target}
                        </p>
                      </div>
                    )}

                    {/* Reward */}
                    <div className="flex items-center gap-1">
                      <Gift className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs font-semibold text-cyan-400">
                        +${achievement.reward} reward
                      </span>
                    </div>

                    {/* Unlocked Badge */}
                    {achievement.unlocked && (
                      <Badge className="text-xs bg-green-500/20 border-green-500/50 text-green-300">
                        ✓ Unlocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

