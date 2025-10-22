"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "./theme-provider"
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter, 
  Plus,
  Settings,
  Bell,
  User,
  Home,
  BookOpen,
  Clock,
  Share2,
  Users,
  BarChart3,
  Wallet,
  CreditCard,
  Shield,
  Zap,
  TrendingUp,
  PieChart,
  Target,
  Activity,
  Award,
  Star,
  DollarSign,
  Users2,
  Settings2,
  HelpCircle,
  Trash2,
  Globe,
  Lock,
  RefreshCw,
  CheckCircle,
  FileText,
  Moon,
  Sun
} from "lucide-react"

interface InvestmentLayoutProps {
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
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: "investment",
    label: "Investment",
    icon: <TrendingUp className="w-4 h-4" />,
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
    icon: <Zap className="w-4 h-4" />,
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
    icon: <Users2 className="w-4 h-4" />,
    children: [
      {
        id: "code",
        label: "My Referral Code",
        icon: <Users2 className="w-4 h-4" />,
      },
      {
        id: "track",
        label: "Track Referrals",
        icon: <Users2 className="w-4 h-4" />,
      },
      {
        id: "bonus",
        label: "Referral Bonuses",
        icon: <DollarSign className="w-4 h-4" />,
      }
    ]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      {
        id: "performance",
        label: "Performance",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        id: "reports",
        label: "Reports",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: "leaderboard",
        label: "Leaderboard",
        icon: <Award className="w-4 h-4" />,
      }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  }
]

export function InvestmentLayout({ children, currentSection = "overview", onSectionChange }: InvestmentLayoutProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["investment", "time-machines"])
  const [searchQuery, setSearchQuery] = useState("")
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
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive 
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
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
        
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4">
            <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Production Environment</option>
              <option>Staging Environment</option>
              <option>Development Environment</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Online</span>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-sidebar border-r border-border h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {navigationItems.map(item => renderNavigationItem(item))}
            </div>
          </div>
          
          <div className="p-6 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span>ChronosTime Investment</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-background">
          {children}
        </div>
      </div>
    </div>
  )
}


