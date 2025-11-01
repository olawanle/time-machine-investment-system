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
  Star,
  RefreshCw
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface DatabaseMachineClaimingProps {
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

export function DatabaseMachineClaiming({ user, onUserUpdate }: DatabaseMachineClaimingProps) {
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState("")
  const [machineData, setMachineData] = useState<MachineData | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  // Fetch user's machines from database
  useEffect(() => {
    fetchMachines()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMachines, 30000)
    return () => clearInterval(interval)
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

  const handleClaim = async (machineId: string) => {
    setClaimError("")
    setClaimSuccess("")
    setClaiming(machineId)

    try {
      const res = await fetch('/api/machines/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, machine_id: machineId })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to claim')
      }

      setClaimSuccess(`Successfully claimed $${data.reward_amount}!`)
      
      // Update user balance in UI
      const updatedUser = { 
        ...user, 
        balance: data.new_balance,
        total_earned: data.total_earned
      }
      onUserUpdate(updatedUser)
      
      // Refresh machines data
      await fetchMachines()
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setClaimSuccess(""), 3000)
    } catch (error: any) {
      setClaimError(error.message || "Failed to claim rewards. Please try again.")
    } finally {
      setClaiming(null)
    }
  }

  const getMachineImage = (machineType: string) => {
    const isDarkMode = theme === 'dark'
    const images: { [key: string]: string } = {
      'basic_miner': isDarkMode ? "/time black 1.png" : "/time 1.png",
      'advanced_miner': isDarkMode ? "/time black 2.png" : "/time 2.png",
      'premium_miner': isDarkMode ? "/time black 3.png" : "/time 3.png",
      'elite_miner': isDarkMode ? "/time black 4.png" : "/time 4.png",
      'quantum_miner': isDarkMode ? "/time black 5.png" : "/time 5.png"
    }
    return images[machineType] || images['basic_miner']
  }

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      'bronze': "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      'silver': "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      'gold': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      'platinum': "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    }
    return colors[tier] || colors['bronze']
  }

  const formatTimeUntilClaim = (nextClaimTime: string | null) => {
    if (!nextClaimTime) return "Ready to claim!"
    
    const now = new Date()
    const claimTime = new Date(nextClaimTime)
    const diff = claimTime.getTime() - now.getTime()
    
    if (diff <= 0) return "Ready to claim!"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your time machines...</p>
        </div>
      </div>
    )
  }

  const userMachines = machineData?.machines || []
  const statistics = machineData?.statistics

  if (userMachines.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Time Machines Yet</h3>
          <p className="text-muted-foreground mb-6">
            Purchase your first time machine from the marketplace to start earning passive income!
          </p>
          <Button onClick={() => window.location.href = '/marketplace'}>
            Browse Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Machines</p>
                  <p className="text-2xl font-bold">{statistics.total_machines}</p>
                </div>
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-bold">${statistics.total_investment.toFixed(2)}</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">${statistics.total_earnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Claimable Now</p>
                  <p className="text-2xl font-bold text-green-600">${statistics.total_claimable.toFixed(2)}</p>
                </div>
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success/Error Messages */}
      {claimSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{claimSuccess}</span>
        </div>
      )}

      {claimError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{claimError}</span>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Time Machines</h2>
        <Button variant="outline" onClick={fetchMachines} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userMachines.map((machine) => (
          <Card key={machine.id} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{machine.name}</CardTitle>
                <Badge className={getTierColor(machine.machine_templates?.tier || 'bronze')}>
                  {machine.machine_templates?.tier || 'Bronze'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Machine Image */}
              <div className="flex justify-center">
                <Image
                  src={getMachineImage(machine.machine_type)}
                  alt={machine.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>

              {/* Machine Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment:</span>
                  <span className="font-semibold">${machine.investment_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="font-semibold text-green-600">${machine.reward_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earned:</span>
                  <span className="font-semibold">${machine.current_earnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claimable:</span>
                  <span className="font-semibold text-blue-600">${machine.claimable_amount}</span>
                </div>
              </div>

              {/* Claim Status */}
              <div className="text-center">
                {machine.can_claim ? (
                  <div className="space-y-2">
                    <div className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Ready to claim!
                    </div>
                    <Button
                      onClick={() => handleClaim(machine.id)}
                      disabled={claiming === machine.id}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {claiming === machine.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Claim ${machine.claimable_amount}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      Next claim: {formatTimeUntilClaim(machine.next_claim_time)}
                    </div>
                    <Button disabled className="w-full">
                      <Clock className="w-4 h-4 mr-2" />
                      Claim in {formatTimeUntilClaim(machine.next_claim_time)}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}