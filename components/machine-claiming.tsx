"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Star
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
interface MachineClaimingProps {
  user: any
  onUserUpdate: (user: any) => void
}

interface TimeMachine {
  id: string
  machine_type: string
  name: string
  description: string
  investment_amount: number
  reward_amount: number
  claim_interval_hours: number
  current_earnings: number
  is_active: boolean
  last_claimed_at: string | null
  claimable_amount: number
  next_claim_time: string | null
  can_claim: boolean
  machine_templates?: {
    name: string
    description: string
    icon_url: string
    tier: string
  }
}

interface MachineData {
  machines: TimeMachine[]
  statistics: {
    total_machines: number
    total_investment: number
    total_earnings: number
    total_claimable: number
    active_machines: number
  }
}

export function MachineClaiming({ user, onUserUpdate }: MachineClaimingProps) {
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState("")
  const [machineData, setMachineData] = useState<MachineData | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  // Fetch user's machines from database
  useEffect(() => {
    fetchMachines()
  }, [user.id])

  const fetchMachines = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/machines?user_id=${user.id}`)
      const result = await response.json()
      
      if (result.success) {
        setMachineData(result.data)
      } else {
        setClaimError(result.error || 'Failed to fetch machines')
      }
    } catch (error) {
      console.error('Error fetching machines:', error)
      setClaimError('Failed to load machines')
    } finally {
      setLoading(false)
    }
  }

  const userMachines = machineData?.machines || []
  const userBalance = user.balance || 0

  const handleClaim = async (machineId: string) => {
    setClaimError("")
    setClaimSuccess("")
    setClaiming(machineId)

    try {
      const res = await fetch('/api/machines/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, machineId })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to claim')

      setClaimSuccess(`Successfully claimed $${(data?.reward || 0)}!`)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setClaimSuccess(""), 3000)
    } catch (error) {
      setClaimError("Failed to claim rewards. Please try again.")
    } finally {
      setClaiming(null)
    }
  }

  const getMachineImage = (level: number) => {
    const isDarkMode = theme === 'dark'
    const images = {
      1: isDarkMode ? "/time black 1.png" : "/time 1.png",
      2: isDarkMode ? "/time black 2.png" : "/time 2.png",
      3: isDarkMode ? "/time black 3.png" : "/time 3.png",
      4: isDarkMode ? "/time black 4.png" : "/time 4.png",
      5: isDarkMode ? "/time black 5.png" : "/time 5.png"
    }
    return images[level as keyof typeof images] || images[1]
  }

  const getTierColor = (level: number) => {
    const colors = {
      1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      2: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      3: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      4: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      5: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    }
    return colors[level as keyof typeof colors] || colors[1]
  }

  const getTierName = (level: number) => {
    const names = {
      1: "Basic",
      2: "Advanced", 
      3: "Elite",
      4: "Legendary",
      5: "Mythic"
    }
    return names[level as keyof typeof names] || "Unknown"
  }

  if (userMachines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Time Machines</h3>
        <p className="text-muted-foreground mb-6">
          You don't have any time machines yet. Purchase some from the marketplace to start earning.
        </p>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white">
          Go to Marketplace
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Claim Your Rewards
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Collect weekly returns from your time machines. Each machine generates passive income automatically.
        </p>
      </div>

      {/* Error/Success Messages */}
      {claimError && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          {claimError}
        </div>
      )}

      {claimSuccess && (
        <div className="flex items-center gap-2 text-success text-sm bg-success/10 border border-success/20 rounded-lg p-3">
          <CheckCircle className="w-4 h-4" />
          {claimSuccess}
        </div>
      )}

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userMachines.map((machine: any, index: number) => {
          const now = Date.now()
          const timeSinceLastClaim = now - machine.lastClaimedAt
          const claimInterval = machine.claimIntervalMs || (7 * 24 * 60 * 60 * 1000)
          const isReady = timeSinceLastClaim >= claimInterval
          const timeRemaining = Math.max(0, claimInterval - timeSinceLastClaim)
          const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000))
          const daysRemaining = Math.ceil(hoursRemaining / 24)
          
          const currentEarnings = machine.currentEarnings || 0
          const maxEarnings = machine.maxEarnings || (machine.investmentAmount * 2)
          const isMaxEarnings = currentEarnings >= maxEarnings
          const rewardAmount = machine.rewardAmount || machine.weeklyReturn || 0
          
          return (
            <Card 
              key={machine.id} 
              className="group hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="text-center space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <Image
                    src={getMachineImage(machine.level)}
                    alt={machine.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{machine.name}</h3>
                    <Badge className={getTierColor(machine.level)}>
                      {getTierName(machine.level)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {machine.description || `Level ${machine.level} time machine`}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Reward Info */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-success">
                    ${rewardAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Weekly Return
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  {isMaxEarnings ? (
                    <div className="text-center">
                      <Badge className="bg-warning/20 text-warning">
                        <Star className="w-3 h-3 mr-1" />
                        Max Earnings Reached
                      </Badge>
                    </div>
                  ) : isReady ? (
                    <div className="text-center">
                      <Badge className="bg-success/20 text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready to Claim
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Badge className="bg-warning/20 text-warning">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysRemaining > 0 ? `${daysRemaining}d` : `${hoursRemaining}h`} remaining
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Earnings Progress</span>
                    <span>{Math.round((currentEarnings / maxEarnings) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((currentEarnings / maxEarnings) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${currentEarnings.toFixed(2)}</span>
                    <span>${maxEarnings.toFixed(2)}</span>
                  </div>
                </div>

                {/* Claim Button */}
                <Button
                  onClick={() => handleClaim(machine.id)}
                  disabled={!isReady || isMaxEarnings || claiming === machine.id}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold"
                >
                  {claiming === machine.id ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : isMaxEarnings ? (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Max Earnings Reached
                    </>
                  ) : isReady ? (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Claim ${rewardAmount}
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Wait {daysRemaining > 0 ? `${daysRemaining}d` : `${hoursRemaining}h`}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Time Machine Portfolio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{userMachines.length}</div>
              <div className="text-muted-foreground">Total Machines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ${userMachines.reduce((sum: number, m: any) => sum + (m.rewardAmount || 0), 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Weekly Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${userMachines.reduce((sum: number, m: any) => sum + (m.currentEarnings || 0), 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

