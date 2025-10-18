"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

interface AnimatedStatCardProps {
  title: string
  value: ReactNode
  description?: string
  icon?: ReactNode
  gradient?: string
  glow?: string
}

export function AnimatedStatCard({
  title,
  value,
  description,
  icon,
  gradient = "from-cyan-500 to-blue-500",
  glow = "glow-cyan",
}: AnimatedStatCardProps) {
  return (
    <Card className={`glass ${glow} card-hover group`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-semibold">{title}</CardDescription>
          {icon && <div className="text-cyan-400 group-hover:scale-110 transition-transform">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  )
}
