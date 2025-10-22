"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, TrendingUp, Lock, Gauge, Sparkles } from "lucide-react"

export function PremiumFeatures() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time updates and instant claim processing",
      badge: "Performance",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Enterprise-grade security with encrypted transactions",
      badge: "Security",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Detailed insights into your investment performance",
      badge: "Analytics",
    },
    {
      icon: Lock,
      title: "Withdrawal Protection",
      description: "12-day cycle ensures sustainable growth",
      badge: "Protection",
    },
    {
      icon: Gauge,
      title: "Optimized Returns",
      description: "Maximize earnings with intelligent machine allocation",
      badge: "Optimization",
    },
    {
      icon: Sparkles,
      title: "Premium Support",
      description: "24/7 dedicated support for all investors",
      badge: "Support",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, idx) => {
        const Icon = feature.icon
        return (
          <Card key={idx} className="glass glow-cyan card-hover group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Icon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
