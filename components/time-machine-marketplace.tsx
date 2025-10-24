"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Star,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Wallet
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface TimeMachine {
  id: number
  name: string
  description: string
  price: number
  weeklyReturn: number
  image: string
  darkImage: string
  features: string[]
  tier: "basic" | "premium" | "elite" | "legendary" | "mythic"
  color: string
  darkColor: string
  roi: number // Return on investment percentage
}

interface TimeMachineMarketplaceProps {
  user: any
  onPurchase: (machineId: number, quantity: number) => void
  onUserUpdate: (user: any) => void
}

const timeMachines: TimeMachine[] = [
  {
    id: 1,
    name: "Chrono Basic",
    description: "Your first step into time manipulation. Simple yet effective.",
    price: 100,
    weeklyReturn: 20,
    image: "/time 1.png",
    darkImage: "/time black 1.png",
    features: ["Basic time control", "20% weekly returns", "Reliable performance"],
    tier: "basic",
    color: "from-blue-500 to-cyan-500",
    darkColor: "from-blue-600 to-cyan-600",
    roi: 20
  },
  {
    id: 2,
    name: "Chrono Advanced",
    description: "Enhanced temporal capabilities with improved efficiency.",
    price: 250,
    weeklyReturn: 50,
    image: "/time 2.png",
    darkImage: "/time black 2.png",
    features: ["Advanced algorithms", "20% weekly returns", "Faster processing"],
    tier: "premium",
    color: "from-purple-500 to-pink-500",
    darkColor: "from-purple-600 to-pink-600",
    roi: 20
  },
  {
    id: 3,
    name: "Chrono Elite",
    description: "Professional-grade time machine with superior performance.",
    price: 500,
    weeklyReturn: 100,
    image: "/time 3.png",
    darkImage: "/time black 3.png",
    features: ["Elite performance", "20% weekly returns", "Advanced analytics"],
    tier: "elite",
    color: "from-orange-500 to-red-500",
    darkColor: "from-orange-600 to-red-600",
    roi: 20
  },
  {
    id: 4,
    name: "Chrono Legendary",
    description: "Legendary status time machine with exceptional capabilities.",
    price: 750,
    weeklyReturn: 150,
    image: "/time 4.png",
    darkImage: "/time black 4.png",
    features: ["Legendary status", "20% weekly returns", "Premium support"],
    tier: "legendary",
    color: "from-yellow-500 to-orange-500",
    darkColor: "from-yellow-600 to-orange-600",
    roi: 20
  },
  {
    id: 5,
    name: "Chrono Mythic",
    description: "The ultimate time machine with mythical powers.",
    price: 1000,
    weeklyReturn: 200,
    image: "/time 5.png",
    darkImage: "/time black 5.png",
    features: ["Mythic powers", "20% weekly returns", "Exclusive benefits"],
    tier: "mythic",
    color: "from-indigo-500 to-purple-500",
    darkColor: "from-indigo-600 to-purple-600",
    roi: 20
  }
]

export function TimeMachineMarketplace({ user, onPurchase, onUserUpdate }: TimeMachineMarketplaceProps) {
  const [selectedMachine, setSelectedMachine] = useState<TimeMachine | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseError, setPurchaseError] = useState("")
  const [purchaseSuccess, setPurchaseSuccess] = useState("")
  const { theme } = useTheme()

  const userMachines = user.machines || []
  const userBalance = user.balance || 0

  const handlePurchase = async (machine: TimeMachine) => {
    setPurchaseError("")
    setPurchaseSuccess("")

    const totalCost = machine.price * quantity
    if (userBalance < totalCost) {
      setPurchaseError("Insufficient balance. Please top up your account first.")
      return
    }

    if (userMachines.length + quantity > 10) {
      setPurchaseError("Maximum 10 machines allowed per user.")
      return
    }

    try {
      // Create new machines with proper structure
      const newMachines = Array(quantity).fill(null).map((_, index) => ({
        id: `${machine.id}-${Date.now()}-${index}`,
        level: machine.id,
        name: machine.name,
        description: machine.description,
        price: machine.price,
        weeklyReturn: machine.weeklyReturn,
        unlockedAt: Date.now(),
        lastClaimedAt: 0,
        isActive: true,
        rewardAmount: machine.weeklyReturn,
        claimIntervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
        icon: "⏰",
        investmentAmount: machine.price,
        maxEarnings: machine.price * 2, // 200% ROI cap
        currentEarnings: 0,
        roiPercentage: 20
      }))

      const updatedUser = {
        ...user,
        balance: userBalance - totalCost,
        machines: [...userMachines, ...newMachines],
        totalInvested: (user.totalInvested || 0) + totalCost
      }

      onUserUpdate(updatedUser)
      setPurchaseSuccess(`Successfully purchased ${quantity} ${machine.name} machine(s)!`)
      setShowPurchaseModal(false)
      setSelectedMachine(null)
      setQuantity(1)
    } catch (error) {
      setPurchaseError("Purchase failed. Please try again.")
    }
  }

  const getTierColor = (tier: string) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      premium: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      elite: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      legendary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      mythic: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    }
    return colors[tier as keyof typeof colors] || colors.basic
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Time Machine Marketplace
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose your time machines and start earning passive income. Each machine generates weekly returns based on your investment.
        </p>
        
        {/* User Stats */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span>Balance: ${userBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Machines: {userMachines.length}/10</span>
          </div>
        </div>
      </div>

      {/* Time Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timeMachines.map((machine) => {
          const isDarkMode = theme === 'dark'
          const imageSrc = isDarkMode ? machine.darkImage : machine.image
          
          return (
            <Card 
              key={machine.id} 
              className="group hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="text-center space-y-4">
                <div className="relative mx-auto w-24 h-24">
                  <Image
                    src={imageSrc}
                    alt={machine.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{machine.name}</h3>
                    <Badge className={getTierColor(machine.tier)}>
                      {machine.tier.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {machine.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    ${machine.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${machine.weeklyReturn}/week return
                  </div>
                  <div className="text-xs text-success">
                    {machine.roi}% weekly ROI
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Features:</h4>
                  <ul className="space-y-1">
                    {machine.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => {
                    setSelectedMachine(machine)
                    setShowPurchaseModal(true)
                  }}
                  className={`w-full bg-gradient-to-r ${isDarkMode ? machine.darkColor : machine.color} hover:opacity-90 text-white font-semibold`}
                  disabled={userBalance < machine.price}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {userBalance < machine.price ? "Insufficient Balance" : "Purchase Machine"}
                </Button>

                {userBalance < machine.price && (
                  <p className="text-xs text-destructive text-center">
                    Need ${(machine.price - userBalance).toFixed(2)} more
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Purchase {selectedMachine.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  ${selectedMachine.price.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${selectedMachine.weeklyReturn}/week return
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Quantity:
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-background border-border"
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Cost:</span>
                  <span className="font-semibold">
                    ${(selectedMachine.price * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weekly Returns:</span>
                  <span className="font-semibold text-success">
                    ${(selectedMachine.weeklyReturn * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {purchaseError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {purchaseError}
                </div>
              )}

              {purchaseSuccess && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {purchaseSuccess}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPurchaseModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePurchase(selectedMachine)}
                  className={`flex-1 bg-gradient-to-r ${theme === 'dark' ? selectedMachine.darkColor : selectedMachine.color} text-white`}
                  disabled={userBalance < selectedMachine.price * quantity}
                >
                  Confirm Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investment Tips */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investment Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Diversification</h4>
              <p className="text-muted-foreground">
                Spread your investments across different machine tiers for better risk management.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Compound Growth</h4>
              <p className="text-muted-foreground">
                Reinvest your weekly returns to purchase more machines and accelerate growth.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Referral Bonuses</h4>
              <p className="text-muted-foreground">
                Invite friends to earn bonus rewards and unlock special features.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Long-term Strategy</h4>
              <p className="text-muted-foreground">
                Higher-tier machines offer better returns but require larger initial investments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
