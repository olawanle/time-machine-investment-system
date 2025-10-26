"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import {
  Shield, Users, DollarSign, Activity, AlertTriangle, Server,
  Database, Clock, Ban, UserCheck, Send, Download, Filter,
  Search, ChevronDown, MoreVertical, Zap, TrendingUp, 
  AlertCircle, CheckCircle, XCircle, RefreshCw, Globe,
  Lock, Unlock, Mail, MessageSquare, FileText, Eye
} from "lucide-react"

interface AdminCommandCenterProps {
  user: any
  onLogout: () => void
}

export function AdminCommandCenter({ user, onLogout }: AdminCommandCenterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [systemStatus, setSystemStatus] = useState({
    api: "operational",
    database: "operational",
    server: "operational",
    uptime: "99.99%"
  })
  const [liveStats, setLiveStats] = useState({
    activeUsers: 2847,
    transactionsPerMinute: 142,
    totalVolume: 8743291,
    successRate: 99.8
  })

  // Sample data for charts
  const revenueData = [
    { name: 'Mon', revenue: 24000, users: 400 },
    { name: 'Tue', revenue: 31000, users: 600 },
    { name: 'Wed', revenue: 28000, users: 500 },
    { name: 'Thu', revenue: 45000, users: 780 },
    { name: 'Fri', revenue: 52000, users: 890 },
    { name: 'Sat', revenue: 38000, users: 650 },
    { name: 'Sun', revenue: 41000, users: 720 }
  ]

  const userDistribution = [
    { name: 'Active', value: 3420, color: '#22c55e' },
    { name: 'Inactive', value: 1230, color: '#64748b' },
    { name: 'Suspended', value: 89, color: '#ef4444' },
    { name: 'Pending', value: 156, color: '#f59e0b' }
  ]

  const serverMetrics = [
    { name: '00:00', cpu: 45, memory: 62, requests: 1200 },
    { name: '04:00', cpu: 38, memory: 58, requests: 800 },
    { name: '08:00', cpu: 72, memory: 75, requests: 2400 },
    { name: '12:00', cpu: 81, memory: 82, requests: 3100 },
    { name: '16:00', cpu: 69, memory: 71, requests: 2800 },
    { name: '20:00', cpu: 55, memory: 65, requests: 1900 }
  ]

  // Sample users data
  const [users, setUsers] = useState([
    { id: '1', username: 'john_doe', email: 'john@example.com', status: 'active', balance: 5432, joined: '2024-01-15' },
    { id: '2', username: 'jane_smith', email: 'jane@example.com', status: 'active', balance: 8921, joined: '2024-02-20' },
    { id: '3', username: 'bob_wilson', email: 'bob@example.com', status: 'suspended', balance: 0, joined: '2024-01-08' },
    { id: '4', username: 'alice_brown', email: 'alice@example.com', status: 'pending', balance: 1200, joined: '2024-03-01' }
  ])

  const [activityLogs, setActivityLogs] = useState([
    { id: '1', action: 'User Registration', user: 'new_user123', timestamp: '2 minutes ago', type: 'success' },
    { id: '2', action: 'Withdrawal Request', user: 'john_doe', amount: '$500', timestamp: '5 minutes ago', type: 'warning' },
    { id: '3', action: 'Failed Login Attempt', ip: '192.168.1.1', timestamp: '12 minutes ago', type: 'error' },
    { id: '4', action: 'Investment Created', user: 'jane_smith', amount: '$1,000', timestamp: '15 minutes ago', type: 'success' },
    { id: '5', action: 'System Backup', status: 'Completed', timestamp: '1 hour ago', type: 'info' }
  ])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 3),
        transactionsPerMinute: 140 + Math.floor(Math.random() * 20),
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 10000),
        successRate: 99.5 + Math.random() * 0.5
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'suspended' } : u
    ))
  }

  const handleApproveUser = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'active' } : u
    ))
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-red-900/50 bg-black/60 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Command Center</h1>
                <p className="text-sm text-gray-400">System Control & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                All Systems Operational
              </Badge>
              <Button onClick={onLogout} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-6">
        {/* Live Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-white">{liveStats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">Live</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Transactions/min</p>
                  <p className="text-2xl font-bold text-white">{liveStats.transactionsPerMinute}</p>
                  <p className="text-xs text-blue-400 mt-1">Real-time</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Volume</p>
                  <p className="text-2xl font-bold text-white">${liveStats.totalVolume.toLocaleString()}</p>
                  <p className="text-xs text-yellow-400 mt-1">Today</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{liveStats.successRate.toFixed(2)}%</p>
                  <p className="text-xs text-purple-400 mt-1">Excellent</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-gray-900/80 border border-gray-800 p-1">
            <TabsTrigger value="users" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              <Users className="w-4 h-4 mr-2" /> User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <BarChart className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Server className="w-4 h-4 mr-2" /> System Monitor
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <FileText className="w-4 h-4 mr-2" /> Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">User Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 w-64"
                      />
                    </div>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          <input type="checkbox" className="rounded border-gray-600" />
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Balance</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-600"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                }
                              }}
                            />
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                          <td className="py-3 px-4 text-gray-300">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={cn(
                                "capitalize",
                                user.status === 'active' && "bg-green-500/20 text-green-400 border-green-500/50",
                                user.status === 'suspended' && "bg-red-500/20 text-red-400 border-red-500/50",
                                user.status === 'pending' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                              )}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-300">${user.balance.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-300">{user.joined}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {user.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveUser(user.id)}
                                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              )}
                              {user.status === 'active' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleBanUser(user.id)}
                                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              {user.status === 'suspended' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveUser(user.id)}
                                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0"
                                >
                                  <Unlock className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                    <span className="text-gray-300">{selectedUsers.length} users selected</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                        <Mail className="w-4 h-4 mr-2" /> Send Email
                      </Button>
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                        <Ban className="w-4 h-4 mr-2" /> Ban Selected
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Revenue & Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue ($)" />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="New Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitor Tab */}
          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">API Status</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      Operational
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Time</span>
                      <span className="text-white">23ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uptime</span>
                      <span className="text-white">99.99%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Database</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      Healthy
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Connections</span>
                      <span className="text-white">142/500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Storage Used</span>
                      <span className="text-white">34.2GB/100GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Server Health</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                      High Load
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">CPU Usage</span>
                      <span className="text-white">78%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Memory</span>
                      <span className="text-white">6.2GB/8GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Server Metrics (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={serverMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="CPU %" />
                    <Area type="monotone" dataKey="memory" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Memory %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">System Activity Logs</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        log.type === 'success' && "bg-green-500/20",
                        log.type === 'warning' && "bg-yellow-500/20",
                        log.type === 'error' && "bg-red-500/20",
                        log.type === 'info' && "bg-blue-500/20"
                      )}>
                        {log.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {log.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                        {log.type === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                        {log.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{log.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {log.user && (
                                <span className="text-xs text-gray-400">User: {log.user}</span>
                              )}
                              {log.amount && (
                                <span className="text-xs text-gray-400">Amount: {log.amount}</span>
                              )}
                              {log.ip && (
                                <span className="text-xs text-gray-400">IP: {log.ip}</span>
                              )}
                              {log.status && (
                                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/50">
                                  {log.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-gray-300">
                  Load More Logs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6">
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Announcement
          </Button>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6">
            <Database className="w-5 h-5 mr-2" />
            Backup Database
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6">
            <Lock className="w-5 h-5 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}