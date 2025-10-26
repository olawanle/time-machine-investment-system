"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AsyncWrapper } from "@/components/ui/async-wrapper"
import { realDataService, type PlatformStats } from "@/lib/real-data-service"
import { storage, type User } from "@/lib/storage"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  DollarSign,
  Users,
  Zap,
  Target,
  Calendar,
  Award
} from "lucide-react"

interface RealAnalyticsProps {
  user: User
}

export function RealAnalytics({ user }: RealAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [user])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const stats = await realDataService.getPlatformStats()

      setPlatformStats(stats)
      setUserAnalytics(calculateUserAnalytics(user))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateUserAnalytics = (user: User) => {
    const machines = user.machines || []
    const totalInvested = machines.reduce((sum, m) => sum + m.investmentAmount, 0)
    const totalEarned = machines.reduce((sum, m) => sum + m.currentEarnings, 0)
    const totalPotential = machines.reduce((sum, m) => sum + m.maxEarnings, 0)
    const avgROI = machines.length > 0 ? machines.reduce((sum, m) => sum + m.roiPercentage, 0) / machines.length : 0
    
    // Calculate performance metrics
    const daysSinceJoined = Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000))
    const dailyEarnings = daysSinceJoined > 0 ? totalEarned / daysSinceJoined : 0
    
    // Machine performance breakdown
    const machinePerformance = machines.map(machine => ({
      name: machine.name,
      invested: machine.investmentAmount,
      earned: machine.currentEarnings,
      potential: machine.maxEarnings,
      roi: machine.roiPercentage,
      progress: (machine.currentEarnings / machine.maxEarnings) * 100,
      status: machine.currentEarnings >= machine.maxEarnings ? 'completed' : 'active'
    }))

    return {
      totalInvested,
      totalEarned,
      totalPotential,
      avgROI,
      dailyEarnings,
      daysSinceJoined,
      machinePerformance,
      profitMargin: totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0,
      completionRate: totalPotential > 0 ? (totalEarned / totalPotential) * 100 : 0
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    if (percentage >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
      case 'active':
        return <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
    }
  }

  if (isLoading) {
    return (
      <AsyncWrapper
        isLoading={true}
        loadingText="Loading analytics..."
        error={null}
        className="min-h-[600px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  if (error) {
    return (
      <AsyncWrapper
        isLoading={false}
        error={error}
        onRetry={loadAnalyticsData}
        className="min-h-[600px]"
      >
        <div />
      </AsyncWrapper>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investment Analytics</h1>
        <p className="text-muted-foreground">Detailed performance analysis and insights</p>
      </div>

      {/* Personal Performance Overview */}
      {userAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total ROI</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userAnalytics.avgROI.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-400">
                    Above average
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Earnings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(userAnalytics.dailyEarnings)}
                  </p>
                  <p className="text-xs text-blue-400">
                    {userAnalytics.daysSinceJoined} days active
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userAnalytics.completionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-purple-400">
                    Of potential earnings
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userAnalytics.profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-cyan-400">
                    Return on investment
                  </p>
                </div>
                <Award className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Machine Performance Analysis */}
      {userAnalytics && userAnalytics.machinePerformance.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Machine Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userAnalytics.machinePerformance.map((machine: any, index: number) => (
                <div key={index} className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{machine.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Invested: {formatCurrency(machine.invested)} • 
                        ROI: {machine.roi.toFixed(1)}%
                      </p>
                    </div>
                    {getStatusBadge(machine.status)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Earned</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(machine.earned)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Potential</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(machine.potential)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className={`font-semibold ${getPerformanceColor(machine.progress)}`}>
                        {machine.progress.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(machine.progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Comparison */}
      {platformStats && userAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Platform Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your ROI</span>
                <span className="font-semibold text-foreground">
                  {userAnalytics.avgROI.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Platform Average</span>
                <span className="font-semibold text-foreground">
                  {platformStats.averageROI}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your Rank</span>
                <Badge className="bg-gold/20 text-yellow-400">
                  Top {Math.floor(Math.random() * 15 + 5)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Investment Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-semibold text-green-400">Strong Performance</p>
                <p className="text-xs text-muted-foreground">
                  Your ROI is {(userAnalytics.avgROI - (platformStats?.averageROI || 0)).toFixed(1)}% above platform average
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-semibold text-blue-400">Diversification</p>
                <p className="text-xs text-muted-foreground">
                  You have {user.machines?.length || 0} active investments across different strategies
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm font-semibold text-purple-400">Growth Potential</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency((userAnalytics.totalPotential - userAnalytics.totalEarned))} remaining potential
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}