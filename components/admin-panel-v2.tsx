"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Clock,
  Settings,
  Shield,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react'

// Import all admin components
import { SystemDashboard } from '@/components/admin/system-dashboard'
import { UserManagement } from '@/components/admin/user-management'
import { FinancialManagement } from '@/components/admin/financial-management'
import { MachineManagement } from '@/components/admin/machine-management'
import { SettingsPanel } from '@/components/admin/settings-panel'
import { AuditLogs } from '@/components/admin/audit-logs'

interface AdminPanelProps {
  onLogout: () => void
  onBackToDashboard?: () => void
}

export function AdminPanelV2({ onLogout, onBackToDashboard }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    verifyAdmin()
    fetchAnnouncements()
  }, [])

  const verifyAdmin = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      if (!response.ok) throw new Error('Not authorized')
      
      const data = await response.json()
      if (!data.isAdmin) {
        toast.error('You are not authorized to access the admin panel')
        onLogout()
        return
      }
      
      setAdminUser(data.user)
    } catch (error) {
      console.error('Admin verification failed:', error)
      toast.error('Failed to verify admin access')
      onLogout()
    } finally {
      setIsVerifying(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements?.filter((a: any) => a.is_active) || [])
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-green-500' },
    { id: 'financial', label: 'Financial', icon: DollarSign, color: 'text-purple-500' },
    { id: 'machines', label: 'Machines', icon: Clock, color: 'text-yellow-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
    { id: 'audit', label: 'Audit Logs', icon: Shield, color: 'text-red-500' }
  ]

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case 'dashboard':
        return <SystemDashboard />
      case 'users':
        return <UserManagement />
      case 'financial':
        return <FinancialManagement />
      case 'machines':
        return <MachineManagement />
      case 'settings':
        return <SettingsPanel />
      case 'audit':
        return <AuditLogs />
      default:
        return <SystemDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ChronosTime Admin
                </h1>
                <p className="text-xs text-muted-foreground">Platform Control Center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Activity Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-500">Live</span>
            </div>

            {/* Admin Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{adminUser?.username || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground">{adminUser?.email}</p>
            </div>

            <div className="h-8 w-px bg-border" />
            
            {onBackToDashboard && (
              <Button onClick={onBackToDashboard} variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            )}
            
            <Button onClick={onLogout} variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-background/50 backdrop-blur-xl border-r border-border z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : item.color}`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'users' && (
                  <Badge variant="secondary" className="ml-auto">
                    New
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* System Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="font-medium">System Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">API</span>
                <span className="text-green-500">Operational</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Database</span>
                <span className="text-green-500">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cache</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      } pt-16 p-6 min-h-screen`}>
        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-6 space-y-2">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`p-4 border-l-4 ${
                  announcement.type === 'error' ? 'border-red-500 bg-red-500/5' :
                  announcement.type === 'warning' ? 'border-yellow-500 bg-yellow-500/5' :
                  announcement.type === 'success' ? 'border-green-500 bg-green-500/5' :
                  'border-blue-500 bg-blue-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Bell className={`w-5 h-5 mt-0.5 ${
                    announcement.type === 'error' ? 'text-red-500' :
                    announcement.type === 'warning' ? 'text-yellow-500' :
                    announcement.type === 'success' ? 'text-green-500' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground">{announcement.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="relative z-10">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}