"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/storage'
import { Referrals } from '@/components/referrals'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function ReferralsPage() {
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
    storage.saveUser(updatedUser)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3CE7FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading referrals...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} onLogout={() => router.push('/')}>
      <div className="p-6">
        <Referrals user={user} />
      </div>
    </DashboardLayout>
  )
}