"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  DollarSign,
  Users,
  Bell,
  Zap,
  AlertTriangle,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface SystemSettings {
  maintenance_mode?: { value: boolean; description: string }
  registration_open?: { value: boolean; description: string }
  min_withdrawal?: { value: number; description: string }
  referral_bonus?: { value: number; description: string }
  daily_bonus?: { value: number; description: string }
  max_withdrawal_per_day?: { value: number; description: string }
  withdrawal_fee_percentage?: { value: number; description: string }
}

interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_active: boolean
  created_at: string
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<SystemSettings>({})
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info' as const
  })

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        console.warn('System settings table not found, using default settings')
        setSettings({
          maintenance_mode: false,
          registration_open: true,
          min_withdrawal: 50,
          referral_bonus: 50,
          daily_bonus: 10
        })
        setLoading(false)
        return
      }
      
      const data = await response.json()
      setSettings(data.settings || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/announcements?includeInactive=true')
      if (!response.ok) {
        console.warn('Announcements table not found, using empty array')
        setAnnouncements([])
        return
      }
      
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to fetch announcements')
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchAnnouncements()
  }, [fetchSettings, fetchAnnouncements])

  const updateSetting = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })

      if (!response.ok) throw new Error('Failed to update setting')
      
      toast.success('Setting updated successfully')
      await fetchSettings()
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Failed to update setting')
    }
  }

  const saveAllSettings = async () => {
    try {
      setSaving(true)
      const settingsToSave: Record<string, any> = {}
      
      Object.entries(settings).forEach(([key, data]) => {
        settingsToSave[key] = data.value
      })

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave })
      })

      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success('All settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const createAnnouncement = async () => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement)
      })

      if (!response.ok) throw new Error('Failed to create announcement')
      
      toast.success('Announcement created successfully')
      setNewAnnouncement({ title: '', message: '', type: 'info' })
      await fetchAnnouncements()
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('Failed to create announcement')
    }
  }

  const toggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive })
      })

      if (!response.ok) throw new Error('Failed to update announcement')
      
      toast.success('Announcement updated successfully')
      await fetchAnnouncements()
    } catch (error) {
      console.error('Error updating announcement:', error)
      toast.error('Failed to update announcement')
    }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to delete announcement')
      
      toast.success('Announcement deleted successfully')
      await fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Settings & Configuration</h2>
          <p className="text-muted-foreground">Manage system settings and platform configuration</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveAllSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">General Settings</h3>
            
            <div className="space-y-4">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Maintenance Mode</label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSetting('maintenance_mode', !settings.maintenance_mode?.value)}
                >
                  {settings.maintenance_mode?.value ? (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2 text-green-500" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      Disabled
                    </>
                  )}
                </Button>
              </div>

              {/* Registration Open */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">User Registration</label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSetting('registration_open', !settings.registration_open?.value)}
                >
                  {settings.registration_open?.value ? (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2 text-green-500" />
                      Open
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      Closed
                    </>
                  )}
                </Button>
              </div>

              {/* Daily Bonus */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Daily Bonus Amount</label>
                  <p className="text-sm text-muted-foreground">
                    Amount given for daily login bonus
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.daily_bonus?.value || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      daily_bonus: {
                        ...settings.daily_bonus!,
                        value: parseFloat(e.target.value)
                      }
                    })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">USD</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Financial Settings</h3>
            
            <div className="space-y-4">
              {/* Minimum Withdrawal */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Minimum Withdrawal</label>
                  <p className="text-sm text-muted-foreground">
                    Minimum amount for withdrawal requests
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.min_withdrawal?.value || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      min_withdrawal: {
                        ...settings.min_withdrawal!,
                        value: parseFloat(e.target.value)
                      }
                    })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">USD</span>
                </div>
              </div>

              {/* Max Withdrawal Per Day */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Max Daily Withdrawal</label>
                  <p className="text-sm text-muted-foreground">
                    Maximum withdrawal amount per day
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.max_withdrawal_per_day?.value || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      max_withdrawal_per_day: {
                        ...settings.max_withdrawal_per_day!,
                        value: parseFloat(e.target.value)
                      }
                    })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">USD</span>
                </div>
              </div>

              {/* Withdrawal Fee */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Withdrawal Fee</label>
                  <p className="text-sm text-muted-foreground">
                    Percentage fee for withdrawals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.withdrawal_fee_percentage?.value || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      withdrawal_fee_percentage: {
                        ...settings.withdrawal_fee_percentage!,
                        value: parseFloat(e.target.value)
                      }
                    })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              {/* Referral Bonus */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Referral Bonus</label>
                  <p className="text-sm text-muted-foreground">
                    Bonus amount for successful referrals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.referral_bonus?.value || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      referral_bonus: {
                        ...settings.referral_bonus!,
                        value: parseFloat(e.target.value)
                      }
                    })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">USD</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Two-Factor Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for admin accounts
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Configure 2FA
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">IP Whitelist</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Restrict admin access to specific IP addresses
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Manage IPs
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {/* Create Announcement */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  placeholder="Announcement message"
                  className="w-full p-2 border rounded-lg bg-background min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-2 mt-2">
                  {(['info', 'warning', 'error', 'success'] as const).map(type => (
                    <Button
                      key={type}
                      size="sm"
                      variant={newAnnouncement.type === type ? 'default' : 'outline'}
                      onClick={() => setNewAnnouncement({ ...newAnnouncement, type: type as 'info' | 'warning' | 'error' | 'success' })}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={createAnnouncement}>
                <Bell className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </Card>

          {/* Existing Announcements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Active Announcements</h3>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No announcements found
                </div>
              ) : (
                announcements.map(announcement => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <Badge variant={
                            announcement.type === 'error' ? 'destructive' :
                            announcement.type === 'warning' ? 'secondary' :
                            announcement.type === 'success' ? 'default' :
                            'outline'
                          }>
                            {announcement.type}
                          </Badge>
                          {announcement.is_active && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {announcement.message}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAnnouncement(announcement.id, announcement.is_active)}
                        >
                          {announcement.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAnnouncement(announcement.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}