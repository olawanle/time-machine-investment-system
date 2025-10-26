"use client"

import { useEffect, useState, useRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

// Parallax Scrolling Component
export function ParallaxSection({ 
  children, 
  speed = 0.5,
  className 
}: { 
  children: ReactNode
  speed?: number
  className?: string 
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const scrolled = window.scrollY
        const rate = scrolled * -speed
        setOffset(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div 
        style={{ 
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// 3D Flip Card Component
export function Card3D({ 
  front, 
  back,
  className 
}: { 
  front: ReactNode
  back: ReactNode
  className?: string 
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className={cn("flip-card", className)}>
      <div 
        className={cn(
          "flip-card-inner",
          isFlipped && "flipped"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flip-card-front">
          {front}
        </div>
        <div className="flip-card-back">
          {back}
        </div>
      </div>
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
          width: 100%;
          height: 100%;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.8s;
          transform-style: preserve-3d;
          cursor: pointer;
        }
        
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}

// Particle Background Component
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      type: 'money' | 'clock'
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        type: Math.random() > 0.5 ? 'money' : 'clock'
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((particle) => {
        // Draw particle based on type
        ctx.save()
        ctx.globalAlpha = particle.opacity
        
        if (particle.type === 'money') {
          ctx.fillStyle = '#EFBF60'
          ctx.font = `${particle.size * 10}px Arial`
          ctx.fillText('$', particle.x, particle.y)
        } else {
          ctx.fillStyle = '#3CE7FF'
          ctx.font = `${particle.size * 10}px Arial`
          ctx.fillText('⏱', particle.x, particle.y)
        }
        
        ctx.restore()
        
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })
      
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  )
}

// Fade In On Scroll Component
export function FadeInOnScroll({ 
  children,
  className,
  delay = 0 
}: { 
  children: ReactNode
  className?: string
  delay?: number 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
    >
      {children}
    </div>
  )
}

// Glow Hover Effect Component
export function GlowHover({ 
  children,
  className,
  glowColor = "cyan"
}: { 
  children: ReactNode
  className?: string
  glowColor?: string 
}) {
  return (
    <div className={cn(
      "relative group cursor-pointer",
      className
    )}>
      <div className={cn(
        "absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm",
        `bg-gradient-to-r from-${glowColor}-500 to-${glowColor}-600`
      )} />
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// Loading Skeleton Component
export function LoadingSkeleton({ 
  className,
  lines = 3 
}: { 
  className?: string
  lines?: number 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg animate-shimmer"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

// Confetti Component
export function Confetti({ 
  trigger,
  onComplete 
}: { 
  trigger: boolean
  onComplete?: () => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!trigger) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      w: number
      h: number
      vx: number
      vy: number
      color: string
      angle: number
      angleSpeed: number
    }> = []

    const colors = ['#3CE7FF', '#6C63FF', '#EFBF60', '#22c55e', '#ef4444']

    // Create confetti particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        w: Math.random() * 10 + 5,
        h: Math.random() * 5 + 3,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 5 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        angleSpeed: Math.random() * 0.2 - 0.1
      })
    }

    let animationFrame: number

    function animate() {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, index) => {
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1 // gravity
        p.angle += p.angleSpeed
        
        if (p.y > canvas.height) {
          particles.splice(index, 1)
        }
      })
      
      if (particles.length > 0) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animate()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [trigger, onComplete])

  if (!trigger) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}