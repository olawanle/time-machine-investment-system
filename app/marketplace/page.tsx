"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketplacePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard with marketplace section
    router.push('/dashboard?section=marketplace')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">Redirecting to marketplace...</p>
      </div>
    </div>
  )
}
