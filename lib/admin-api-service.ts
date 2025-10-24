// Service for fetching real admin data from secure server-side APIs

export interface PlatformStats {
  totalUsers: number
  totalBalance: number
  totalInvested: number
  totalEarned: number
  activeMachines: number
  totalPayments: number
}

export interface RecentPayment {
  id: string
  user_id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
  completed_at?: string
}

export interface UserData {
  id: string
  email: string
  username: string
  balance: number
  total_invested: number
  total_earned: number
  tier: string
  is_suspended?: boolean
  created_at: string
}

export const adminApiService = {
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await fetch('/api/admin/stats')
    if (!response.ok) {
      throw new Error('Failed to fetch platform stats')
    }
    const data = await response.json()
    return data.stats
  },

  async getAllUsers(): Promise<UserData[]> {
    const response = await fetch('/api/admin/users')
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    const data = await response.json()
    return data.users || []
  },

  async updateUser(userId: string, action: string, value?: any): Promise<boolean> {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, value }),
    })
    return response.ok
  },

  async getPendingWithdrawals(): Promise<any[]> {
    const response = await fetch('/api/admin/withdrawals')
    if (!response.ok) {
      throw new Error('Failed to fetch withdrawals')
    }
    const data = await response.json()
    return data.withdrawals || []
  },

  async processWithdrawal(withdrawalId: string, action: 'approve' | 'reject'): Promise<boolean> {
    const response = await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, action }),
    })
    return response.ok
  },
}
