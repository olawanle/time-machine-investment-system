"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage } from '@/lib/storage'
import { generateId } from '@/lib/utils'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create new user
      const newUser = {
        id: generateId(),
        username,
        email,
        balance: 0,
        claimedBalance: 0,
        machines: [],
        referralCode: generateId().substring(0, 8).toUpperCase(),
        referredBy: undefined,
        referrals: [],
        lastWithdrawalDate: 0,
        createdAt: Date.now(),
        tier: 'bronze' as const,
        totalInvested: 0,
        totalEarned: 0,
        roi: 0
      }

      // Save user
      await storage.saveUser(newUser, password)
      
      // Set current user
      localStorage.setItem('chronostime_current_user', newUser.id)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            Create Account
          </CardTitle>
          <p className="text-center text-slate-400 text-sm">
            Join ChronosTime Investment Platform
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-white"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-12"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/auth/login')}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
