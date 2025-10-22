"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChronosTimeLogo } from "./logo"
import { MobileMenu } from "./mobile-menu"
import { ScrollToTop } from "./scroll-to-top"
import { 
  TrendingUp, 
  Shield, 
  Users, 
  ArrowRight
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <ChronosTimeLogo />
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#reviews" className="text-white/80 hover:text-white transition-colors">Reviews</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
              >
                Get Started
              </Button>
            </nav>
            <MobileMenu 
              isOpen={mobileMenuOpen} 
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
              Join thousands of professional investors using{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI-powered strategies
              </span>
              , advanced analytics, and institutional-grade security to maximize returns.
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-slide-in">
              <div className="flex items-center gap-2 text-green-400">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">50,000+ investors</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Licensed & regulated</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 text-lg hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 group"
              >
                Start Trading Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:border-white/40 focus-visible:ring-2 focus-visible:ring-cyan-500"
                onClick={() => {
                  // Scroll to features section
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                aria-label="Learn more about our features"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
