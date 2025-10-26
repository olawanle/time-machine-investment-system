"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield, Lock, Award, Users, TrendingUp, DollarSign,
  Clock, CheckCircle, Star, Zap, Globe, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

// Live User Counter Component
export function LiveUserCounter() {
  const [userCount, setUserCount] = useState(2847)
  const [trend, setTrend] = useState<'up' | 'down'>('up')

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 10) - 3
      setUserCount(prev => {
        const newCount = Math.max(2800, prev + change)
        setTrend(change > 0 ? 'up' : 'down')
        return newCount
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-xl">
      <div className="relative">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-green-400" />
        <span className="text-sm font-semibold text-white">
          {userCount.toLocaleString()} users online now
        </span>
        {trend === 'up' ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : (
          <Activity className="w-3 h-3 text-yellow-400" />
        )}
      </div>
    </div>
  )
}

// Recent Transactions Ticker
export function TransactionTicker() {
  const [transactions, setTransactions] = useState([
    { id: 1, user: "john***", amount: 500, type: "investment", time: "2 sec ago" },
    { id: 2, user: "sara***", amount: 1200, type: "withdrawal", time: "5 sec ago" },
    { id: 3, user: "mike***", amount: 3500, type: "investment", time: "12 sec ago" },
    { id: 4, user: "emma***", amount: 800, type: "investment", time: "18 sec ago" },
    { id: 5, user: "alex***", amount: 2000, type: "withdrawal", time: "25 sec ago" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const names = ["james", "lisa", "david", "anna", "chris", "jenny", "tom", "mary"]
      const newTransaction = {
        id: Date.now(),
        user: `${names[Math.floor(Math.random() * names.length)]}***`,
        amount: Math.floor(Math.random() * 5000) + 100,
        type: Math.random() > 0.6 ? "investment" : "withdrawal",
        time: "just now"
      }

      setTransactions(prev => {
        const updated = [newTransaction, ...prev.slice(0, 4)]
        return updated.map((t, i) => ({
          ...t,
          time: i === 0 ? "just now" : `${(i + 1) * 5} sec ago`
        }))
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-purple-950/30 to-blue-950/30 border border-purple-500/20 rounded-xl">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-purple-500/20 bg-purple-500/10">
        <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
        <span className="text-sm font-semibold text-purple-300">Live Transactions</span>
      </div>
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="absolute w-full px-4 py-2 animate-slide-up"
              style={{
                top: `${index * 28}px`,
                animation: `slide-up 0.5s ease-out`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tx.type === 'investment' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-sm text-gray-300">{tx.user}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-semibold",
                    tx.type === 'investment' ? "text-green-400" : "text-yellow-400"
                  )}>
                    {tx.type === 'investment' ? '+' : '-'}${tx.amount}
                  </span>
                  <span className="text-xs text-gray-500">{tx.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Success Stories Carousel
export function SuccessStories() {
  const [currentStory, setCurrentStory] = useState(0)
  
  const stories = [
    {
      name: "Michael Chen",
      location: "Singapore",
      profit: "$12,450",
      period: "3 months",
      testimonial: "ChronosTime changed my life! I started with just $500 and now I'm earning consistent passive income.",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      location: "London, UK",
      profit: "$8,200",
      period: "2 months",
      testimonial: "The automated time machines are incredible. I don't have to do anything and the profits keep coming!",
      rating: 5
    },
    {
      name: "David Park",
      location: "Los Angeles",
      profit: "$25,800",
      period: "6 months",
      testimonial: "Best investment platform I've ever used. The returns are real and withdrawals are instant!",
      rating: 5
    },
    {
      name: "Emma Wilson",
      location: "Toronto",
      profit: "$6,750",
      period: "1 month",
      testimonial: "I was skeptical at first, but ChronosTime delivered beyond my expectations. Highly recommended!",
      rating: 5
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % stories.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [stories.length])

  return (
    <Card className="glass border-cyan-400/30 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Success Stories</h3>
          <div className="flex gap-1">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStory(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentStory === index 
                    ? "w-8 bg-cyan-400" 
                    : "bg-gray-600 hover:bg-gray-500"
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative h-48">
          {stories.map((story, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-all duration-500",
                currentStory === index 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-full"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{story.name}</p>
                    <p className="text-sm text-gray-400">{story.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{story.profit}</p>
                    <p className="text-xs text-gray-400">in {story.period}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {Array.from({ length: story.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                <p className="text-sm text-gray-300 italic">"{story.testimonial}"</p>
                
                <Badge className="inline-flex bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified User
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Security Badges
export function SecurityBadges() {
  const badges = [
    { icon: Lock, label: "256-bit SSL", color: "from-green-500 to-emerald-500" },
    { icon: Shield, label: "KYC Verified", color: "from-blue-500 to-cyan-500" },
    { icon: Award, label: "Licensed & Regulated", color: "from-purple-500 to-pink-500" },
    { icon: Globe, label: "Global Platform", color: "from-yellow-500 to-orange-500" }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div
            key={index}
            className="relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform",
                badge.color
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                {badge.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Countdown Timer for Special Offers
export function OfferCountdown({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const end = endTime.getTime()
      const difference = end - now

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
      <Zap className="w-4 h-4 text-red-400 animate-pulse" />
      <span className="text-sm font-medium text-white">Limited Offer Ends In:</span>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-red-400">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-gray-500">HRS</span>
        </div>
        <span className="text-red-400 font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-red-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-gray-500">MIN</span>
        </div>
        <span className="text-red-400 font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-red-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-gray-500">SEC</span>
        </div>
      </div>
    </div>
  )
}

// Investment Calculator
export function InvestmentCalculator() {
  const [investment, setInvestment] = useState(1000)
  const [months, setMonths] = useState(6)
  const [roi] = useState(15) // 15% monthly ROI
  
  const calculateReturns = () => {
    const monthlyReturn = investment * (roi / 100)
    const totalReturn = monthlyReturn * months
    const finalAmount = investment + totalReturn
    return {
      monthly: monthlyReturn,
      total: totalReturn,
      final: finalAmount
    }
  }

  const returns = calculateReturns()

  return (
    <Card className="glass border-cyan-400/30">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Investment Calculator</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Investment Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:outline-none"
                min="100"
                max="100000"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Investment Period</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="flex-1"
                min="1"
                max="12"
              />
              <span className="text-white font-semibold">{months} months</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Return</span>
              <span className="text-green-400 font-semibold">${returns.monthly.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Profit</span>
              <span className="text-yellow-400 font-semibold">${returns.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-white font-semibold">Final Amount</span>
              <span className="text-cyan-400 font-bold">${returns.final.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold">
            Start Investing Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}