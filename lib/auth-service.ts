import type { User } from './storage'

export const authService = {
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
}
