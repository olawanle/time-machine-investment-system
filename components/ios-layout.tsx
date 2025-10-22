"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "./theme-provider"
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Home,
  TrendingUp,
  Zap,
  Users,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Wallet,
  DollarSign,
  Clock,
  PieChart,
  Award,
  FileText,
  User,
  Bell,
  Trophy
} from "lucide-react"

interface IOSLayoutProps {
  children: React.ReactNode
  currentSection?: string
  onSectionChange?: (section: string) => void
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "investment",
    label: "Investment",
    icon: <TrendingUp className="w-5 h-5" />,
    children: [
      {
        id: "portfolio",
        label: "My Portfolio",
        icon: <PieChart className="w-4 h-4" />,
      },
      {
        id: "invest",
        label: "Make Investment",
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        id: "withdraw",
        label: "Withdraw Funds",
        icon: <Wallet className="w-4 h-4" />,
      },
      {
        id: "history",
        label: "Transaction History",
        icon: <Clock className="w-4 h-4" />,
      }
    ]
  },
  {
    id: "time-machines",
    label: "Time Machines",
    icon: <Zap className="w-5 h-5" />,
    children: [
      {
        id: "machines",
        label: "My Machines",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        id: "claim",
        label: "Claim Rewards",
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        id: "analytics",
        label: "Machine Analytics",
        icon: <BarChart3 className="w-4 h-4" />,
      }
    ]
  },
  {
    id: "referrals",
    label: "Referrals",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-5 h-5" />,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    id: "admin",
    label: "Admin",
    icon: <User className="w-5 h-5" />,
  }
]

export function IOSLayout({ children, currentSection = "overview", onSectionChange }: IOSLayoutProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["investment", "time-machines"])
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedSections.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isActive = currentSection === item.id

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id)
            } else {
              onSectionChange?.(item.id)
              setSidebarOpen(false) // Close sidebar on mobile when item is selected
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
            isActive 
              ? "bg-primary/10 text-primary shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
          style={{ paddingLeft: `${16 + level * 20}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 ml-4">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">ChronosTime</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-foreground">ChronosTime</span>
                <p className="text-sm text-muted-foreground">Investment Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === "light" ? "Dark" : "Light"}
            </Button>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">Pro</span>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div 
          id="sidebar"
          className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-border transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-1">
                {navigationItems.map(item => renderNavigationItem(item))}
              </div>
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-6 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span>ChronosTime Investment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-background min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}


