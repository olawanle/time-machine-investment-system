"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Clock, 
  DollarSign, 
  Zap, 
  Users, 
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface ActivityItem {
  id: string
  type: "investment" | "claim" | "withdrawal" | "referral" | "machine" | "system"
  message: string
  amount?: number
  username?: string
  timestamp: number
  status: "success" | "pending" | "info"
}

interface ActivityFeedProps {
  currentUser?: {
    username: string
    balance: number
    claimedBalance: number
  }
}

export function ActivityFeed({ currentUser }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Generate initial activities
    generateInitialActivities()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        addNewActivity()
      }
    }, 3000 + Math.random() * 7000) // Random interval between 3-10 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const generateInitialActivities = () => {
    const initialActivities: ActivityItem[] = [
      {
        id: "1",
        type: "investment",
        message: "New user registered",
        timestamp: Date.now() - 1000 * 60 * 2,
        status: "success"
      },
      {
        id: "2",
        type: "investment",
        message: "Large investment processed",
        amount: 2500,
        username: "crypto_trader",
        timestamp: Date.now() - 1000 * 60 * 5,
        status: "success"
      },
      {
        id: "3",
        type: "claim",
        message: "Time machine claim completed",
        amount: 45,
        username: "time_master",
        timestamp: Date.now() - 1000 * 60 * 8,
        status: "success"
      },
      {
        id: "4",
        type: "referral",
        message: "Referral bonus awarded",
        amount: 100,
        username: "referral_king",
        timestamp: Date.now() - 1000 * 60 * 12,
        status: "success"
      },
      {
        id: "5",
        type: "withdrawal",
        message: "Withdrawal request submitted",
        amount: 500,
        username: "earner_pro",
        timestamp: Date.now() - 1000 * 60 * 15,
        status: "pending"
      },
      {
        id: "6",
        type: "system",
        message: "System health check passed",
        timestamp: Date.now() - 1000 * 60 * 18,
        status: "success"
      },
      {
        id: "7",
        type: "machine",
        message: "New time machine unlocked",
        username: "investor_new",
        timestamp: Date.now() - 1000 * 60 * 22,
        status: "success"
      },
      {
        id: "8",
        type: "investment",
        message: "Payment processed successfully",
        amount: 1200,
        username: "btc_buyer",
        timestamp: Date.now() - 1000 * 60 * 25,
        status: "success"
      }
    ]

    setActivities(initialActivities)
  }

  const addNewActivity = () => {
    const activityTypes = [
      "investment", "claim", "withdrawal", "referral", "machine", "system"
    ] as const
    
    const usernames = [
      "crypto_trader", "time_master", "referral_king", "earner_pro", 
      "investor_new", "btc_buyer", "quantum_user", "temporal_investor",
      "machine_owner", "profit_seeker", "crypto_enthusiast", "time_traveler"
    ]

    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    const username = usernames[Math.floor(Math.random() * usernames.length)]
    const amount = Math.floor(Math.random() * 2000) + 50

    let message = ""
    let status: "success" | "pending" | "info" = "success"

    switch (type) {
      case "investment":
        message = `${username} invested $${amount}`
        break
      case "claim":
        message = `${username} claimed $${amount}`
        break
      case "withdrawal":
        message = `${username} requested withdrawal of $${amount}`
        status = "pending"
        break
      case "referral":
        message = `${username} earned $${amount} referral bonus`
        break
      case "machine":
        message = `${username} unlocked new time machine`
        break
      case "system":
        message = "System performance optimized"
        status = "info"
        break
    }

    const newActivity: ActivityItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      amount,
      username,
      timestamp: Date.now(),
      status
    }

    setActivities(prev => [newActivity, ...prev.slice(0, 19)]) // Keep last 20 activities
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "investment":
        return <DollarSign className="w-4 h-4 text-success" />
      case "claim":
        return <Zap className="w-4 h-4 text-primary" />
      case "withdrawal":
        return <TrendingUp className="w-4 h-4 text-warning" />
      case "referral":
        return <Users className="w-4 h-4 text-cyan-400" />
      case "machine":
        return <Award className="w-4 h-4 text-purple-400" />
      case "system":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success/20 text-success"
      case "pending":
        return "bg-warning/20 text-warning"
      case "info":
        return "bg-primary/20 text-primary"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Platform Activity
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-foreground font-medium truncate">
                    {activity.message}
                  </p>
                  {activity.amount && (
                    <Badge className="bg-primary/20 text-primary text-xs">
                      ${activity.amount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                  <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
              
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Activity Stats */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-success">
                {activities.filter(a => a.type === "investment").length}
              </div>
              <div className="text-xs text-muted-foreground">Investments</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {activities.filter(a => a.type === "claim").length}
              </div>
              <div className="text-xs text-muted-foreground">Claims</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning">
                {activities.filter(a => a.type === "withdrawal").length}
              </div>
              <div className="text-xs text-muted-foreground">Withdrawals</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
