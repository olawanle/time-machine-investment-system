import type { User } from './storage'

interface EnhancedLoginOptions {
  deviceFingerprint: string
  trustedDevice: boolean
  twoFactorCode?: string
}

interface EnhancedSignupOptions {
  referralCode?: string
  deviceFingerprint: string
  passwordStrength: number
}

export const authService = {
  async ensureAdminSetup(): Promise<void> {
    try {
      // Only run this in development or if admin doesn't exist
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        console.log('Admin setup completed')
      }
    } catch (error) {
      console.warn('Admin setup failed:', error)
    }
  },

  async signup(email: string, password: string, username?: string, referralCode?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, referralCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // If this is an admin login attempt, ensure admin is set up
      if (email === 'admin@chronostime.com') {
        await this.ensureAdminSetup()
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        return { success: false, error: 'Logout failed' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()

      return data.user || null
    } catch (error) {
      return null
    }
  },

  // Enhanced authentication methods with better security
  async enhancedLogin(email: string, password: string, options: EnhancedLoginOptions): Promise<{ 
    success: boolean; 
    user?: User; 
    error?: string; 
    requiresTwoFactor?: boolean;
    deviceToken?: string;
  }> {
    try {
      // If this is an admin login attempt, ensure admin is set up
      if (email === 'admin@chronostime.com') {
        await this.ensureAdminSetup()
      }

      const response = await fetch('/api/auth/enhanced-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          deviceFingerprint: options.deviceFingerprint,
          trustedDevice: options.trustedDevice,
          twoFactorCode: options.twoFactorCode
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || 'Login failed',
          requiresTwoFactor: data.requiresTwoFactor
        }
      }

      return { 
        success: true, 
        user: data.user,
        deviceToken: data.deviceToken
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  async enhancedSignup(email: string, password: string, username: string, options: EnhancedSignupOptions): Promise<{ 
    success: boolean; 
    user?: User; 
    error?: string;
  }> {
    try {
      // Validate password strength on client side too
      if (options.passwordStrength < 3) {
        return { success: false, error: 'Password is too weak. Please use a stronger password.' }
      }

      const response = await fetch('/api/auth/enhanced-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          username,
          referralCode: options.referralCode,
          deviceFingerprint: options.deviceFingerprint,
          passwordStrength: options.passwordStrength
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  // Security utilities
  async validateSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/validate-session')
      return response.ok
    } catch (error) {
      return false
    }
  },

  async refreshSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST'
      })
      return response.ok
    } catch (error) {
      return false
    }
  },

  // Device management
  async trustDevice(deviceFingerprint: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/trust-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceFingerprint })
      })
      return response.ok
    } catch (error) {
      return false
    }
  },

  async revokeDeviceTrust(): Promise<boolean> {
    try {
      localStorage.removeItem('trusted_device_token')
      const response = await fetch('/api/auth/revoke-device-trust', {
        method: 'POST'
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}
