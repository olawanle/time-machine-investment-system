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

interface OwnedMachine {
  id: number
  name: string
  cost: number
  weeklyReturn: number
  purchaseDate: string
  nextPayout: string
  totalEarned: number
  image: string
  darkImage: string
}

export function MachinePortfolio({ user, onUserUpdate }: MachinePortfolioProps) {
  const [ownedMachines, setOwnedMachines] = useState<OwnedMachine[]>([])
  const [totalWeeklyEarnings, setTotalWeeklyEarnings] = useState(0)
  const [nextPayout, setNextPayout] = useState("")

  useEffect(() => {
    // Load user's owned machines from storage
    const loadMachines = () => {
      const machines = user.ownedMachines || []
      setOwnedMachines(machines)
      
      // Calculate total weekly earnings
      const total = machines.reduce((sum, machine) => sum + machine.weeklyReturn, 0)
      setTotalWeeklyEarnings(total)
      
      // Calculate next payout (simplified - in real app would use actual dates)
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      setNextPayout(nextWeek.toLocaleDateString())
    }
    
    loadMachines()
  }, [user])

  const handleClaimEarnings = (machineId: number) => {
    // Simulate claiming earnings
    const updatedMachines = ownedMachines.map(machine => {
      if (machine.id === machineId) {
        return {
          ...machine,
          totalEarned: machine.totalEarned + machine.weeklyReturn,
          nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      }
      return machine
    })
    
    setOwnedMachines(updatedMachines)
    
    // Update user balance
    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + ownedMachines.find(m => m.id === machineId)?.weeklyReturn || 0,
      ownedMachines: updatedMachines
    }
    
    onUserUpdate(updatedUser)
  }

  const getRarityColor = (machineId: number) => {
    const rarities = {
      1: "bg-gray-500",
      2: "bg-green-500", 
      3: "bg-blue-500",
      4: "bg-yellow-500",
      5: "bg-purple-500"
    }
    return rarities[machineId as keyof typeof rarities] || "bg-gray-500"
  }

  const getRarityName = (machineId: number) => {
    const names = {
      1: "BASIC",
      2: "IMPROVED",
      3: "ADVANCED", 
      4: "ELITE",
      5: "LEGENDARY"
    }
    return names[machineId as keyof typeof names] || "BASIC"
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
                  {machine.name}
                </CardTitle>
                <Badge className={`${getRarityColor(machine.id)} text-white`}>
                  {getRarityName(machine.id)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg flex items-center justify-center p-4">
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Return:</span>
                  <span className="font-semibold text-green-400">${machine.weeklyReturn}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Earned:</span>
                  <span className="font-semibold text-cyan-400">${machine.totalEarned}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Payout:</span>
                  <span className="font-semibold text-blue-400">{machine.nextPayout}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress to next payout</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <Button 
                onClick={() => handleClaimEarnings(machine.id)}
                className="w-full btn-primary"
                disabled={false} // In real app, would check if payout is ready
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Claim ${machine.weeklyReturn}
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

