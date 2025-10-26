"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type User } from "@/lib/storage"
import { authService } from "@/lib/auth-service"
import { ChronosTimeLogo } from "./logo"
import { Lock, Mail, UserIcon, Share2, ArrowLeft, Eye, EyeOff } from "lucide-react"

interface AuthFormProps {
  onAuthSuccess: (user: User) => void
  onBackToLanding?: () => void
}

export function AuthForm({ onAuthSuccess, onBackToLanding }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Extract referral code from URL on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get('ref')
      if (refCode) {
        setReferralCode(refCode)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login with secure API
        const result = await authService.login(email, password)
        
        if (!result.success || !result.user) {
          setError(result.error || "Invalid email or password")
          setIsLoading(false)
          return
        }

        onAuthSuccess(result.user)
      } else {
        // Signup with secure API
        if (!email || !username || !password) {
          setError("All fields are required")
          setIsLoading(false)
          return
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters")
          setIsLoading(false)
          return
        }

        const result = await authService.signup(email, password, username, referralCode)
        
        if (!result.success || !result.user) {
          setError(result.error || "Registration failed")
          setIsLoading(false)
          return
        }

        // After successful signup, login
        const loginResult = await authService.login(email, password)
        
        if (!loginResult.success || !loginResult.user) {
          setError("Account created! Please log in.")
          setIsLogin(true)
          setIsLoading(false)
          return
        }

        onAuthSuccess(loginResult.user)
      }
      setIsLoading(false)
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#3CE7FF]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#EFBF60]/5 rounded-full blur-3xl animate-float" />
      </div>

      <Card className="w-full max-w-md glass relative z-10 animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ChronosTimeLogo />
          </div>
          {onBackToLanding && (
            <Button 
              variant="ghost" 
              onClick={onBackToLanding}
              className="text-cyan-400 hover:text-cyan-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
          <div>
            <CardTitle className="text-3xl font-bold gradient-text">
              {isLogin ? "Welcome Back" : "Join ChronosTime"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isLogin ? "Access your investment portfolio" : "Start your professional trading journey"}
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
                required
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
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-sm pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-cyan-400/50 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
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


        </CardContent>
      </Card>
    </div>
  )
}