"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type User } from "@/lib/storage"
import { authService } from "@/lib/auth-service"
import { ChronosTimeLogo } from "./logo"
import { 
  Lock, 
  Mail, 
  UserIcon, 
  Share2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Key
} from "lucide-react"

interface EnhancedAuthFormProps {
  onAuthSuccess: (user: User) => void
  onBackToLanding?: () => void
}

export function EnhancedAuthForm({ onAuthSuccess, onBackToLanding }: EnhancedAuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [deviceTrusted, setDeviceTrusted] = useState(false)

  // Check if device is trusted
  useEffect(() => {
    const trustedDevice = localStorage.getItem('trusted_device_token')
    setDeviceTrusted(!!trustedDevice)
  }, [])

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

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return { text: "Very Weak", color: "text-red-500" }
      case 2: return { text: "Weak", color: "text-orange-500" }
      case 3: return { text: "Fair", color: "text-yellow-500" }
      case 4: return { text: "Good", color: "text-blue-500" }
      case 5: return { text: "Strong", color: "text-green-500" }
      default: return { text: "", color: "" }
    }
  }

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required")
      return false
    }

    if (!isLogin) {
      if (!username) {
        setError("Username is required")
        return false
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long")
        return false
      }

      if (passwordStrength < 3) {
        setError("Password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and special characters.")
        return false
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (isLogin) {
        // Enhanced login with device fingerprinting
        const deviceFingerprint = await generateDeviceFingerprint()
        
        const result = await authService.enhancedLogin(email, password, {
          deviceFingerprint,
          trustedDevice: deviceTrusted,
          twoFactorCode: twoFactorEnabled ? twoFactorCode : undefined
        })
        
        if (!result.success) {
          if (result.requiresTwoFactor) {
            setTwoFactorEnabled(true)
            setError("Please enter your 2FA code")
            setIsLoading(false)
            return
          }
          
          setError(result.error || "Invalid email or password")
          setIsLoading(false)
          return
        }

        // Trust this device if login successful
        if (result.deviceToken) {
          localStorage.setItem('trusted_device_token', result.deviceToken)
        }

        onAuthSuccess(result.user!)
      } else {
        // Enhanced signup with security checks
        const deviceFingerprint = await generateDeviceFingerprint()
        
        const result = await authService.enhancedSignup(email, password, username, {
          referralCode,
          deviceFingerprint,
          passwordStrength
        })
        
        if (!result.success) {
          setError(result.error || "Registration failed")
          setIsLoading(false)
          return
        }

        // Auto-login after successful signup
        const loginResult = await authService.enhancedLogin(email, password, {
          deviceFingerprint,
          trustedDevice: false
        })
        
        if (loginResult.success && loginResult.user) {
          if (loginResult.deviceToken) {
            localStorage.setItem('trusted_device_token', loginResult.deviceToken)
          }
          onAuthSuccess(loginResult.user)
        } else {
          setError("Account created! Please log in.")
          setIsLogin(true)
        }
      }
      setIsLoading(false)
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const generateDeviceFingerprint = async (): Promise<string> => {
    // Generate a unique device fingerprint for security
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('Device fingerprint', 10, 10)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
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
          
          {/* Security indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-green-400">
            <Shield className="w-4 h-4" />
            <span>Secure Authentication</span>
            {deviceTrusted && (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Trusted Device</span>
              </>
            )}
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
                autoComplete="email"
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
                  autoComplete="username"
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
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-cyan-400/50 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password strength indicator for signup */}
            {!isLogin && password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength <= 2 ? 'bg-red-500' :
                        passwordStrength === 3 ? 'bg-yellow-500' :
                        passwordStrength === 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm ${getPasswordStrengthText().color}`}>
                    {getPasswordStrengthText().text}
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    {password.length >= 8 ? 
                      <CheckCircle className="w-3 h-3 text-green-500" /> : 
                      <AlertCircle className="w-3 h-3 text-gray-500" />
                    }
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? 
                      <CheckCircle className="w-3 h-3 text-green-500" /> : 
                      <AlertCircle className="w-3 h-3 text-gray-500" />
                    }
                    <span>Upper and lowercase letters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 
                      <CheckCircle className="w-3 h-3 text-green-500" /> : 
                      <AlertCircle className="w-3 h-3 text-gray-500" />
                    }
                    <span>Numbers and special characters</span>
                  </div>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-sm pl-10 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-cyan-400/50 hover:text-cyan-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

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

            {/* Two-factor authentication */}
            {twoFactorEnabled && (
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <Input
                  type="text"
                  placeholder="2FA Code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="glass-sm pl-10"
                  maxLength={6}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || (!isLogin && passwordStrength < 3)} 
              className="w-full btn-primary h-11 text-base font-semibold"
            >
              {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setTwoFactorEnabled(false)
                  setTwoFactorCode("")
                }}
                className="ml-2 text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Security features info */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Security Features</span>
            </div>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>• Device fingerprinting for fraud prevention</li>
              <li>• Encrypted password storage</li>
              <li>• Secure session management</li>
              <li>• Mobile-optimized interface</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}