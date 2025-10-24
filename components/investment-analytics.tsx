"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface InvestmentAnalyticsProps {
  user: any
}

export function InvestmentAnalytics({ user }: InvestmentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [analytics, setAnalytics] = useState({
    totalInvested: 0,
    totalEarned: 0,
    activeMachines: 0,
    weeklyReturns: 0,
    roi: 0,
    bestPerformingMachine: null,
    recentActivity: []
  })

  useEffect(() => {
    // Calculate analytics based on user data
    const userMachines = user.machines || []
    const totalInvested = user.totalInvested || 0
    const totalEarned = user.claimedBalance || 0
    const activeMachines = userMachines.length
    const weeklyReturns = userMachines.reduce((sum: number, machine: any) => sum + (machine.weeklyReturn || 0), 0)
    const roi = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0

    setAnalytics({
      totalInvested,
      totalEarned,
      activeMachines,
      weeklyReturns,
      roi,
      bestPerformingMachine: userMachines.length > 0 ? userMachines[0] : null,
      recentActivity: []
    })
  }, [user])

  const getROIColor = (roi: number) => {
    if (roi > 20) return "text-success"
    if (roi > 10) return "text-warning"
    return "text-destructive"
  }

  const getROIIcon = (roi: number) => {
    if (roi > 0) return <ArrowUpRight className="w-4 h-4" />
    return <ArrowDownRight className="w-4 h-4" />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Investment Analytics</h1>
          <p className="text-muted-foreground">Track your investment performance and returns</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.totalInvested.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-success">
                  ${analytics.totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Machines</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.activeMachines}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Returns</p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.weeklyReturns.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Return on Investment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getROIColor(analytics.roi)} flex items-center justify-center gap-2`}>
                {getROIIcon(analytics.roi)}
                {analytics.roi.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Overall ROI Performance
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Investment</span>
                <span>${analytics.totalInvested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Returns</span>
                <span className="text-success">${analytics.totalEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Net Profit</span>
                <span className={analytics.totalEarned > analytics.totalInvested ? "text-success" : "text-destructive"}>
                  ${(analytics.totalEarned - analytics.totalInvested).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Income</span>
                <span className="font-semibold">${analytics.weeklyReturns.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Projection</span>
                <span className="font-semibold">${(analytics.weeklyReturns * 4).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annual Projection</span>
                <span className="font-semibold">${(analytics.weeklyReturns * 52).toLocaleString()}</span>
              </div>
            </div>

            {analytics.bestPerformingMachine && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm text-foreground mb-2">Best Performer</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {analytics.bestPerformingMachine.name}
                  </span>
                  <span className="text-sm font-semibold text-success">
                    ${analytics.bestPerformingMachine.weeklyReturn}/week
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Machine Performance Chart */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Machine Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(user.machines || []).map((machine: any, index: number) => {
              const percentage = analytics.weeklyReturns > 0 
                ? (machine.weeklyReturn / analytics.weeklyReturns) * 100 
                : 0
              
              return (
                <div key={machine.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {machine.name || `Machine ${index + 1}`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ${machine.weeklyReturn || 0}/week
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Investment Tips */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Investment Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Optimization Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Upgrade lower-tier machines for better ROI</li>
                <li>• Diversify across different machine types</li>
                <li>• Reinvest returns to compound growth</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Growth Strategy</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Focus on higher-tier machines for better returns</li>
                <li>• Use referral bonuses to accelerate growth</li>
                <li>• Monitor performance and adjust strategy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
