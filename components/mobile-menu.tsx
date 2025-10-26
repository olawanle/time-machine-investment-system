"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, X, ArrowRight, TrendingUp, Shield, Clock, DollarSign, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  onGetStarted: () => void
}

export function MobileMenu({ onGetStarted }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeHover, setActiveHover] = useState<number | null>(null)

  const menuItems = [
    { label: "Features", href: "#features", icon: TrendingUp, color: "from-cyan-500 to-blue-500" },
    { label: "Security", href: "#security", icon: Shield, color: "from-purple-500 to-pink-500" },
    { label: "Reviews", href: "#testimonials", icon: Users, color: "from-green-500 to-emerald-500" },
    { label: "About", href: "#stats", icon: Clock, color: "from-yellow-500 to-orange-500" },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-cyan-400 p-2 relative"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-5 h-5 animate-scale-in" />
          ) : (
            <Menu className="w-5 h-5 animate-scale-in" />
          )}
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
        </div>
      </Button>

      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Enhanced Menu with glassmorphism and animations */}
          <Card className="fixed top-20 right-4 left-4 z-50 glass-sm border-cyan-400/30 animate-slide-in shadow-2xl shadow-cyan-500/20">
            <CardContent className="p-0">
              {/* Menu Header */}
              <div className="p-4 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-cyan-400">Navigation</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-400">Live</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon
                  const isHovered = activeHover === index
                  
                  return (
                    <button
                      key={item.label}
                      onMouseEnter={() => setActiveHover(index)}
                      onMouseLeave={() => setActiveHover(null)}
                      onClick={() => scrollToSection(item.href)}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl text-white transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                        `animate-stagger-${index + 1}`,
                        isHovered ? "bg-white/10 scale-[1.02]" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {/* Background gradient on hover */}
                      {isHovered && (
                        <div className={cn(
                          "absolute inset-0 opacity-10 bg-gradient-to-r",
                          item.color
                        )} />
                      )}
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br transition-all duration-300",
                          isHovered ? item.color : "from-gray-600 to-gray-700",
                          isHovered && "shadow-lg"
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isHovered ? "translate-x-1 opacity-100" : "opacity-50"
                      )} />
                    </button>
                  )
                })}
              </div>
              
              {/* CTA Section */}
              <div className="p-4 border-t border-cyan-400/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <Button 
                  onClick={() => {
                    onGetStarted()
                    setIsOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Start Investing Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                {/* Trust Badge */}
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>256-bit SSL Secured</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}