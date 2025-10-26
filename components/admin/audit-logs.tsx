"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Shield,
  Search,
  Download,
  RefreshCw,
  Filter,
  Clock,
  User,
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id?: string
  details: any
  ip_address?: string
  user_agent?: string
  created_at: string
  admin?: {
    email: string
    username?: string
  }
}

interface AuditStats {
  totalLogs: number
  actionCounts: Record<string, number>
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    actionCounts: {}
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    adminId: '',
    startDate: '',
    endDate: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      
      if (filters.action) params.append('action', filters.action)
      if (filters.targetType) params.append('targetType', filters.targetType)
      if (filters.adminId) params.append('adminId', filters.adminId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      
      const response = await fetch(`/api/admin/audit-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      
      const data = await response.json()
      setLogs(data.logs || [])
      
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages)
      }
      
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      
      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        method: 'PATCH'
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Audit logs exported successfully')
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Failed to export audit logs')
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return User
    if (action.includes('transaction') || action.includes('withdrawal')) return DollarSign
    if (action.includes('machine')) return Clock
    if (action.includes('setting')) return Settings
    if (action.includes('announcement')) return Bell
    return Activity
  }

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban')) return 'text-red-500'
    if (action.includes('create') || action.includes('approve')) return 'text-green-500'
    if (action.includes('update') || action.includes('edit')) return 'text-blue-500'
    if (action.includes('reject') || action.includes('suspend')) return 'text-yellow-500'
    return 'text-gray-500'
  }

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Get unique actions and target types for filter dropdowns
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)))
  const uniqueTargetTypes = Array.from(new Set(logs.map(l => l.target_type)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Audit Logs</h2>
          <p className="text-muted-foreground">Track all admin actions and system activity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchLogs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Logs</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{stats.totalLogs}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">User Actions</span>
            <User className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {Object.keys(stats.actionCounts).filter(a => a.includes('user')).reduce((sum, a) => sum + stats.actionCounts[a], 0)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Critical Actions</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">
            {Object.keys(stats.actionCounts).filter(a => a.includes('delete') || a.includes('ban')).reduce((sum, a) => sum + stats.actionCounts[a], 0)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Today's Activity</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="pl-10"
            />
          </div>
          
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          
          <select
            value={filters.targetType}
            onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">All Types</option>
            {uniqueTargetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-auto"
          />
          
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-auto"
          />
          
          <Button
            onClick={() => {
              setFilters({
                action: '',
                targetType: '',
                adminId: '',
                startDate: '',
                endDate: ''
              })
              setSearchTerm('')
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Time</th>
                <th className="text-left p-4 font-medium">Admin</th>
                <th className="text-left p-4 font-medium">Action</th>
                <th className="text-left p-4 font-medium">Target</th>
                <th className="text-left p-4 font-medium">IP Address</th>
                <th className="text-center p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action)
                  return (
                    <tr key={log.id} className="border-b hover:bg-muted/25 transition-colors">
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                          </div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium">{log.admin?.username || 'N/A'}</div>
                          <div className="text-muted-foreground">{log.admin?.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ActionIcon className={`w-4 h-4 ${getActionColor(log.action)}`} />
                          <span className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <Badge variant="outline">{log.target_type}</Badge>
                          {log.target_id && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ID: {log.target_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {log.ip_address || 'Unknown'}
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewLogDetails(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
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

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Log Details</h3>
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
                    <label className="text-sm text-muted-foreground">Log ID</label>
                    <p className="font-mono text-sm">{selectedLog.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Timestamp</label>
                    <p className="text-sm">
                      {format(new Date(selectedLog.created_at), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Admin</label>
                    <p>{selectedLog.admin?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Action</label>
                    <p className="font-medium">{selectedLog.action.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Target Type</label>
                    <p>{selectedLog.target_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Target ID</label>
                    <p className="font-mono text-sm">{selectedLog.target_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">IP Address</label>
                    <p>{selectedLog.ip_address || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">User Agent</label>
                    <p className="text-xs">{selectedLog.user_agent || 'Unknown'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Details</label>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Add missing import
import { DollarSign, Settings, Bell } from 'lucide-react'