"use client"

import { useEffect, useRef } from "react"

export function TimeMachine3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let animationId: number
    let rotation = 0

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(10, 14, 23, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)

      // Draw outer ring
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, 80, 0, Math.PI * 2)
      ctx.stroke()

      // Draw inner ring
      ctx.strokeStyle = "rgba(0, 217, 255, 0.3)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, 60, 0, Math.PI * 2)
      ctx.stroke()

      // Draw rotating segments
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const x1 = Math.cos(angle) * 60
        const y1 = Math.sin(angle) * 60
        const x2 = Math.cos(angle) * 80
        const y2 = Math.sin(angle) * 80

        ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 + Math.sin(rotation + i) * 0.3})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Draw center glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30)
      gradient.addColorStop(0, "rgba(0, 217, 255, 0.8)")
      gradient.addColorStop(1, "rgba(0, 217, 255, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, 30, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      rotation += 0.02

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl"
      style={{ background: "radial-gradient(circle, rgba(0,217,255,0.05) 0%, transparent 70%)" }}
    />
  )
}
