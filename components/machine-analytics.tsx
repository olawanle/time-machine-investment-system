"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Zap, 
  Star, 
  BarChart3, 
  Calendar,
  Target,
  Award
} from "lucide-react"
import type { User } from "@/lib/storage"

interface MachineAnalyticsProps {
  user: User
}

interface AnalyticsData {
  totalInvested: number
  totalEarned: number
  weeklyEarnings: number
  roi: number
  machinesOwned: number
  averageMachineValue: number
  topPerformingMachine: string
  earningsByMonth: { month: string; earnings: number }[]
  machineDistribution: { level: number; count: number; percentage: number }[]
}

export function MachineAnalytics({ user }: MachineAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalInvested: 0,
    totalEarned: 0,
    weeklyEarnings: 0,
    roi: 0,
    machinesOwned: 0,
    averageMachineValue: 0,
    topPerformingMachine: "Time Machine Level 1",
    earningsByMonth: [],
    machineDistribution: []
  })

  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = () => {
      const ownedMachines = user.ownedMachines || []
      const totalInvested = ownedMachines.reduce((sum, machine) => sum + machine.cost, 0)
      const totalEarned = ownedMachines.reduce((sum, machine) => sum + machine.totalEarned, 0)
      const weeklyEarnings = ownedMachines.reduce((sum, machine) => sum + machine.weeklyReturn, 0)
      const roi = totalInvested > 0 ? ((totalEarned / totalInvested) * 100) : 0

      // Generate mock data for demonstration
      const earningsByMonth = [
        { month: "Jan", earnings: 120 },
        { month: "Feb", earnings: 180 },
        { month: "Mar", earnings: 250 },
        { month: "Apr", earnings: 320 },
        { month: "May", earnings: 400 },
        { month: "Jun", earnings: 480 }
      ]

      const machineDistribution = [
        { level: 1, count: 2, percentage: 40 },
        { level: 2, count: 1, percentage: 20 },
        { level: 3, count: 1, percentage: 20 },
        { level: 4, count: 1, percentage: 20 },
        { level: 5, count: 0, percentage: 0 }
      ]

      setAnalytics({
        totalInvested,
        totalEarned,
        weeklyEarnings,
        roi,
        machinesOwned: ownedMachines.length,
        averageMachineValue: ownedMachines.length > 0 ? totalInvested / ownedMachines.length : 0,
        topPerformingMachine: ownedMachines.length > 0 ? ownedMachines[0].name : "None",
        earningsByMonth,
        machineDistribution
      })
    }

    loadAnalytics()
  }, [user])

  const getRarityColor = (level: number) => {
    const colors = {
      1: "bg-gray-500",
      2: "bg-green-500",
      3: "bg-blue-500", 
      4: "bg-yellow-500",
      5: "bg-purple-500"
    }
    return colors[level as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass glow-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-3xl font-bold gradient-text">${analytics.totalInvested}</p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-3xl font-bold text-green-400">${analytics.totalEarned}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Earnings</p>
                <p className="text-3xl font-bold text-blue-400">${analytics.weeklyEarnings}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-purple">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-3xl font-bold text-purple-400">{analytics.roi.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card className="glass glow-cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Earnings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.earningsByMonth.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{month.month}</span>
                    <span className="font-semibold">${month.earnings}</span>
                  </div>
                  <Progress 
                    value={(month.earnings / Math.max(...analytics.earningsByMonth.map(m => m.earnings))) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Machine Distribution */}
        <Card className="glass glow-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Machine Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.machineDistribution.map((dist) => (
                <div key={dist.level} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Badge className={`${getRarityColor(dist.level)} text-white text-xs`}>
                        Level {dist.level}
                      </Badge>
                      <span>{dist.count} machines</span>
                    </span>
                    <span className="font-semibold">{dist.percentage}%</span>
                  </div>
                  <Progress value={dist.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass glow-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h4 className="font-semibold">{analytics.topPerformingMachine}</h4>
              <p className="text-sm text-muted-foreground">Best ROI machine</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Average Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-semibold">${analytics.averageMachineValue.toFixed(0)}</h4>
              <p className="text-sm text-muted-foreground">Per machine</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Portfolio Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold">{analytics.machinesOwned}</h4>
              <p className="text-sm text-muted-foreground">Total machines</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection */}
      <Card className="glass glow-cyan">
        <CardHeader>
          <CardTitle>Analytics Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "7d", label: "7 Days" },
              { value: "30d", label: "30 Days" },
              { value: "90d", label: "90 Days" },
              { value: "1y", label: "1 Year" }
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period.value)}
                className={selectedPeriod === period.value ? "btn-primary" : "glass-sm"}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

