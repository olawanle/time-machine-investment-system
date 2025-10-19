"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles, TrendingUp } from "lucide-react"
import { fireConfetti } from "@/lib/confetti"
import { formatCurrency } from "@/lib/utils"

interface DailySpinWheelProps {
  userId: string
  lastSpinDate: number
  onSpin: (reward: number) => void
}

const rewards = [10, 25, 50, 100, 5, 15, 20, 75]
const colors = [
  "from-cyan-500 to-blue-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-purple-500 to-pink-500",
  "from-red-500 to-rose-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-yellow-500",
]

export function DailySpinWheel({ userId, lastSpinDate, onSpin }: DailySpinWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [canSpin, setCanSpin] = useState(false)
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState("")
  const [wonAmount, setWonAmount] = useState<number | null>(null)

  useEffect(() => {
    const checkSpinAvailability = () => {
      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const timeSinceLastSpin = now - lastSpinDate

      if (timeSinceLastSpin >= oneDayMs || lastSpinDate === 0) {
        setCanSpin(true)
        setTimeUntilNextSpin("")
      } else {
        setCanSpin(false)
        const timeLeft = oneDayMs - timeSinceLastSpin
        const hours = Math.floor(timeLeft / (60 * 60 * 1000))
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
        setTimeUntilNextSpin(`${hours}h ${minutes}m`)
      }
    }

    checkSpinAvailability()
    const interval = setInterval(checkSpinAvailability, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lastSpinDate])

  const handleSpin = () => {
    if (!canSpin || spinning) return

    setSpinning(true)
    setWonAmount(null)

    // Random reward index
    const randomIndex = Math.floor(Math.random() * rewards.length)
    const reward = rewards[randomIndex]

    // Calculate rotation (multiple full spins + landing position)
    const segmentAngle = 360 / rewards.length
    const targetRotation = 360 * 5 + (360 - randomIndex * segmentAngle) // 5 full spins + target
    setRotation(rotation + targetRotation)

    // Wait for animation to complete
    setTimeout(() => {
      setSpinning(false)
      setWonAmount(reward)
      onSpin(reward)
      fireConfetti()
    }, 4000)
  }

  return (
    <Card className="glass glow-cyan overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-cyan-400" />
          Daily Spin Wheel
          {canSpin && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wheel */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Wheel Container */}
          <div
            className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            {rewards.map((reward, index) => {
              const segmentAngle = 360 / rewards.length
              const rotation = index * segmentAngle

              return (
                <div
                  key={index}
                  className={`absolute w-1/2 h-1/2 origin-bottom-right`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    clipPath: 'polygon(100% 100%, 0 100%, 50% 0)',
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${colors[index]} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg transform -rotate-45 translate-y-6">
                      ${reward}
                    </span>
                  </div>
                </div>
              )
            })}
            {/* Center circle */}
            <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg"></div>
          </div>
        </div>

        {/* Result */}
        {wonAmount !== null && (
          <div className="text-center animate-bounce">
            <p className="text-2xl font-bold gradient-text">
              You Won {formatCurrency(wonAmount)}! 🎉
            </p>
          </div>
        )}

        {/* Spin Button */}
        <div className="text-center space-y-3">
          <Button
            onClick={handleSpin}
            disabled={!canSpin || spinning}
            className="w-full btn-primary relative overflow-hidden"
          >
            {spinning ? (
              "Spinning..."
            ) : canSpin ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Spin Now!
              </>
            ) : (
              `Next spin in ${timeUntilNextSpin}`
            )}
          </Button>

          {!canSpin && (
            <p className="text-xs text-muted-foreground">
              Come back tomorrow for another spin!
            </p>
          )}
        </div>

        {/* Info */}
        <div className="glass-sm p-3 rounded-lg text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            Spin once per day for free rewards!
          </p>
          <p>• Rewards range from $5 to $100</p>
          <p>• Build your spin streak for bonus multipliers</p>
        </div>
      </CardContent>
    </Card>
  )
}

