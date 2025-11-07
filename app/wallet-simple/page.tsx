"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/storage'
import { BalanceTopup } from '@/components/balance-topup'
import { ManualBalanceUpdate } from '@/components/manual-balance-update'

export default function WalletSimplePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await storage.getCurrentUser()
        if (!currentUser) {
          router.push('/')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser)
    storage.saveUser(updatedUser)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet - Simple Version (Testing)</h1>
        <BalanceTopup user={user} onUserUpdate={handleUserUpdate} />
        <div className="mt-8">
          <ManualBalanceUpdate user={user} onUserUpdate={handleUserUpdate} />
        </div>
      </div>
    </div>
  )
}