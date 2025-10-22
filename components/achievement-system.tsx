"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Star, 
  Zap, 
  Users, 
  DollarSign, 
  Target,
  Award,
  Crown,
  Medal,
  Gem
} from "lucide-react"
import type { User } from "@/lib/storage"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'investment' | 'referral' | 'machine' | 'milestone'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress: number
  maxProgress: number
  reward?: string
  unlockedAt?: number
}

interface AchievementSystemProps {
  user: User
}

export function AchievementSystem({ user }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const generateAchievements = (): Achievement[] => {
      const userAchievements = user.achievements || []
      const totalInvestment = user.balance || 0
      const totalEarned = user.totalEarned || 0
      const machineCount = (user.machines || []).length
      const referralCount = (user.referrals || []).length

      return [
        {
          id: 'first_investment',
          title: 'First Steps',
          description: 'Make your first investment',
          icon: <DollarSign className="w-5 h-5" />,
          category: 'investment',
          rarity: 'common',
          unlocked: totalInvestment > 0,
          progress: totalInvestment > 0 ? 1 : 0,
          maxProgress: 1,
          reward: '+$10 bonus',
          unlockedAt: totalInvestment > 0 ? user.createdAt : undefined
        },
        {
          id: 'big_investor',
          title: 'Big Investor',
          description: 'Invest over $1,000',
          icon: <Target className="w-5 h-5" />,
          category: 'investment',
          rarity: 'rare',
          unlocked: totalInvestment >= 1000,
          progress: Math.min(totalInvestment, 1000),
          maxProgress: 1000,
          reward: '+5% bonus rewards',
          unlockedAt: totalInvestment >= 1000 ? Date.now() : undefined
        },
        {
          id: 'whale_investor',
          title: 'Whale Investor',
          description: 'Invest over $10,000',
          icon: <Crown className="w-5 h-5" />,
          category: 'investment',
          rarity: 'legendary',
          unlocked: totalInvestment >= 10000,
          progress: Math.min(totalInvestment, 10000),
          maxProgress: 10000,
          reward: '+10% bonus rewards',
          unlockedAt: totalInvestment >= 10000 ? Date.now() : undefined
        },
        {
          id: 'first_machine',
          title: 'Time Traveler',
          description: 'Unlock your first time machine',
          icon: <Zap className="w-5 h-5" />,
          category: 'machine',
          rarity: 'common',
          unlocked: machineCount > 0,
          progress: Math.min(machineCount, 1),
          maxProgress: 1,
          reward: 'Faster claim times',
          unlockedAt: machineCount > 0 ? Date.now() : undefined
        },
        {
          id: 'machine_master',
          title: 'Machine Master',
          description: 'Unlock all 5 time machines',
          icon: <Trophy className="w-5 h-5" />,
          category: 'machine',
          rarity: 'epic',
          unlocked: machineCount >= 5,
          progress: Math.min(machineCount, 5),
          maxProgress: 5,
          reward: '+$5 per claim',
          unlockedAt: machineCount >= 5 ? Date.now() : undefined
        },
        {
          id: 'first_referral',
          title: 'Networker',
          description: 'Get your first referral',
          icon: <Users className="w-5 h-5" />,
          category: 'referral',
          rarity: 'common',
          unlocked: referralCount > 0,
          progress: Math.min(referralCount, 1),
          maxProgress: 1,
          reward: '8-minute claims',
          unlockedAt: referralCount > 0 ? Date.now() : undefined
        },
        {
          id: 'referral_master',
          title: 'Referral Master',
          description: 'Get 3+ referrals',
          icon: <Medal className="w-5 h-5" />,
          category: 'referral',
          rarity: 'rare',
          unlocked: referralCount >= 3,
          progress: Math.min(referralCount, 3),
          maxProgress: 3,
          reward: '5-minute claims',
          unlockedAt: referralCount >= 3 ? Date.now() : undefined
        },
        {
          id: 'earnings_milestone',
          title: 'Earnings Champion',
          description: 'Earn over $1,000 from machines',
          icon: <Gem className="w-5 h-5" />,
          category: 'milestone',
          rarity: 'epic',
          unlocked: totalEarned >= 1000,
          progress: Math.min(totalEarned, 1000),
          maxProgress: 1000,
          reward: '+$2 per claim',
          unlockedAt: totalEarned >= 1000 ? Date.now() : undefined
        },
        {
          id: 'daily_claimer',
          title: 'Daily Claimer',
          description: 'Claim rewards for 7 consecutive days',
          icon: <Star className="w-5 h-5" />,
          category: 'milestone',
          rarity: 'rare',
          unlocked: false, // This would need daily tracking
          progress: 0,
          maxProgress: 7,
          reward: '+$1 per claim'
        }
      ]
    }

    setAchievements(generateAchievements())
  }, [user])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-muted-foreground'
      case 'rare':
        return 'text-blue-500'
      case 'epic':
        return 'text-purple-500'
      case 'legendary':
        return 'text-yellow-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-muted/50'
      case 'rare':
        return 'bg-blue-500/10'
      case 'epic':
        return 'bg-purple-500/10'
      case 'legendary':
        return 'bg-yellow-500/10'
      default:
        return 'bg-muted/50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'investment':
        return <DollarSign className="w-4 h-4" />
      case 'referral':
        return <Users className="w-4 h-4" />
      case 'machine':
        return <Zap className="w-4 h-4" />
      case 'milestone':
        return <Trophy className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold text-foreground">{unlockedCount}/{totalCount}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((unlockedCount / totalCount) * 100)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rarity</p>
                <p className="text-2xl font-bold text-foreground">
                  {achievements.filter(a => a.unlocked && a.rarity === 'legendary').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['investment', 'referral', 'machine', 'milestone'].map((category) => {
          const categoryAchievements = achievements.filter(a => a.category === category)
          const categoryUnlocked = categoryAchievements.filter(a => a.unlocked).length
          const categoryTotal = categoryAchievements.length

          return (
            <Card key={category} className="bg-card border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getCategoryIcon(category)}
                  <div>
                    <p className="font-medium text-foreground capitalize">{category}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryUnlocked}/{categoryTotal} unlocked
                    </p>
                  </div>
                </div>
                <Progress 
                  value={(categoryUnlocked / categoryTotal) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Achievement List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">All Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`${getRarityBg(achievement.rarity)} ${
                achievement.unlocked ? 'ring-2 ring-primary/20' : ''
              } transition-all duration-200`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    achievement.unlocked ? 'bg-primary/20' : 'bg-muted/50'
                  }`}>
                    <div className={getRarityColor(achievement.rarity)}>
                      {achievement.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {achievement.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-600' :
                            achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-600' :
                            achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-600' :
                            'bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          {achievement.rarity}
                        </Badge>
                        
                        {achievement.unlocked && (
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {achievement.reward && (
                      <p className="text-xs text-success font-medium mb-2">
                        Reward: {achievement.reward}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1"
                      />
                    </div>
                    
                    {achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


