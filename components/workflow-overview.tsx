"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  ShoppingCart, 
  Zap, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  BarChart3
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface WorkflowOverviewProps {
  user: any
  onNavigate: (section: string) => void
}

export function WorkflowOverview({ user, onNavigate }: WorkflowOverviewProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const userMachines = user.machines || []
  const userBalance = user.balance || 0
  const totalEarned = user.claimedBalance || 0
  const totalInvested = user.totalInvested || 0

  const workflowSteps = [
    {
      id: "topup",
      title: "Top Up Balance",
      description: "Add funds to your account",
      icon: <Wallet className="w-6 h-6" />,
      status: userBalance > 0 ? "completed" : "pending",
      action: "Add Funds",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "purchase",
      title: "Purchase Machines",
      description: "Buy time machines from marketplace",
      icon: <ShoppingCart className="w-6 h-6" />,
      status: userMachines.length > 0 ? "completed" : "pending",
      action: "Go to Marketplace",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "claim",
      title: "Claim Rewards",
      description: "Collect weekly returns",
      icon: <Zap className="w-6 h-6" />,
      status: totalEarned > 0 ? "completed" : "pending",
      action: "Claim Rewards",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "withdraw",
      title: "Withdraw Profits",
      description: "Cash out your earnings",
      icon: <DollarSign className="w-6 h-6" />,
      status: "pending",
      action: "Withdraw",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const getStepStatus = (step: any) => {
    if (step.status === "completed") return "completed"
    if (step.status === "pending") return "pending"
    return "locked"
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success"
      case "pending": return "text-warning"
      default: return "text-muted-foreground"
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-success" />
      case "pending": return <Clock className="w-5 h-5 text-warning" />
      default: return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const totalWeeklyIncome = userMachines.reduce((sum: number, machine: any) => 
    sum + (machine.rewardAmount || machine.weeklyReturn || 0), 0
  )

  const roi = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Investment Workflow
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Follow this step-by-step process to maximize your time machine investments and earnings.
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflowSteps.map((step, index) => {
          const status = getStepStatus(step)
          const isCompleted = status === "completed"
          const isPending = status === "pending"
          
          return (
            <Card 
              key={step.id}
              className={`group hover:shadow-lg transition-all duration-300 border-border ${
                isCompleted ? 'bg-success/5 border-success/20' : 
                isPending ? 'bg-warning/5 border-warning/20' : 
                'bg-muted/5 border-border'
              }`}
            >
              <CardHeader className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-success/20' : 
                  isPending ? 'bg-warning/20' : 
                  'bg-muted/20'
                }`}>
                  {getStepIcon(status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    <Badge className={
                      isCompleted ? 'bg-success/20 text-success' :
                      isPending ? 'bg-warning/20 text-warning' :
                      'bg-muted/20 text-muted-foreground'
                    }>
                      {isCompleted ? 'Complete' : isPending ? 'Ready' : 'Locked'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  onClick={() => onNavigate(step.id === "topup" ? "invest" : step.id)}
                  disabled={!isCompleted && !isPending}
                  className={`w-full ${
                    isCompleted ? 'bg-success hover:bg-success/90' :
                    isPending ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' :
                    'bg-muted text-muted-foreground'
                  } text-white font-semibold`}
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Summary */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Portfolio Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{userMachines.length}</div>
                <div className="text-sm text-muted-foreground">Time Machines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">${totalWeeklyIncome.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Weekly Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">${userBalance.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Available Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{roi.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">ROI</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onNavigate("invest")}
              className="w-full justify-start"
              variant="outline"
            >
              <Wallet className="w-4 h-4 mr-3" />
              Top Up Balance
            </Button>
            <Button 
              onClick={() => onNavigate("marketplace")}
              className="w-full justify-start"
              variant="outline"
            >
              <ShoppingCart className="w-4 h-4 mr-3" />
              Buy Time Machines
            </Button>
            <Button 
              onClick={() => onNavigate("claim")}
              className="w-full justify-start"
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-3" />
              Claim Rewards
            </Button>
            <Button 
              onClick={() => onNavigate("withdraw")}
              className="w-full justify-start"
              variant="outline"
            >
              <DollarSign className="w-4 h-4 mr-3" />
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Time Machines Preview */}
      {userMachines.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Your Time Machines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userMachines.slice(0, 3).map((machine: any, index: number) => {
                const isDarkMode = theme === 'dark'
                const imageSrc = isDarkMode ? `/time black ${machine.level}.png` : `/time ${machine.level}.png`
                
                return (
                  <div key={machine.id} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="relative w-12 h-12">
                      <Image
                        src={imageSrc}
                        alt={machine.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{machine.name}</div>
                      <div className="text-sm text-success">
                        ${machine.rewardAmount || machine.weeklyReturn || 0}/week
                      </div>
                    </div>
                  </div>
                )
              })}
              {userMachines.length > 3 && (
                <div className="flex items-center justify-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="font-medium text-foreground">+{userMachines.length - 3} more</div>
                    <div className="text-sm text-muted-foreground">machines</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Tips */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Investment Strategy Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Getting Started</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Start with smaller investments to test the system</li>
                <li>• Top up your balance before purchasing machines</li>
                <li>• Diversify across different machine tiers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Maximizing Returns</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Claim rewards regularly to compound growth</li>
                <li>• Use referral bonuses to accelerate earnings</li>
                <li>• Upgrade machines for better performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

