"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign, 
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import type { User } from "@/lib/storage"

interface LiveAnalyticsProps {
  user: User
}

export function LiveAnalytics({ user }: LiveAnalyticsProps) {
  const [liveData, setLiveData] = useState({
    activeUsers: 1247,
    totalInvestments: 45678,
    totalEarnings: 234567,
    machinesActive: 3456,
    claimsToday: 1234,
    systemHealth: 99.8
  })

  const [timeData, setTimeData] = useState<number[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setLiveData(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        totalInvestments: prev.totalInvestments + Math.floor(Math.random() * 100),
        totalEarnings: prev.totalEarnings + Math.floor(Math.random() * 500),
        machinesActive: prev.machinesActive + Math.floor(Math.random() * 20 - 10),
        claimsToday: prev.claimsToday + Math.floor(Math.random() * 50),
        systemHealth: Math.min(100, Math.max(95, prev.systemHealth + (Math.random() - 0.5) * 2))
      }))

      // Update time series data
      setTimeData(prev => {
        const newData = [...prev]
        newData.push(Math.floor(Math.random() * 1000) + 500)
        return newData.slice(-20) // Keep last 20 data points
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getHealthColor = (health: number) => {
    if (health >= 99) return "text-success"
    if (health >= 95) return "text-warning"
    return "text-destructive"
  }

  const getHealthStatus = (health: number) => {
    if (health >= 99) return "Excellent"
    if (health >= 95) return "Good"
    if (health >= 90) return "Fair"
    return "Poor"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Live Analytics</h1>
          <p className="text-muted-foreground">Real-time platform statistics and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isLive ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(liveData.activeUsers)}</p>
                <p className="text-xs text-success">+12% from yesterday</p>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Investments</p>
                <p className="text-2xl font-bold text-foreground">${formatNumber(liveData.totalInvestments)}</p>
                <p className="text-xs text-success">+8% this week</p>
              </div>
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">${formatNumber(liveData.totalEarnings)}</p>
                <p className="text-xs text-success">+15% this month</p>
              </div>
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Machines</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(liveData.machinesActive)}</p>
                <p className="text-xs text-primary">+5% today</p>
              </div>
              <Zap className="w-6 h-6 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Claims Today</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(liveData.claimsToday)}</p>
                <p className="text-xs text-success">+22% this hour</p>
              </div>
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">System Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(liveData.systemHealth)}`}>
                  {liveData.systemHealth.toFixed(1)}%
                </p>
                <p className={`text-xs ${getHealthColor(liveData.systemHealth)}`}>
                  {getHealthStatus(liveData.systemHealth)}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Platform Activity (Last 20 Updates)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-1">
              {timeData.map((value, index) => (
                <div
                  key={index}
                  className="bg-primary rounded-t-sm flex-1"
                  style={{ height: `${(value / Math.max(...timeData)) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>20 updates ago</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge className="bg-success/20 text-success">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Gateway</span>
                <Badge className="bg-success/20 text-success">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time Machines</span>
                <Badge className="bg-success/20 text-success">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Referral System</span>
                <Badge className="bg-success/20 text-success">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Notifications</span>
                <Badge className="bg-success/20 text-success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "2 minutes ago", action: "New user registered", type: "success" },
              { time: "5 minutes ago", action: "Large investment processed", type: "info" },
              { time: "8 minutes ago", action: "Time machine claim completed", type: "success" },
              { time: "12 minutes ago", action: "Referral bonus awarded", type: "success" },
              { time: "15 minutes ago", action: "Withdrawal request submitted", type: "info" },
              { time: "18 minutes ago", action: "System health check passed", type: "success" },
              { time: "22 minutes ago", action: "New time machine unlocked", type: "success" },
              { time: "25 minutes ago", action: "Payment processed successfully", type: "success" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-success' : 
                  activity.type === 'info' ? 'bg-primary' : 'bg-warning'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">45ms</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">2.3s</div>
              <div className="text-xs text-muted-foreground">Load Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">1.2K</div>
              <div className="text-xs text-muted-foreground">Requests/min</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}