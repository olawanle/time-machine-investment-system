"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Users, 
  DollarSign, 
  Clock, 
  Shield, 
  Bitcoin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Trash2
} from "lucide-react"
import type { User, WithdrawalPeriod, AdminSettings, BitcoinTransaction } from "@/lib/storage"

interface AdminDashboardProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function AdminDashboard({ user, onUserUpdate }: AdminDashboardProps) {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    id: "admin_settings",
    withdrawalPeriods: [],
    bitcoinAddress: "bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya",
    minInvestment: 100,
    maxInvestment: 10000,
    defaultRoiPercentage: 15,
    systemMaintenance: false,
    lastUpdated: Date.now()
  })

  const [bitcoinTransactions, setBitcoinTransactions] = useState<BitcoinTransaction[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([])
  const [editingPeriod, setEditingPeriod] = useState<WithdrawalPeriod | null>(null)
  const [newPeriod, setNewPeriod] = useState({
    startDate: "",
    endDate: "",
    description: ""
  })

  useEffect(() => {
    // Load admin data
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    // In a real app, this would fetch from the database
    // For now, we'll simulate the data
    setBitcoinTransactions([
      {
        id: "1",
        userId: "user1",
        amount: 500,
        bitcoinAddress: "bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya",
        transactionHash: "abc123...",
        status: "confirmed",
        createdAt: Date.now() - 1000 * 60 * 30,
        confirmedAt: Date.now() - 1000 * 60 * 25
      },
      {
        id: "2",
        userId: "user2",
        amount: 1000,
        bitcoinAddress: "bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya",
        status: "pending",
        createdAt: Date.now() - 1000 * 60 * 10
      }
    ])

    setWithdrawalRequests([
      {
        id: "1",
        userId: "user1",
        amount: 200,
        walletAddress: "bc1q...",
        status: "pending",
        createdAt: Date.now() - 1000 * 60 * 60 * 2
      }
    ])
  }

  const addWithdrawalPeriod = () => {
    if (!newPeriod.startDate || !newPeriod.endDate) return

    const period: WithdrawalPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date(newPeriod.startDate).getTime(),
      endDate: new Date(newPeriod.endDate).getTime(),
      isActive: true,
      description: newPeriod.description,
      createdAt: Date.now()
    }

    setAdminSettings(prev => ({
      ...prev,
      withdrawalPeriods: [...prev.withdrawalPeriods, period],
      lastUpdated: Date.now()
    }))

    setNewPeriod({ startDate: "", endDate: "", description: "" })
  }

  const togglePeriod = (periodId: string) => {
    setAdminSettings(prev => ({
      ...prev,
      withdrawalPeriods: prev.withdrawalPeriods.map(period =>
        period.id === periodId ? { ...period, isActive: !period.isActive } : period
      ),
      lastUpdated: Date.now()
    }))
  }

  const deletePeriod = (periodId: string) => {
    setAdminSettings(prev => ({
      ...prev,
      withdrawalPeriods: prev.withdrawalPeriods.filter(period => period.id !== periodId),
      lastUpdated: Date.now()
    }))
  }

  const updateBitcoinAddress = (address: string) => {
    setAdminSettings(prev => ({
      ...prev,
      bitcoinAddress: address,
      lastUpdated: Date.now()
    }))
  }

  const toggleMaintenance = () => {
    setAdminSettings(prev => ({
      ...prev,
      systemMaintenance: !prev.systemMaintenance,
      lastUpdated: Date.now()
    }))
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 text-success"
      case "pending":
        return "bg-warning/20 text-warning"
      case "failed":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Full control over the time machine investment platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">Admin Access</span>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">1,247</p>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-foreground">{withdrawalRequests.length}</p>
              </div>
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bitcoin Transactions</p>
                <p className="text-2xl font-bold text-foreground">{bitcoinTransactions.length}</p>
              </div>
              <Bitcoin className="w-6 h-6 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">System Status</p>
                <p className={`text-2xl font-bold ${adminSettings.systemMaintenance ? 'text-destructive' : 'text-success'}`}>
                  {adminSettings.systemMaintenance ? 'Maintenance' : 'Online'}
                </p>
              </div>
              {adminSettings.systemMaintenance ? (
                <AlertTriangle className="w-6 h-6 text-destructive" />
              ) : (
                <CheckCircle className="w-6 h-6 text-success" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bitcoin Payment Gateway */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-warning" />
            Bitcoin Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bitcoin Address</label>
            <div className="flex gap-2">
              <Input
                value={adminSettings.bitcoinAddress}
                onChange={(e) => updateBitcoinAddress(e.target.value)}
                className="bg-background border-border font-mono"
                placeholder="Enter Bitcoin address"
              />
              <Button onClick={() => navigator.clipboard.writeText(adminSettings.bitcoinAddress)}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              All investments will be sent to this Bitcoin address
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Minimum Investment</label>
              <Input
                type="number"
                value={adminSettings.minInvestment}
                onChange={(e) => setAdminSettings(prev => ({ ...prev, minInvestment: Number(e.target.value) }))}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Maximum Investment</label>
              <Input
                type="number"
                value={adminSettings.maxInvestment}
                onChange={(e) => setAdminSettings(prev => ({ ...prev, maxInvestment: Number(e.target.value) }))}
                className="bg-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Periods */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Withdrawal Periods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Period */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background rounded-lg border border-border">
            <div>
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <Input
                type="date"
                value={newPeriod.startDate}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">End Date</label>
              <Input
                type="date"
                value={newPeriod.endDate}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addWithdrawalPeriod} className="w-full">
                Add Period
              </Button>
            </div>
          </div>

          {/* Periods List */}
          <div className="space-y-2">
            {adminSettings.withdrawalPeriods.map((period) => (
              <div key={period.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${period.isActive ? 'bg-success' : 'bg-muted'}`}></div>
                  <div>
                    <p className="font-medium text-foreground">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">{period.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePeriod(period.id)}
                  >
                    {period.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePeriod(period.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bitcoin Transactions */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-warning" />
            Bitcoin Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bitcoinTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Bitcoin className="w-5 h-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">${transaction.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.transactionHash ? `Hash: ${transaction.transactionHash}` : 'Pending confirmation'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  {transaction.status === "pending" && (
                    <Button size="sm" variant="outline">
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Controls */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">System Maintenance</p>
              <p className="text-sm text-muted-foreground">
                Toggle maintenance mode to disable user access
              </p>
            </div>
            <Button
              onClick={toggleMaintenance}
              variant={adminSettings.systemMaintenance ? "destructive" : "outline"}
            >
              {adminSettings.systemMaintenance ? 'Disable Maintenance' : 'Enable Maintenance'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Default ROI Percentage</label>
              <Input
                type="number"
                value={adminSettings.defaultRoiPercentage}
                onChange={(e) => setAdminSettings(prev => ({ ...prev, defaultRoiPercentage: Number(e.target.value) }))}
                className="bg-background border-border"
                placeholder="15"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Update Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
