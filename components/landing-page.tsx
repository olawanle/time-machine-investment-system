"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChronosTimeLogo } from "./logo"
import { 
  TrendingUp, 
  Shield, 
  Users, 
  ArrowRight,
  Clock,
  Zap,
  BarChart3,
  Lock,
  Sparkles,
  Star,
  Check,
  DollarSign
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#3CE7FF]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#6C63FF]/15 rounded-full blur-[130px] animate-float" />
        <div className="absolute bottom-0 left-1/2 w-[550px] h-[550px] bg-[#EFBF60]/10 rounded-full blur-[125px] animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <ChronosTimeLogo />
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-[#3CE7FF] transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-[#3CE7FF] transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-white/80 hover:text-[#3CE7FF] transition-colors font-medium">Reviews</a>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] hover:from-[#3CE7FF]/90 hover:to-[#6C63FF]/90 text-black font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#3CE7FF]/30 hover:shadow-[#3CE7FF]/50 hover:scale-105"
              >
                Get Started Free
              </Button>
            </nav>
            <Button
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#020817]/95 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 text-white/80">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl font-semibold hover:text-[#3CE7FF] transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl font-semibold hover:text-[#3CE7FF] transition-colors">How It Works</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl font-semibold hover:text-[#3CE7FF] transition-colors">Reviews</a>
            <Button 
              onClick={() => {
                setMobileMenuOpen(false)
                onGetStarted()
              }}
              className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] text-black font-bold px-8 py-4 rounded-xl text-lg"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3CE7FF]/20 to-[#6C63FF]/20 border border-[#3CE7FF]/30 mb-8 animate-bounce-in">
              <Sparkles className="w-4 h-4 text-[#EFBF60]" />
              <span className="text-sm font-semibold text-white">Trusted by 50,000+ Investors</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in leading-tight">
              Invest in Your Future with{" "}
              <span className="bg-gradient-to-r from-[#3CE7FF] via-[#6C63FF] to-[#EFBF60] bg-clip-text text-transparent animate-gradient">
                Time Machines
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-10 animate-slide-in max-w-3xl mx-auto">
              Earn passive income through automated time-based investments. Start with as little as $10 and watch your wealth grow week after week.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12 animate-slide-in">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-[#3CE7FF]">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">50K+ Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-[#EFBF60]">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">12% Weekly ROI</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] hover:from-[#3CE7FF]/90 hover:to-[#6C63FF]/90 text-black font-bold px-10 py-6 rounded-xl transition-all duration-300 shadow-2xl shadow-[#3CE7FF]/40 text-lg hover:scale-105 active:scale-95 group text-lg"
              >
                Start Earning Today
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-[#3CE7FF]/50 text-white hover:bg-[#3CE7FF]/10 px-10 py-6 rounded-xl text-lg transition-all duration-300 hover:border-[#3CE7FF] hover:scale-105"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Stats Banner */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] bg-clip-text text-transparent mb-2">
                  $2.5M+
                </div>
                <div className="text-white/70 font-medium">Total Invested</div>
              </div>
              <div className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#EFBF60] bg-clip-text text-transparent mb-2">
                  $450K+
                </div>
                <div className="text-white/70 font-medium">Earnings Paid Out</div>
              </div>
              <div className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#EFBF60] to-[#3CE7FF] bg-clip-text text-transparent mb-2">
                  98%
                </div>
                <div className="text-white/70 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] bg-clip-text text-transparent">ChronosTime</span>?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Built for investors who want to grow their wealth effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Time-Based Returns",
                description: "Earn consistent weekly returns on your investment. The longer your time machine runs, the more you earn.",
                color: "#3CE7FF"
              },
              {
                icon: Zap,
                title: "Instant Activation",
                description: "Get started immediately. Purchase a time machine and start earning within minutes.",
                color: "#6C63FF"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Track your portfolio performance with real-time charts and detailed earnings reports.",
                color: "#EFBF60"
              },
              {
                icon: Lock,
                title: "Bank-Grade Security",
                description: "Your investments are protected with enterprise-level encryption and security protocols.",
                color: "#22c55e"
              },
              {
                icon: DollarSign,
                title: "Multiple Tiers",
                description: "Choose from 5 investment tiers ranging from $10 to $1000. Scale as you grow.",
                color: "#3CE7FF"
              },
              {
                icon: Users,
                title: "Referral Bonuses",
                description: "Earn extra income by referring friends. Get 10% commission on their investments.",
                color: "#EFBF60"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="glass-card p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-white/10 group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feature.color}20`, border: `2px solid ${feature.color}40` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Start earning in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Create Account", desc: "Sign up in seconds with just your email" },
              { step: "2", title: "Choose Time Machine", desc: "Select an investment tier that fits your budget" },
              { step: "3", title: "Start Earning", desc: "Claim weekly returns and watch your wealth grow" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="glass-card p-8 text-center hover:scale-105 transition-transform">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] flex items-center justify-center text-3xl font-bold text-black mx-auto mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-[#3CE7FF] -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] text-black font-bold px-10 py-6 rounded-xl hover:scale-105 transition-all shadow-2xl shadow-[#3CE7FF]/40"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-black/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Investors Say
            </h2>
            <p className="text-xl text-white/70">Join thousands of satisfied investors</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Full-time Investor", rating: 5, text: "I've been earning consistent returns for 6 months. The platform is incredibly easy to use and the support team is amazing!" },
              { name: "Michael Rodriguez", role: "Software Engineer", rating: 5, text: "Started with just $100 and now I have 5 time machines running. Best passive income source I've ever found." },
              { name: "Emily Watson", role: "Teacher", rating: 5, text: "The referral program is fantastic! I've earned over $500 just by sharing with friends and family." }
            ].map((testimonial, idx) => (
              <div key={idx} className="glass-card p-8 hover:scale-105 transition-transform">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#EFBF60] text-[#EFBF60]" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-white/60">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3CE7FF]/10 to-[#6C63FF]/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Your Investment Journey?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join 50,000+ investors already earning passive income with ChronosTime
              </p>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] text-black font-bold px-12 py-7 rounded-xl text-xl hover:scale-105 transition-all shadow-2xl shadow-[#3CE7FF]/50 group"
              >
                Create Free Account
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <p className="text-sm text-white/50 mt-6">No credit card required • Start with $10</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <ChronosTimeLogo />
              <p className="text-white/60 mt-4 text-sm">Invest in your future with time-based passive income.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Features</a>
                <a href="#how-it-works" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">How It Works</a>
                <a href="#testimonials" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Testimonials</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">About Us</a>
                <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Contact</a>
                <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Support</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Terms of Service</a>
                <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Disclaimer</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            © 2025 ChronosTime. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
