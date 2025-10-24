"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  TrendingUp, 
  Star,
  ArrowUp,
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface MachineUpgrade {
  id: number
  name: string
  description: string
  currentLevel: number
  maxLevel: number
  upgradeCost: number
  weeklyReturnIncrease: number
  image: string
  darkImage: string
  benefits: string[]
  isUpgradeable: boolean
}

interface MachineUpgradeSystemProps {
  user: any
  onUpgrade: (machineId: number) => void
  onUserUpdate: (user: any) => void
}

const machineUpgrades: MachineUpgrade[] = [
  {
    id: 1,
    name: "Chrono Basic",
    description: "Upgrade your basic time machine for better performance",
    currentLevel: 1,
    maxLevel: 5,
    upgradeCost: 50,
    weeklyReturnIncrease: 10,
    image: "/time 1.png",
    darkImage: "/time black 1.png",
    benefits: ["Faster processing", "Higher efficiency", "Better reliability"],
    isUpgradeable: true
  },
  {
    id: 2,
    name: "Chrono Advanced",
    description: "Enhance your advanced time machine capabilities",
    currentLevel: 2,
    maxLevel: 5,
    upgradeCost: 100,
    weeklyReturnIncrease: 20,
    image: "/time 2.png",
    darkImage: "/time black 2.png",
    benefits: ["Advanced algorithms", "Better optimization", "Premium features"],
    isUpgradeable: true
  },
  {
    id: 3,
    name: "Chrono Elite",
    description: "Maximize your elite time machine potential",
    currentLevel: 3,
    maxLevel: 5,
    upgradeCost: 200,
    weeklyReturnIncrease: 40,
    image: "/time 3.png",
    darkImage: "/time black 3.png",
    benefits: ["Elite performance", "Advanced analytics", "Premium support"],
    isUpgradeable: true
  },
  {
    id: 4,
    name: "Chrono Legendary",
    description: "Unlock legendary time machine powers",
    currentLevel: 4,
    maxLevel: 5,
    upgradeCost: 300,
    weeklyReturnIncrease: 60,
    image: "/time 4.png",
    darkImage: "/time black 4.png",
    benefits: ["Legendary status", "Exclusive benefits", "Maximum efficiency"],
    isUpgradeable: true
  },
  {
    id: 5,
    name: "Chrono Mythic",
    description: "Achieve mythical time machine mastery",
    currentLevel: 5,
    maxLevel: 5,
    upgradeCost: 0,
    weeklyReturnIncrease: 0,
    image: "/time 5.png",
    darkImage: "/time black 5.png",
    benefits: ["Maximum level reached", "Mythic powers unlocked", "Ultimate performance"],
    isUpgradeable: false
  }
]

export function MachineUpgradeSystem({ user, onUpgrade, onUserUpdate }: MachineUpgradeSystemProps) {
  const [selectedMachine, setSelectedMachine] = useState<MachineUpgrade | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeError, setUpgradeError] = useState("")
  const [upgradeSuccess, setUpgradeSuccess] = useState("")
  const { theme } = useTheme()

  const userMachines = user.machines || []
  const userBalance = user.balance || 0

  const handleUpgrade = async (machine: MachineUpgrade) => {
    setUpgradeError("")
    setUpgradeSuccess("")

    if (!machine.isUpgradeable) {
      setUpgradeError("This machine is already at maximum level.")
      return
    }

    if (userBalance < machine.upgradeCost) {
      setUpgradeError("Insufficient balance for upgrade.")
      return
    }

    try {
      // Simulate upgrade process
      const updatedUser = {
        ...user,
        balance: userBalance - machine.upgradeCost,
        machines: userMachines.map(m => 
          m.id === machine.id 
            ? { 
                ...m, 
                level: m.level + 1,
                weeklyReturn: m.weeklyReturn + machine.weeklyReturnIncrease
              }
            : m
        )
      }

      onUserUpdate(updatedUser)
      setUpgradeSuccess(`Successfully upgraded ${machine.name} to level ${machine.currentLevel + 1}!`)
      setShowUpgradeModal(false)
      setSelectedMachine(null)
    } catch (error) {
      setUpgradeError("Upgrade failed. Please try again.")
    }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Machine Upgrade System
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upgrade your existing time machines to unlock higher returns and better performance.
        </p>
      </div>

      {/* User's Machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userMachines.map((machine: any, index: number) => {
          const upgrade = machineUpgrades.find(u => u.id === machine.level)
          if (!upgrade) return null

          const isDarkMode = theme === 'dark'
          const imageSrc = isDarkMode ? upgrade.darkImage : upgrade.image
          
          return (
            <Card 
              key={machine.id} 
              className="group hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="text-center space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <Image
                    src={imageSrc}
                    alt={upgrade.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{upgrade.name}</h3>
                    <Badge className={getTierColor(upgrade.currentLevel)}>
                      Level {upgrade.currentLevel}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {upgrade.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Current Stats */}
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-foreground">
                    ${machine.weeklyReturn || 0}/week
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Returns
                  </div>
                </div>

                {/* Upgrade Info */}
                {upgrade.isUpgradeable ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-foreground">
                        Upgrade Cost: ${upgrade.upgradeCost}
                      </div>
                      <div className="text-xs text-success">
                        +${upgrade.weeklyReturnIncrease}/week after upgrade
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedMachine(upgrade)
                        setShowUpgradeModal(true)
                      }}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold"
                      disabled={userBalance < upgrade.upgradeCost}
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      {userBalance < upgrade.upgradeCost ? "Insufficient Balance" : "Upgrade Machine"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Badge className="bg-success/20 text-success">
                      <Star className="w-3 h-3 mr-1" />
                      Max Level
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      This machine is at maximum level
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-primary" />
                Upgrade {selectedMachine.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  Level {selectedMachine.currentLevel} → {selectedMachine.currentLevel + 1}
                </div>
                <div className="text-sm text-muted-foreground">
                  Upgrade Cost: ${selectedMachine.upgradeCost}
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <h4 className="font-semibold text-foreground">Benefits:</h4>
                <ul className="space-y-1">
                  {selectedMachine.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-success" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-success/10 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Weekly Return Increase:</span>
                  <span className="font-semibold text-success">
                    +${selectedMachine.weeklyReturnIncrease}
                  </span>
                </div>
              </div>

              {upgradeError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {upgradeError}
                </div>
              )}

              {upgradeSuccess && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {upgradeSuccess}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpgrade(selectedMachine)}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
                  disabled={userBalance < selectedMachine.upgradeCost}
                >
                  Confirm Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Tips */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Upgrade Strategy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Cost vs Benefit</h4>
              <p className="text-muted-foreground">
                Calculate the return on investment for each upgrade to maximize your profits.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Progressive Upgrades</h4>
              <p className="text-muted-foreground">
                Start with lower-level machines and gradually upgrade them for better returns.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Compound Growth</h4>
              <p className="text-muted-foreground">
                Use increased returns to fund more upgrades and accelerate your growth.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Balanced Portfolio</h4>
              <p className="text-muted-foreground">
                Maintain a mix of upgraded and new machines for optimal performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
