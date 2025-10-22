"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  onGetStarted: () => void
}

export function MobileMenu({ onGetStarted }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: "Features", href: "#features" },
    { label: "Reviews", href: "#testimonials" },
    { label: "About", href: "#stats" },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-cyan-400 p-2"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <Card className="fixed top-20 right-4 left-4 z-50 glass border-white/20 animate-slide-in">
            <CardContent className="p-6 space-y-4">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 flex items-center justify-between group",
                    `animate-stagger-${index + 1}`
                  )}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                <Button 
                  onClick={() => {
                    onGetStarted()
                    setIsOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}