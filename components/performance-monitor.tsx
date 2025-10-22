"use client"

import { useEffect, useState } from "react"

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    renderTime: 0,
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const measureFrame = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        setMetrics((prev) => ({
          ...prev,
          fps: frameCount,
        }))
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(measureFrame)
    }

    const frameId = requestAnimationFrame(measureFrame)

    // Memory monitoring
    if (performance.memory) {
      const memoryInterval = setInterval(() => {
        setMetrics((prev) => ({
          ...prev,
          memory: Math.round((performance.memory.usedJSHeapSize / 1048576) * 100) / 100,
        }))
      }, 1000)

      return () => {
        cancelAnimationFrame(frameId)
        clearInterval(memoryInterval)
      }
    }

    return () => cancelAnimationFrame(frameId)
  }, [])

  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-4 left-4 glass rounded-lg p-3 text-xs text-muted-foreground space-y-1 z-40">
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memory}MB</div>
    </div>
  )
}
