"use client"

import { useEffect, useState } from 'react'

interface DatabaseInitializerProps {
  children: React.ReactNode
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeDatabase()
  }, [])

  const initializeDatabase = async () => {
    try {
      console.log('🔧 Initializing database...')
      
      const response = await fetch('/api/setup/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Database initialized:', result.message)
      } else {
        console.log('⚠️ Database setup failed, but continuing...')
      }
    } catch (error) {
      console.log('⚠️ Database initialization error, but continuing...', error)
    } finally {
      setInitialized(true)
    }
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">ChronosTime</h2>
            <p className="text-muted-foreground">Setting up your experience...</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}