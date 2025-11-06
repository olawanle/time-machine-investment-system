"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/storage'
import { TimeMachineMarketplace } from '@/components/time-machine-marketplace'

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await storage.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser)
    // Also save to storage
    storage.saveUser(updatedUser)
  }

  const handlePurchase = (machineId: number, quantity: number) => {
    // This will be handled by the TimeMachineMarketplace component
    console.log('Purchase:', machineId, quantity)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <TimeMachineMarketplace 
        user={user} 
        onUserUpdate={handleUserUpdate}
        onPurchase={handlePurchase}
      />
    </div>
  )
}