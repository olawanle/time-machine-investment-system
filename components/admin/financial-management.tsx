"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Search,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  description: string
  status: string
  created_at: string
  user?: {
    email: string
    username: string
  }
}

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  wallet_address: string
  status: string
  created_at: string
  user?: {
    email: string
    username: string
  }
}

interface FinancialStats {
  totalDeposits: number
  totalWithdrawals: number
  totalEarnings: number
  totalReferralBonuses: number
  netFlow: number
  pendingWithdrawals: number
}

export function FinancialManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [stats, setStats] = useState<FinancialStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
    totalReferralBonuses: 0,
    netFlow: 0,
    pendingWithdrawals: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [revenueData, setRevenueData] = useState<any[]>([])

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/transactions')
      if (!response.ok) {
        console.warn('Transactions table not found, using empty array')
        setTransactions([])
        setLoading(false)
        return
      }
      
      const data = await response.json()
      setTransactions(data.transactions || [])
      
      if (data.summary) {
        setStats(data.summary)
      }

      // Process revenue data for charts
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      const revenueByDay = last7Days.map(date => {
        const dayTransactions = data.transactions?.filter((t: Transaction) => 
          t.created_at.startsWith(date)
        ) || []
        
        const deposits = dayTransactions
          .filter((t: Transaction) => t.type === 'deposit')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        
        const withdrawals = dayTransactions
          .filter((t: Transaction) => t.type === 'withdrawal')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          deposits,
          withdrawals,
          net: deposits - withdrawals
        }
      })

      setRevenueData(revenueByDay)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchWithdrawals = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/withdrawals')
      if (!response.ok) {
        console.warn('Withdrawals data not available, using empty array')
        setWithdrawals([])
        return
      }
      
      const data = await response.json()
      setWithdrawals(data.withdrawals || [])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast.error('Failed to fetch withdrawals')
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchWithdrawals()
  }, [fetchTransactions, fetchWithdrawals])

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action })
      })

      if (!response.ok) throw new Error(`Failed to ${action} withdrawal`)
      
      toast.success(`Withdrawal ${action}d successfully`)
      await fetchWithdrawals()
      await fetchTransactions()
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error)
      toast.error(`Failed to ${action} withdrawal`)
    }
  }

  const createTransaction = async (userId: string, amount: number, description: string) => {
    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'admin_adjustment',
          amount,
          description
        })
      })

      if (!response.ok) throw new Error('Failed to create transaction')
      
      toast.success('Transaction created successfully')
      await fetchTransactions()
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to create transaction')
    }
  }

  const exportTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Transactions exported successfully')
    } catch (error) {
      console.error('Error exporting transactions:', error)
      toast.error('Failed to export transactions')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financial Management</h2>
          <p className="text-muted-foreground">Monitor platform finances and process withdrawals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportTransactions} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => { fetchTransactions(); fetchWithdrawals(); }} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Deposits</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">${stats.totalDeposits.toFixed(2)}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Withdrawals</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">${stats.totalWithdrawals.toFixed(2)}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Net Flow</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">${stats.netFlow.toFixed(2)}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pending Withdrawals</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'pending').length}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">7-Day Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="deposits" stroke="#22c55e" name="Deposits" />
                <Line type="monotone" dataKey="withdrawals" stroke="#ef4444" name="Withdrawals" />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="pl-10"
              />
            </div>
          </Card>

          {/* Transactions Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 50).map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/25">
                        <td className="p-4">
                          <div>
                            <div className="text-sm font-medium">
                              {transaction.user?.username || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.user?.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            transaction.type === 'deposit' ? 'default' :
                            transaction.type === 'withdrawal' ? 'destructive' :
                            'outline'
                          }>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono">
                          ${Number(transaction.amount).toFixed(2)}
                        </td>
                        <td className="p-4 text-sm">
                          {transaction.description || 'N/A'}
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' :
                            'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          {/* Pending Withdrawals */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Pending Withdrawals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Wallet</th>
                    <th className="text-left p-4 font-medium">Requested</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        No pending withdrawals
                      </td>
                    </tr>
                  ) : (
                    withdrawals
                      .filter(w => w.status === 'pending')
                      .map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">
                            <div>
                              <div className="text-sm font-medium">
                                {withdrawal.user?.username || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {withdrawal.user?.email}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono">
                            ${Number(withdrawal.amount).toFixed(2)}
                          </td>
                          <td className="p-4 font-mono text-sm">
                            {withdrawal.wallet_address.slice(0, 10)}...
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(withdrawal.created_at), { addSuffix: true })}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}