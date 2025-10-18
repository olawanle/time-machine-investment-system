"use client"
import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "./navigation"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Zap } from "lucide-react"

interface MarketplaceProps {
  user: User
  onNavigate: (view: string) => void
  onLogout: () => void
}

const machines = [
  {
    id: 1,
    name: "Quantum Leap",
    cost: 500,
    bonus: "+15%",
    duration: "30 Days",
    rarity: "NEW",
    image: "/quantum-leap-time-machine.jpg",
  },
  {
    id: 2,
    name: "Temporal Shift Unit",
    cost: 800,
    bonus: "+20%",
    duration: "45 Days",
    rarity: "LEGENDARY",
    image: "/temporal-shift-unit.jpg",
  },
  {
    id: 3,
    name: "Nova Jumper",
    cost: 1200,
    bonus: "+25%",
    duration: "60 Days",
    rarity: "POPULAR",
    image: "/nova-jumper-time-machine.jpg",
  },
]

export function Marketplace({ user, onNavigate, onLogout }: MarketplaceProps) {
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
                  src={machine.image || "/placeholder.svg"}
                  alt={machine.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-cyan-500 text-white hover:bg-cyan-600">
                  {machine.rarity}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="gradient-text">{machine.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="glass-sm p-3 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">Cost</p>
                    <p className="font-semibold text-cyan-400 mt-1">${machine.cost}</p>
                  </div>
                  <div className="glass-sm p-3 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">Bonus</p>
                    <p className="font-semibold text-green-400 mt-1">{machine.bonus}</p>
                  </div>
                  <div className="glass-sm p-3 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-semibold text-blue-400 mt-1">{machine.duration}</p>
                  </div>
                </div>
                <Button className="w-full btn-primary">View Details</Button>
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
    </div>
  )
}
