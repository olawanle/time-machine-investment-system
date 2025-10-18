"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import { ChronosTimeLogo } from "./logo"
import { Lock, Mail, UserIcon, Share2 } from "lucide-react"

interface AuthFormProps {
  onAuthSuccess: (user: User) => void
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      if (isLogin) {
        if (email === "admin@chronostime.com" && password === "admin123") {
          const adminUser: User = {
            id: "admin-001",
            email: "admin@chronostime.com",
            username: "Administrator",
            balance: 0,
            claimedBalance: 0,
            machines: [],
            referralCode: "ADMIN",
            referrals: [],
            lastWithdrawalDate: 0,
            createdAt: Date.now(),
            tier: "platinum",
            totalInvested: 0,
            roi: 0,
          }
          storage.setCurrentUser(adminUser.id)
          onAuthSuccess(adminUser)
          setIsLoading(false)
          return
        }

        // Use verifyLogin to check email and password
        const user = await (storage as any).verifyLogin(email, password)
        if (!user) {
          setError("Invalid email or password")
          setIsLoading(false)
          return
        }
        storage.setCurrentUser(user.id)
        onAuthSuccess(user)
      } else {
        if (!email || !username || !password) {
          setError("All fields are required")
          setIsLoading(false)
          return
        }

        const users = await storage.getAllUsers()
        if (users.some((u) => u.email === email)) {
          setError("Email already registered")
          setIsLoading(false)
          return
        }

        const newUser: User = {
          id: generateId(),
          email,
          username,
          balance: 0,
          claimedBalance: 0,
          machines: [],
          referralCode: storage.generateReferralCode(),
          referrals: [],
          lastWithdrawalDate: 0,
          createdAt: Date.now(),
          tier: "bronze",
          totalInvested: 0,
          roi: 0,
        }

        if (referralCode) {
          const referrer = users.find((u) => u.referralCode === referralCode)
          if (referrer) {
            newUser.referredBy = referrer.id
            referrer.referrals.push(newUser.id)
            await storage.saveUser(referrer)
          }
        }

        // Save user with password
        await (storage as any).saveUser(newUser, password)
        storage.setCurrentUser(newUser.id)
        onAuthSuccess(newUser)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Auth error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-float" />
      </div>

      <Card className="w-full max-w-md glass relative z-10 animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ChronosTimeLogo />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold gradient-text">
              {isLogin ? "Welcome Back" : "Join ChronosTime"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isLogin ? "Access your investment portfolio" : "Start your time machine journey"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-sm pl-10"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-sm pl-10"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-sm pl-10"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Share2 className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <Input
                  type="text"
                  placeholder="Referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="glass-sm pl-10"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full btn-primary h-11 text-base font-semibold">
              {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="w-full text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
              Demo: admin@chronostime.com / admin123
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
