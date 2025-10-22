"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  DollarSign, 
  Clock, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import type { User } from "@/lib/storage"

interface AdvancedDashboardProps {
  user: User
}

export function AdvancedDashboard({ user }: AdvancedDashboardProps) {
  const [timeData, setTimeData] = useState<number[]>([])
  const [performanceData, setPerformanceData] = useState<number[]>([])

  useEffect(() => {
    // Generate sample time series data
    const generateTimeData = () => {
      const data = []
      let value = user.totalEarned || 0
      for (let i = 0; i < 30; i++) {
        value += Math.random() * 50 + 10
        data.push(Math.max(0, value))
      }
      return data
    }

    setTimeData(generateTimeData())
    setPerformanceData(generateTimeData())
  }, [user])

  const userMachines = user.machines || []
  const userReferrals = user.referrals || []
  const userTotalEarned = user.totalEarned || 0
  const userTotalInvested = user.totalInvested || 0
  const userClaimedBalance = user.claimedBalance || 0

  // Calculate metrics
  const roi = userTotalInvested > 0 ? ((userTotalEarned - userTotalInvested) / userTotalInvested) * 100 : 0
  const dailyEarnings = userMachines.reduce((sum, machine) => {
    const claimsPerDay = (24 * 60) / (machine.claimIntervalMs / (1000 * 60))
    return sum + (machine.rewardAmount * claimsPerDay)
  }, 0)

  const weeklyEarnings = dailyEarnings * 7
  const monthlyEarnings = dailyEarnings * 30

  // Machine performance analysis
  const machinePerformance = userMachines.map(machine => ({
    id: machine.id,
    name: machine.name,
    level: machine.level,
    rewardAmount: machine.rewardAmount,
    claimInterval: machine.claimIntervalMs / (1000 * 60), // minutes
    dailyPotential: (24 * 60 / (machine.claimIntervalMs / (1000 * 60))) * machine.rewardAmount,
    efficiency: machine.rewardAmount / (machine.claimIntervalMs / (1000 * 60)) // $ per minute
  }))

  const totalDailyPotential = machinePerformance.reduce((sum, machine) => sum + machine.dailyPotential, 0)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your time machine investment performance.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold text-foreground">
                  {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className={`w-6 h-6 ${roi >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Daily Potential</p>
                <p className="text-2xl font-bold text-foreground">${dailyEarnings.toFixed(0)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Weekly Potential</p>
                <p className="text-2xl font-bold text-foreground">${weeklyEarnings.toFixed(0)}</p>
              </div>
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Potential</p>
                <p className="text-2xl font-bold text-foreground">${monthlyEarnings.toFixed(0)}</p>
              </div>
              <Target className="w-6 h-6 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Investment Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Invested</span>
                <span className="font-semibold">${userTotalInvested.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Earned</span>
                <span className="font-semibold text-success">${userTotalEarned.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="font-semibold text-primary">${userClaimedBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                <span className={`font-semibold ${(userTotalEarned - userTotalInvested) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${(userTotalEarned - userTotalInvested).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>ROI Progress</span>
                <span>{roi.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(Math.abs(roi), 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Machine Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {machinePerformance.map((machine, index) => (
                <div key={machine.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{machine.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ${machine.dailyPotential.toFixed(0)}/day
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Efficiency: ${machine.efficiency.toFixed(2)}/min</span>
                    <span>Interval: {machine.claimInterval}min</span>
                  </div>
                  <Progress 
                    value={(machine.dailyPotential / totalDailyPotential) * 100} 
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Machine Analysis */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Time Machine Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machinePerformance.map((machine, index) => (
              <div key={machine.id} className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{machine.name}</h4>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    Level {machine.level}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="font-medium">${machine.rewardAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interval:</span>
                    <span className="font-medium">{machine.claimInterval}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Potential:</span>
                    <span className="font-medium text-success">${machine.dailyPotential.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efficiency:</span>
                    <span className="font-medium">${machine.efficiency.toFixed(2)}/min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Impact */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Referral Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Current Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Referrals:</span>
                  <span className="font-medium">{userReferrals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Claim Speed:</span>
                  <span className="font-medium">
                    {userReferrals.length >= 3 ? '5 minutes' : '10 minutes'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Speed Bonus:</span>
                  <span className="font-medium text-success">
                    {userReferrals.length >= 3 ? '2x Faster' : 'Normal Speed'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Potential Impact</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">With 3+ Referrals:</span>
                  <span className="font-medium text-success">2x Claim Speed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Daily Earnings Boost:</span>
                  <span className="font-medium text-success">
                    +${(dailyEarnings * 0.5).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Boost:</span>
                  <span className="font-medium text-success">
                    +${(monthlyEarnings * 0.5).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userMachines.length < 5 && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <h4 className="font-semibold text-warning mb-2">Unlock More Machines</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You can unlock {5 - userMachines.length} more time machines to maximize your earning potential.
                </p>
                <Button size="sm" className="btn-primary">
                  Invest Now
                </Button>
              </div>
            )}
            
            {userReferrals.length < 3 && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Get Referral Bonuses</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Invite {3 - userReferrals.length} more friends to unlock 2x faster claim speeds.
                </p>
                <Button size="sm" variant="outline">
                  Share Referral Link
                </Button>
              </div>
            )}
            
            {userClaimedBalance > 0 && (
              <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                <h4 className="font-semibold text-success mb-2">Withdraw Available</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You have ${userClaimedBalance.toFixed(2)} available for withdrawal.
                </p>
                <Button size="sm" className="btn-primary">
                  Withdraw Funds
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}