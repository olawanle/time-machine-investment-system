"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy, Target, Star, Zap, Gift, TrendingUp,
  Share2, Facebook, Twitter, MessageCircle, Link2,
  CheckCircle, Award, Medal, Crown, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// Progress Bar with Goal Tracking
export function InvestmentProgress({ 
  current, 
  goal,
  label 
}: { 
  current: number
  goal: number
  label: string 
}) {
  const percentage = Math.min((current / goal) * 100, 100)
  const [displayPercentage, setDisplayPercentage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-cyan-400">
          ${current.toLocaleString()} / ${goal.toLocaleString()}
        </span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${displayPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
        {percentage >= 100 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-white animate-bounce-in" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{displayPercentage.toFixed(1)}% Complete</span>
        {percentage >= 100 && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            Goal Achieved! 🎉
          </Badge>
        )}
      </div>
    </div>
  )
}

// Achievement System
export function AchievementToast({ 
  achievement 
}: { 
  achievement: {
    id: string
    title: string
    description: string
    icon: typeof Trophy
    color: string
    points: number
  } 
}) {
  const [show, setShow] = useState(true)
  const Icon = achievement.icon

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className={cn(
      "fixed top-20 right-4 z-50 animate-slide-in",
      !show && "animate-slide-out"
    )}>
      <Card className="glass border-yellow-500/50 shadow-2xl shadow-yellow-500/20 min-w-[320px]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
              achievement.color
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white">Achievement Unlocked!</h4>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-yellow-400 mt-1">{achievement.title}</p>
              <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  +{achievement.points} XP
                </Badge>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Interactive Tutorial Tooltip
export function TutorialTooltip({ 
  step,
  totalSteps,
  title,
  description,
  targetElement,
  onNext,
  onSkip 
}: { 
  step: number
  totalSteps: number
  title: string
  description: string
  targetElement?: string
  onNext: () => void
  onSkip: () => void
}) {
  const [position, setPosition] = useState({ top: 100, left: 100 })

  useEffect(() => {
    if (targetElement) {
      const element = document.querySelector(targetElement)
      if (element) {
        const rect = element.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 10,
          left: rect.left
        })
        
        // Add highlight to target element
        element.classList.add('tutorial-highlight')
        
        return () => {
          element.classList.remove('tutorial-highlight')
        }
      }
    }
  }, [targetElement])

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onSkip} />
      <Card 
        className="fixed z-50 glass border-cyan-400/50 shadow-2xl shadow-cyan-500/30 max-w-sm animate-bounce-in"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              Step {step} of {totalSteps}
            </Badge>
            <button onClick={onSkip} className="text-gray-400 hover:text-white text-sm">
              Skip
            </button>
          </div>
          <h3 className="font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-300 mb-4">{description}</p>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onNext}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {step === totalSteps ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          outline: 2px solid #3CE7FF;
          outline-offset: 4px;
          animation: pulse-outline 2s infinite;
        }
        
        @keyframes pulse-outline {
          0%, 100% {
            outline-color: #3CE7FF;
            outline-offset: 4px;
          }
          50% {
            outline-color: #6C63FF;
            outline-offset: 8px;
          }
        }
      `}</style>
    </>
  )
}

// Investment Simulator Game
export function InvestmentSimulator() {
  const [balance, setBalance] = useState(1000)
  const [investments, setInvestments] = useState<Array<{
    id: string
    amount: number
    multiplier: number
    timeLeft: number
  }>>([])
  const [score, setScore] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setInvestments(prev => prev.map(inv => {
        if (inv.timeLeft > 0) {
          return { ...inv, timeLeft: inv.timeLeft - 1 }
        } else {
          // Investment matured
          const profit = inv.amount * inv.multiplier
          setBalance(b => b + profit)
          setScore(s => s + Math.floor(profit))
          return { ...inv, timeLeft: -1 }
        }
      }).filter(inv => inv.timeLeft !== -1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const makeInvestment = (amount: number, risk: 'low' | 'medium' | 'high') => {
    if (amount > balance) return

    const multipliers = { low: 1.2, medium: 1.5, high: 2.0 }
    const times = { low: 10, medium: 20, high: 30 }

    setBalance(prev => prev - amount)
    setInvestments(prev => [...prev, {
      id: Date.now().toString(),
      amount,
      multiplier: multipliers[risk],
      timeLeft: times[risk]
    }])
  }

  return (
    <Card className="glass border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Investment Simulator</h3>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
            Score: {score}
          </Badge>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-400 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => makeInvestment(100, 'low')}
            disabled={balance < 100}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50"
          >
            <div className="text-center">
              <p className="text-xs">Low Risk</p>
              <p className="font-bold">$100</p>
              <p className="text-xs">+20%</p>
            </div>
          </Button>
          <Button
            onClick={() => makeInvestment(250, 'medium')}
            disabled={balance < 250}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50"
          >
            <div className="text-center">
              <p className="text-xs">Med Risk</p>
              <p className="font-bold">$250</p>
              <p className="text-xs">+50%</p>
            </div>
          </Button>
          <Button
            onClick={() => makeInvestment(500, 'high')}
            disabled={balance < 500}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
          >
            <div className="text-center">
              <p className="text-xs">High Risk</p>
              <p className="font-bold">$500</p>
              <p className="text-xs">+100%</p>
            </div>
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">Active Investments</p>
          {investments.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <span className="text-sm text-white">${inv.amount}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">x{inv.multiplier}</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  {inv.timeLeft}s
                </Badge>
              </div>
            </div>
          ))}
          {investments.length === 0 && (
            <p className="text-center text-gray-500 py-4">No active investments</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Social Sharing Component
export function SocialShare({ 
  referralCode,
  message 
}: { 
  referralCode: string
  message: string 
}) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `https://chronostime.com/ref/${referralCode}`
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="glass border-cyan-400/30">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Share & Earn</h3>
        
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-1">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <input
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-white outline-none"
            />
            <Button
              size="sm"
              onClick={copyToClipboard}
              className={cn(
                "transition-all",
                copied ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
              )}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
          >
            <Facebook className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-400">Facebook</span>
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 transition-colors"
          >
            <Twitter className="w-5 h-5 text-sky-400" />
            <span className="text-xs text-sky-400">Twitter</span>
          </a>
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">WhatsApp</span>
          </a>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Referral Bonus</span>
            </div>
            <span className="text-sm font-bold text-purple-400">$50 per friend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}