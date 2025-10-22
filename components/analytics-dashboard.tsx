"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, DollarSign, Percent, Activity, Target } from "lucide-react"

interface AnalyticsDashboardProps {
  user: User
}

export function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const [earningsData, setEarningsData] = useState<Array<{ day: string; earnings: number }>>([])
  const [investmentData, setInvestmentData] = useState<Array<{ machine: string; value: number }>>([])
  const [roi, setRoi] = useState(0)
  const [dailyAverage, setDailyAverage] = useState(0)
  const [projectedMonthly, setProjectedMonthly] = useState(0)

  useEffect(() => {
    // Generate mock earnings data for the last 7 days
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        earnings: Math.random() * 100 + 50,
      })
    }
    setEarningsData(data)

    // Generate investment distribution data
    const machineData = user.machines.map((m, idx) => ({
      machine: `Machine ${idx + 1}`,
      value: m.rewardAmount,
    }))
    setInvestmentData(machineData.length > 0 ? machineData : [{ machine: "No Data", value: 0 }])

    // Calculate ROI
    const totalEarned = user.claimedBalance
    const totalInvested = user.balance
    const calculatedRoi = totalInvested > 0 ? ((totalEarned / totalInvested) * 100).toFixed(2) : "0"
    setRoi(Number(calculatedRoi))

    // Calculate daily average
    const avgDaily = user.machines.length > 0 ? (user.claimedBalance / 7).toFixed(2) : "0"
    setDailyAverage(Number(avgDaily))

    // Project monthly earnings
    const monthlyProjection = (Number(avgDaily) * 30).toFixed(2)
    setProjectedMonthly(Number(monthlyProjection))
  }, [user])

  const COLORS = ["#00d9ff", "#0066ff", "#00ff88", "#ffaa00", "#ff0066"]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass glow-cyan card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Return on Investment</CardDescription>
              <Percent className="w-4 h-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">{roi}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {roi > 0 ? <TrendingUp className="w-3 h-3 inline text-green-400 mr-1" /> : null}
              Performance
            </p>
          </CardContent>
        </Card>

        <Card className="glass glow-blue card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Daily Average</CardDescription>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">${dailyAverage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per day earnings</p>
          </CardContent>
        </Card>

        <Card className="glass glow-cyan card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Projected Monthly</CardDescription>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">${projectedMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">At current rate</p>
          </CardContent>
        </Card>

        <Card className="glass glow-blue card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Total Value</CardDescription>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">${(user.balance + user.claimedBalance).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card className="glass glow-cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Earnings Trend
            </CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                <XAxis dataKey="day" stroke="rgba(0, 217, 255, 0.5)" />
                <YAxis stroke="rgba(0, 217, 255, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 14, 23, 0.9)",
                    border: "1px solid rgba(0, 217, 255, 0.3)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `$${(value as number).toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#00d9ff"
                  strokeWidth={3}
                  dot={{ fill: "#00d9ff", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Machine Distribution */}
        <Card className="glass glow-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Machine Distribution
            </CardTitle>
            <CardDescription>Reward allocation</CardDescription>
          </CardHeader>
          <CardContent>
            {investmentData.length > 0 && investmentData[0].machine !== "No Data" ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={investmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ machine, value }) => `${machine}: $${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {investmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 14, 23, 0.9)",
                      border: "1px solid rgba(0, 217, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => `$${(value as number).toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">No machines to display</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Investment Summary */}
      <Card className="glass glow-cyan">
        <CardHeader>
          <CardTitle>Investment Summary</CardTitle>
          <CardDescription>Your portfolio breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
              <p className="text-2xl font-bold text-cyan-400">${user.balance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">Capital deployed</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Earned</p>
              <p className="text-2xl font-bold text-green-400">${user.claimedBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">Rewards claimed</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
              <p className="text-2xl font-bold text-blue-400">${(user.claimedBalance - user.balance).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {user.claimedBalance > user.balance ? "Positive" : "Negative"} return
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
