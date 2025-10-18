"use client"

import { useState } from "react"
import type { User } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "./navigation"
import { UserIcon, Lock, Bell, CreditCard } from "lucide-react"

interface SettingsProps {
  user: User
  onNavigate: (view: string) => void
  onLogout: () => void
}

export function Settings({ user, onNavigate, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navigation user={user} currentView="settings" onNavigate={onNavigate} onLogout={onLogout} onAdmin={() => {}} />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold gradient-text mb-12">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="glass glow-cyan sticky top-24 border border-cyan-400/30">
              <CardContent className="p-4 space-y-2">
                <Button
                  onClick={() => setActiveTab("personal")}
                  className={`w-full justify-start gap-3 transition-all ${
                    activeTab === "personal"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
                  }`}
                >
                  <UserIcon size={18} />
                  Personal Info
                </Button>
                <Button
                  onClick={() => setActiveTab("security")}
                  className={`w-full justify-start gap-3 transition-all ${
                    activeTab === "security"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
                  }`}
                >
                  <Lock size={18} />
                  Security
                </Button>
                <Button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full justify-start gap-3 transition-all ${
                    activeTab === "notifications"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
                  }`}
                >
                  <Bell size={18} />
                  Notifications
                </Button>
                <Button
                  onClick={() => setActiveTab("payment")}
                  className={`w-full justify-start gap-3 transition-all ${
                    activeTab === "payment"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
                  }`}
                >
                  <CreditCard size={18} />
                  Payment Methods
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "personal" && (
              <Card className="glass glow-cyan border border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-cyan-400" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground font-semibold">First Name</label>
                      <Input defaultValue="Alex" className="glass-sm mt-2" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground font-semibold">Last Name</label>
                      <Input defaultValue="Johnson" className="glass-sm mt-2" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground font-semibold">Email Address</label>
                    <Input defaultValue={user.email} className="glass-sm mt-2" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground font-semibold">Bio</label>
                    <textarea
                      defaultValue="Temporal explorer and enthusiast of paradox-free investments."
                      className="w-full glass-sm mt-2 p-3 rounded-lg resize-none"
                      rows={4}
                    />
                  </div>
                  <Button className="btn-primary">Save Changes</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="glass glow-cyan border border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-400" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm text-muted-foreground font-semibold">Current Password</label>
                    <Input type="password" className="glass-sm mt-2" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground font-semibold">New Password</label>
                    <Input type="password" className="glass-sm mt-2" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground font-semibold">Confirm Password</label>
                    <Input type="password" className="glass-sm mt-2" />
                  </div>
                  <Button className="btn-primary">Update Password</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="glass glow-cyan border border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-cyan-400" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 glass-sm rounded-lg">
                    <div>
                      <p className="font-semibold">Reward Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified when rewards are ready to claim</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-4 glass-sm rounded-lg">
                    <div>
                      <p className="font-semibold">Referral Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified when friends join</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                  </div>
                  <Button className="btn-primary">Save Preferences</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "payment" && (
              <Card className="glass glow-cyan border border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm text-muted-foreground font-semibold">Crypto Wallet Address</label>
                    <Input placeholder="0x..." className="glass-sm mt-2" />
                  </div>
                  <Button className="btn-primary">Add Payment Method</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
