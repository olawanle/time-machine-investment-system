"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, AlertCircle, Info, CheckCircle, Zap } from "lucide-react"
import type { User } from "@/lib/storage"

interface NotificationSystemProps {
  user: User
  onUserUpdate: (user: User) => void
}

interface Notification {
  id: string
  type: "success" | "info" | "warning" | "error"
  title: string
  message: string
  timestamp: number
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export function NotificationSystem({ user, onUserUpdate }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Generate sample notifications based on user activity
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        title: "Time Machine Unlocked!",
        message: `You've successfully unlocked Time Machine ${(user.machines || []).length}`,
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        read: false
      },
      {
        id: "2",
        type: "info",
        title: "Claim Available",
        message: "Your Time Machine 1 is ready to claim rewards!",
        timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
        read: false,
        action: {
          label: "Claim Now",
          onClick: () => console.log("Claim rewards")
        }
      },
      {
        id: "3",
        type: "success",
        title: "Referral Bonus!",
        message: "You've earned a referral bonus from a friend's investment",
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        read: true
      },
      {
        id: "4",
        type: "warning",
        title: "Withdrawal Cooldown",
        message: "You can withdraw again in 8 days",
        timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
        read: true
      }
    ]

    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)
  }, [user])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return prev.filter(n => n.id !== id)
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "info":
        return <Info className="w-5 h-5 text-primary" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-warning" />
      case "error":
        return <X className="w-5 h-5 text-destructive" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your time machine activities.</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
              </div>
              <Bell className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
              </div>
              <Zap className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-foreground">{notifications.length - unreadCount}</p>
              </div>
              <Check className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`bg-card border-border shadow-sm transition-all duration-200 ${
                !notification.read ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.action && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          onClick={notification.action.onClick}
                          className="btn-primary"
                        >
                          {notification.action.label}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}