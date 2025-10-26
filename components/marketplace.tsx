"use client"
import { useState } from "react"
import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "./navigation"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Zap, X, Star, DollarSign, Clock } from "lucide-react"
import { useTheme } from "next-themes"

interface MarketplaceProps {
  user: User
  onNavigate: (view: string) => void
  onLogout: () => void
}

const machines = [
  {
    id: 1,
    name: "Time Machine Level 1",
    cost: 100,
    weeklyReturn: 20,
    returnRate: "20%",
    duration: "Weekly Returns",
    rarity: "BASIC",
    image: "/time 1.png",
    darkImage: "/time black 1.png",
    paymentWidgetId: "5858741736",
    description: "Entry-level time machine perfect for beginners. Earn $20 weekly returns.",
    features: ["Basic time manipulation", "Weekly payouts", "Low maintenance"]
  },
  {
    id: 2,
    name: "Time Machine Level 2",
    cost: 250,
    weeklyReturn: 50,
    returnRate: "20%",
    duration: "Weekly Returns",
    rarity: "IMPROVED",
    image: "/time 2.png",
    darkImage: "/time black 2.png",
    paymentWidgetId: "4978857735",
    description: "Enhanced time machine with better efficiency. Earn $50 weekly returns.",
    features: ["Improved efficiency", "Faster processing", "Better ROI"]
  },
  {
    id: 3,
    name: "Time Machine Level 3",
    cost: 500,
    weeklyReturn: 100,
    returnRate: "20%",
    duration: "Weekly Returns",
    rarity: "ADVANCED",
    image: "/time 3.png",
    darkImage: "/time black 3.png",
    paymentWidgetId: "5075645750",
    description: "Professional-grade time machine. Earn $100 weekly returns.",
    features: ["Professional grade", "Advanced algorithms", "Premium support"]
  },
  {
    id: 4,
    name: "Time Machine Level 4",
    cost: 750,
    weeklyReturn: 150,
    returnRate: "20%",
    duration: "Weekly Returns",
    rarity: "ELITE",
    image: "/time 4.png",
    darkImage: "/time black 4.png",
    paymentWidgetId: "5075645751",
    description: "Elite time machine with maximum efficiency. Earn $150 weekly returns.",
    features: ["Elite performance", "Maximum efficiency", "Priority support"]
  },
  {
    id: 5,
    name: "Time Machine Level 5",
    cost: 1000,
    weeklyReturn: 200,
    returnRate: "20%",
    duration: "Weekly Returns",
    rarity: "LEGENDARY",
    image: "/time 5.png",
    darkImage: "/time black 5.png",
    paymentWidgetId: "5075645752",
    description: "Legendary time machine with ultimate power. Earn $200 weekly returns.",
    features: ["Legendary status", "Ultimate power", "VIP support"]
  },
]

export function Marketplace({ user, onNavigate, onLogout }: MarketplaceProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<typeof machines[0] | null>(null)
  const { theme } = useTheme()

  const handleViewDetails = (machine: typeof machines[0]) => {
    setSelectedMachine(machine)
    if (machine.paymentWidgetId) {
      setShowPaymentModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navigation
        user={user}
        currentView="marketplace"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onAdmin={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="glass glow-cyan rounded-3xl overflow-hidden mb-12 h-80 flex items-center justify-center bg-gradient-to-r from-cyan-500/20 to-blue-500/20 relative border border-cyan-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5" />
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingBag className="w-8 h-8 text-cyan-400" />
              <h1 className="text-5xl font-bold gradient-text">Limited Edition Machines</h1>
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-muted-foreground text-lg">Unlock unprecedented bonuses and faster earnings!</p>
          </div>
        </div>

        <div className="flex gap-3 mb-12 flex-wrap">
          <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20">
            Sort By: Cost
          </Button>
          <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20">
            Bonus Potential
          </Button>
          <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20">
            Rarity
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {machines.map((machine) => (
            <Card
              key={machine.id}
              className="glass glow-cyan overflow-hidden hover:border-cyan-400/50 transition-all duration-300 group"
            >
              <div className="h-56 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center relative overflow-hidden">
                <img
                  src={theme === 'dark' ? machine.darkImage : machine.image}
                  alt={machine.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 p-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <Badge className={`absolute top-4 right-4 ${
                  machine.rarity === 'LEGENDARY' ? 'bg-purple-500 text-white hover:bg-purple-600' :
                  machine.rarity === 'ELITE' ? 'bg-yellow-500 text-black hover:bg-yellow-600' :
                  machine.rarity === 'ADVANCED' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                  machine.rarity === 'IMPROVED' ? 'bg-green-500 text-white hover:bg-green-600' :
                  'bg-gray-500 text-white hover:bg-gray-600'
                }`}>
                  {machine.rarity}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="gradient-text flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {machine.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{machine.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="glass-sm p-3 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">Cost</p>
                    <p className="font-semibold text-cyan-400 mt-1 flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${machine.cost}
                    </p>
                  </div>
                  <div className="glass-sm p-3 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">Weekly Return</p>
                    <p className="font-semibold text-green-400 mt-1 flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${machine.weeklyReturn}
                    </p>
                  </div>
                </div>
                <div className="glass-sm p-3 rounded-lg text-center">
                  <p className="text-muted-foreground text-xs">Return Rate</p>
                  <p className="font-semibold text-blue-400 mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    {machine.returnRate} Weekly
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {machine.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => handleViewDetails(machine)}
                  className="w-full btn-primary"
                >
                  {machine.paymentWidgetId ? "Purchase Now" : "View Details"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <Button className="btn-primary">1</Button>
          <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20">2</Button>
          <Button className="glass glow-cyan border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20">3</Button>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-400/30">
              <div>
                <h3 className="text-2xl font-bold gradient-text">{selectedMachine.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Complete your purchase</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Payment Details */}
            <div className="p-6 space-y-4">
              <div className="glass-sm p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Machine Cost:</span>
                  <span className="font-semibold text-cyan-400">${selectedMachine.cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Return:</span>
                  <span className="font-semibold text-green-400">${selectedMachine.weeklyReturn}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Return Rate:</span>
                  <span className="font-semibold text-blue-400">{selectedMachine.returnRate}</span>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4">
                <p className="text-muted-foreground">
                  To purchase this time machine, please top up your balance first using cryptocurrency.
                </p>
                <a
                  href="https://checkouts.cpay.world/checkout/acb26bab-0d68-4ffa-b9f9-5ad577762fc7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                    Top Up Balance with Crypto
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground">
                  After topping up, you can purchase this time machine directly with your balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
