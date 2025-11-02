"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Clock, TrendingUp, Zap, Star, Plus } from "lucide-react"
import type { User } from "@/lib/storage"

interface MachinePortfolioProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function MachinePortfolio({ user, onUserUpdate }: MachinePortfolioProps) {
  const [ownedMachines, setOwnedMachines] = useState<any[]>([])
  const [totalWeeklyEarnings, setTotalWeeklyEarnings] = useState(0)
  const [nextPayout, setNextPayout] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load user's owned machines from database
    const loadMachines = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        const res = await fetch(`/api/original-machines?user_id=${user.id}`)
        const data = await res.json()
        
        if (!res.ok) throw new Error(data?.error || 'Failed to load machines')
        
        const machines = data.machines || []
        setOwnedMachines(machines)
        
        // Calculate total weekly earnings
        const total = machines.reduce((sum: number, machine: any) => sum + (machine.weekly_return || 0), 0)
        setTotalWeeklyEarnings(total)
        
        // Calculate next payout based on earliest claimable machine
        if (machines.length > 0) {
          const nextClaimTimes = machines
            .map((m: any) => m.next_claim_time)
            .filter(Boolean)
            .sort()
          
          if (nextClaimTimes.length > 0) {
            setNextPayout(new Date(nextClaimTimes[0]).toLocaleDateString())
          } else {
            setNextPayout("Available now")
          }
        }
        
      } catch (error: any) {
        console.error('Error loading machines:', error)
        setError(error.message || 'Failed to load machines')
      } finally {
        setLoading(false)
      }
    }
    
    loadMachines()
  }, [user?.id])

  const handleClaimEarnings = async (machineId: string) => {
    try {
      const res = await fetch('/api/original-machines/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          machine_id: machineId
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to claim rewards')
      
      // Update user balance
      const updatedUser = {
        ...user,
        balance: data.new_balance,
        totalEarned: data.total_earned
      }
      onUserUpdate(updatedUser)
      
      // Reload machines to get updated claim status
      const machinesRes = await fetch(`/api/original-machines?user_id=${user.id}`)
      const machinesData = await machinesRes.json()
      if (machinesRes.ok) {
        setOwnedMachines(machinesData.machines || [])
      }
      
    } catch (error: any) {
      console.error('Error claiming rewards:', error)
      setError(error.message || 'Failed to claim rewards')
    }
  }

  const getRarityColor = (level: number) => {
    const rarities = {
      1: "bg-gray-500",
      2: "bg-green-500", 
      3: "bg-blue-500",
      4: "bg-yellow-500",
      5: "bg-purple-500"
    }
    return rarities[level as keyof typeof rarities] || "bg-gray-500"
  }

  const getRarityName = (level: number) => {
    const names = {
      1: "BASIC",
      2: "IMPROVED",
      3: "ADVANCED", 
      4: "ELITE",
      5: "LEGENDARY"
    }
    return names[level as keyof typeof names] || "BASIC"
  }

  const getMachineImage = (level: number) => {
    const images = {
      1: "/time 1.png",
      2: "/time 2.png",
      3: "/time 3.png",
      4: "/time 4.png",
      5: "/time 5.png"
    }
    return images[level as keyof typeof images] || "/time 1.png"
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Zap className="w-12 h-12 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold gradient-text mb-4">Loading Your Machines...</h3>
        <p className="text-muted-foreground">
          Fetching your time machine portfolio from the database.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Error Loading Machines</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </Button>
      </div>
    )
  }

  if (ownedMachines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-12 h-12 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold gradient-text mb-4">No Time Machines Yet</h3>
        <p className="text-muted-foreground mb-6">
          Start your time machine investment journey by purchasing your first machine.
        </p>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Buy Your First Machine
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass glow-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Machines</p>
                <p className="text-3xl font-bold gradient-text">{ownedMachines.length}</p>
              </div>
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Earnings</p>
                <p className="text-3xl font-bold text-green-400">${totalWeeklyEarnings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Payout</p>
                <p className="text-3xl font-bold text-blue-400">{nextPayout}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ownedMachines.map((machine) => (
          <Card key={machine.id} className="glass glow-cyan group hover:border-cyan-400/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {machine.machine_name}
                </CardTitle>
                <Badge className={`${getRarityColor(machine.machine_level)} text-white`}>
                  {getRarityName(machine.machine_level)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg flex items-center justify-center p-4">
                <img
                  src={getMachineImage(machine.machine_level)}
                  alt={machine.machine_name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily Return:</span>
                  <span className="font-semibold text-green-400">${machine.daily_return?.toFixed(2) || (machine.weekly_return / 7).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Return:</span>
                  <span className="font-semibold text-cyan-400">${machine.weekly_return}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Claimed:</span>
                  <span className="font-semibold text-blue-400">${machine.total_claimed || 0}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span className="font-semibold text-purple-400">${machine.purchase_price}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Claimable Amount:</span>
                  <span className="font-semibold text-green-400">${machine.claimable_amount || 0}</span>
                </div>
                {machine.next_claim_time && (
                  <div className="text-xs text-muted-foreground">
                    Next claim: {new Date(machine.next_claim_time).toLocaleString()}
                  </div>
                )}
              </div>

              <Button 
                onClick={() => handleClaimEarnings(machine.id)}
                className="w-full btn-primary"
                disabled={!machine.can_claim || (machine.claimable_amount || 0) <= 0}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {machine.can_claim ? `Claim $${machine.claimable_amount || 0}` : 'Claim Unavailable'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="glass glow-cyan">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Buy More Machines
            </Button>
            <Button variant="outline" className="glass-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="glass-sm">
              <Clock className="w-4 h-4 mr-2" />
              Payout History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

