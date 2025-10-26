"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Search,
  RefreshCw,
  Ban,
  CheckCircle,
  Trash2,
  Edit,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  DollarSign
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  email: string
  username: string
  balance: number
  tier: string
  is_admin: boolean
  is_banned: boolean
  is_suspended: boolean
  created_at: string
  last_login: string | null
  total_invested: number
  total_earned: number
  time_machines?: { count: number }[]
  referrals?: { count: number }[]
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?page=${page}&search=${searchTerm}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users || [])
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUserAction = async (userId: string, action: string, value?: any) => {
    try {
      setActionLoading(`${userId}-${action}`)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value })
      })

      if (!response.ok) throw new Error(`Failed to ${action} user`)
      
      toast.success(`User ${action} successfully`)
      await fetchUsers()
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      toast.error(`Failed to ${action} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(`${userId}-delete`)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete user')
      
      toast.success('User deleted successfully')
      await fetchUsers()
      setShowDetails(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const viewUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user details')
      
      const data = await response.json()
      setSelectedUser(data.user)
      setShowDetails(true)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Failed to fetch user details')
    }
  }

  const exportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Users exported successfully')
    } catch (error) {
      console.error('Error exporting users:', error)
      toast.error('Failed to export users')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportUsers} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchUsers} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email, username, or ID..."
              className="pl-10"
            />
          </div>
          <Button onClick={() => setPage(1)}>Search</Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Balance</th>
                <th className="text-left p-4 font-medium">Tier</th>
                <th className="text-left p-4 font-medium">Investments</th>
                <th className="text-left p-4 font-medium">Referrals</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Joined</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/25 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.username || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.is_admin && (
                          <Badge variant="destructive" className="mt-1">Admin</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      ${user.balance?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {user.tier || 'bronze'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {user.time_machines?.[0]?.count || 0}
                    </td>
                    <td className="p-4">
                      {user.referrals?.[0]?.count || 0}
                    </td>
                    <td className="p-4">
                      {user.is_banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : user.is_suspended ? (
                        <Badge variant="secondary">Suspended</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewUserDetails(user.id)}
                          disabled={!!actionLoading}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {user.is_banned ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUserAction(user.id, 'unban')}
                            disabled={!!actionLoading}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUserAction(user.id, 'ban')}
                            disabled={!!actionLoading || user.is_admin}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newBalance = prompt('Enter new balance:')
                            if (newBalance) {
                              handleUserAction(user.id, 'update_balance', parseFloat(newBalance))
                            }
                          }}
                          disabled={!!actionLoading}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={!!actionLoading || user.is_admin}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">User Details</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">User ID</label>
                    <p className="font-mono text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Username</label>
                    <p>{selectedUser.username || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Balance</label>
                    <p className="font-mono">${selectedUser.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Total Invested</label>
                    <p className="font-mono">${selectedUser.total_invested?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Total Earned</label>
                    <p className="font-mono">${selectedUser.total_earned?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleUserAction(selectedUser.id, selectedUser.is_banned ? 'unban' : 'ban')}
                    variant={selectedUser.is_banned ? 'default' : 'destructive'}
                  >
                    {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    variant="destructive"
                    disabled={selectedUser.is_admin}
                  >
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}