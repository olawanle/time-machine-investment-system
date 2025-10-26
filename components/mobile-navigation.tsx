"use client"

import { useState, useEffect } from "react"
import { 
  Home, 
  TrendingUp, 
  Briefcase, 
  Gift, 
  User,
  Bell,
  DollarSign,
  BarChart3,
  Trophy,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface MobileNavigationProps {
  currentView: string
  onNavigate: (view: string) => void
  notifications?: number
  rewards?: number
}

export function MobileNavigation({ currentView, onNavigate, notifications = 0, rewards = 0 }: MobileNavigationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState(currentView)
  
  // Sync activeTab when currentView changes externally
  useEffect(() => {
    setActiveTab(currentView)
  }, [currentView])

  const tabs = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: Home, 
      color: 'from-cyan-500 to-blue-500',
      notifications: 0 
    },
    { 
      id: 'marketplace', 
      label: 'Invest', 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-500',
      notifications: 0 
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: Briefcase, 
      color: 'from-purple-500 to-pink-500',
      notifications: 0 
    },
    { 
      id: 'referrals', 
      label: 'Rewards', 
      icon: Gift, 
      color: 'from-yellow-500 to-orange-500',
      notifications: rewards 
    },
    { 
      id: 'settings', 
      label: 'Profile', 
      icon: User, 
      color: 'from-indigo-500 to-purple-500',
      notifications: notifications 
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onNavigate(tabId)
    
    // Add haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // Add ripple effect
    const tab = document.getElementById(`tab-${tabId}`)
    if (tab) {
      tab.classList.add('ripple-effect')
      setTimeout(() => tab.classList.remove('ripple-effect'), 600)
    }
  }

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 transform",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/90 to-transparent backdrop-blur-2xl" />
        
        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        {/* Navigation Tabs */}
        <nav className="relative flex items-center justify-between px-2 py-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl transition-all duration-300",
                  isActive && "scale-105"
                )}
              >
                {/* Active Background */}
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20",
                    tab.color
                  )} />
                )}
                
                {/* Icon Container */}
                <div className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
                  isActive ? cn("bg-gradient-to-br shadow-lg", tab.color) : "bg-white/5"
                )}>
                  <Icon 
                    size={24} 
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-white scale-110" : "text-gray-400"
                    )}
                  />
                  
                  {/* Notification Badge */}
                  {tab.notifications > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">
                        {tab.notifications > 99 ? '99+' : tab.notifications}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "mt-1 text-xs font-medium transition-all duration-300",
                  isActive ? "text-white" : "text-gray-400"
                )}>
                  {tab.label}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute bottom-0 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Floating Action Button for Quick Actions */}
      <button
        className="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50 flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95"
        onClick={() => onNavigate('quick-invest')}
      >
        <DollarSign className="text-white" size={24} />
        <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-20" />
      </button>

      <style jsx>{`
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          to {
            width: 100px;
            height: 100px;
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}