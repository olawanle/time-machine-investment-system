"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Power,
  PowerOff,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  BarChart,
  Settings
} from 'lucide-react'

interface MachineTemplate {
  id: string
  name: string
  description: string
  price: number
  daily_return: number
  level_requirement: number
  image_url: string
  is_active: boolean
  max_purchases?: number
  duration_days: number
  created_at: string
  updated_at: string
}

export function MachineManagement() {
  const [machines, setMachines] = useState<MachineTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMachine, setEditingMachine] = useState<MachineTemplate | null>(null)
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeMachines: 0,
    totalUserMachines: 0,
    activeUserMachines: 0
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    dailyReturn: 0,
    levelRequirement: 1,
    imageUrl: '',
    isActive: true,
    maxPurchases: 0,
    durationDays: 30
  })

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/machines')
      if (!response.ok) throw new Error('Failed to fetch machines')
      
      const data = await response.json()
      setMachines(data.machines || [])
      setStats(data.stats || {
        totalMachines: 0,
        activeMachines: 0,
        totalUserMachines: 0,
        activeUserMachines: 0
      })
    } catch (error) {
      console.error('Error fetching machines:', error)
      toast.error('Failed to fetch machines')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  const handleCreateMachine = async () => {
    try {
      const response = await fetch('/api/admin/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create machine')
      
      toast.success('Machine created successfully')
      setShowCreateModal(false)
      resetForm()
      await fetchMachines()
    } catch (error) {
      console.error('Error creating machine:', error)
      toast.error('Failed to create machine')
    }
  }

  const handleUpdateMachine = async () => {
    if (!editingMachine) return

    try {
      const response = await fetch('/api/admin/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMachine.id,
          ...formData
        })
      })

      if (!response.ok) throw new Error('Failed to update machine')
      
      toast.success('Machine updated successfully')
      setEditingMachine(null)
      resetForm()
      await fetchMachines()
    } catch (error) {
      console.error('Error updating machine:', error)
      toast.error('Failed to update machine')
    }
  }

  const handleDeleteMachine = async (machineId: string) => {
    if (!confirm('Are you sure you want to delete this machine? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/machines', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: machineId })
      })

      if (!response.ok) throw new Error('Failed to delete machine')
      
      toast.success('Machine deleted successfully')
      await fetchMachines()
    } catch (error) {
      console.error('Error deleting machine:', error)
      toast.error('Failed to delete machine')
    }
  }

  const toggleMachineStatus = async (machine: MachineTemplate) => {
    try {
      const response = await fetch('/api/admin/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: machine.id,
          isActive: !machine.is_active
        })
      })

      if (!response.ok) throw new Error('Failed to update machine status')
      
      toast.success(`Machine ${machine.is_active ? 'deactivated' : 'activated'} successfully`)
      await fetchMachines()
    } catch (error) {
      console.error('Error updating machine status:', error)
      toast.error('Failed to update machine status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      dailyReturn: 0,
      levelRequirement: 1,
      imageUrl: '',
      isActive: true,
      maxPurchases: 0,
      durationDays: 30
    })
  }

  const startEdit = (machine: MachineTemplate) => {
    setEditingMachine(machine)
    setFormData({
      name: machine.name,
      description: machine.description,
      price: machine.price,
      dailyReturn: machine.daily_return,
      levelRequirement: machine.level_requirement,
      imageUrl: machine.image_url,
      isActive: machine.is_active,
      maxPurchases: machine.max_purchases || 0,
      durationDays: machine.duration_days
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Time Machine Management</h2>
          <p className="text-muted-foreground">Manage marketplace machines and templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Machine
          </Button>
          <Button onClick={fetchMachines} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Machines</span>
            <Settings className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{stats.totalMachines}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Machines</span>
            <Power className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{stats.activeMachines}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">User Machines</span>
            <BarChart className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{stats.totalUserMachines}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Investments</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{stats.activeUserMachines}</div>
        </Card>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            Loading machines...
          </div>
        ) : machines.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            No machines found. Create your first machine template.
          </div>
        ) : (
          machines.map((machine) => (
            <Card key={machine.id} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Clock className="w-16 h-16 text-white/50" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{machine.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {machine.description}
                    </p>
                  </div>
                  <Badge variant={machine.is_active ? 'default' : 'secondary'}>
                    {machine.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price</span>
                    <div className="font-semibold">${machine.price}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daily Return</span>
                    <div className="font-semibold">${machine.daily_return}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Level Required</span>
                    <div className="font-semibold">Level {machine.level_requirement}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <div className="font-semibold">{machine.duration_days} days</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(machine)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleMachineStatus(machine)}
                    className="flex-1"
                  >
                    {machine.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMachine(machine.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingMachine) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editingMachine ? 'Edit Machine' : 'Create New Machine'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Time Machine Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Machine description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Daily Return ($)</label>
                    <Input
                      type="number"
                      value={formData.dailyReturn}
                      onChange={(e) => setFormData({ ...formData, dailyReturn: parseFloat(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Level Requirement</label>
                    <Input
                      type="number"
                      value={formData.levelRequirement}
                      onChange={(e) => setFormData({ ...formData, levelRequirement: parseInt(e.target.value) })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (days)</label>
                    <Input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (Available for purchase)
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={editingMachine ? handleUpdateMachine : handleCreateMachine}
                    className="flex-1"
                  >
                    {editingMachine ? 'Update Machine' : 'Create Machine'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingMachine(null)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancel
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