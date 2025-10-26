"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChronosTimeLogo } from "./logo"
import { 
  LiveUserCounter, 
  TransactionTicker, 
  SecurityBadges, 
  SuccessStories, 
  InvestmentCalculator, 
  OfferCountdown 
} from "@/components/trust-indicators"
import { 
  ParticleBackground, 
  FadeInOnScroll, 
  ParallaxSection, 
  GlowHover 
} from "@/components/premium-effects"
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
  
  // Countdown end time (24 hours from now)
  const offerEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0b1220] to-[#020817] relative overflow-hidden">
      {/* Premium Particle Background Effects */}
      <ParticleBackground />
      
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
              <a href="#success-stories" className="text-white/80 hover:text-[#3CE7FF] transition-colors font-medium">Success Stories</a>
              <a href="#calculator" className="text-white/80 hover:text-[#3CE7FF] transition-colors font-medium">Calculator</a>
              <GlowHover glowColor="cyan">
                <Button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] hover:from-[#3CE7FF]/90 hover:to-[#6C63FF]/90 text-black font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#3CE7FF]/30 hover:shadow-[#3CE7FF]/50 hover:scale-105"
                >
                  Get Started Free
                </Button>
              </GlowHover>
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
            <a href="#success-stories" onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl font-semibold hover:text-[#3CE7FF] transition-colors">Success Stories</a>
            <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl font-semibold hover:text-[#3CE7FF] transition-colors">Calculator</a>
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

      {/* Hero Section with Parallax */}
      <ParallaxSection speed={0.5}>
        <FadeInOnScroll>
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

                {/* Trust Bar - Premium Glassmorphic Design */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-12 animate-slide-in">
                  <div className="glass-card px-6 py-3 backdrop-blur-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-pulse-subtle">
                    <LiveUserCounter />
                  </div>
                  <div className="hidden lg:block w-px h-8 bg-white/20" />
                  <div className="glass-card px-6 py-3 backdrop-blur-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <SecurityBadges />
                  </div>
                </div>

                {/* Transaction Ticker */}
                <div className="max-w-2xl mx-auto mb-12">
                  <TransactionTicker />
                </div>

                {/* Limited Offer Countdown */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-3">
                    <OfferCountdown endTime={offerEndTime} />
                    <span className="text-sm font-bold text-yellow-400 animate-pulse">
                      💰 20% Bonus on First Investment!
                    </span>
                  </div>
                </div>

                {/* CTA Buttons with Glow Effect */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                  <GlowHover glowColor="cyan">
                    <Button 
                      onClick={onGetStarted}
                      size="lg"
                      className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] hover:from-[#3CE7FF]/90 hover:to-[#6C63FF]/90 text-black font-bold px-10 py-6 rounded-xl transition-all duration-300 shadow-2xl shadow-[#3CE7FF]/40 text-lg hover:scale-105 active:scale-95 group"
                    >
                      Start Earning Today
                      <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </GlowHover>
                  <GlowHover glowColor="purple">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-[#3CE7FF]/50 text-white hover:bg-[#3CE7FF]/10 px-10 py-6 rounded-xl text-lg transition-all duration-300 hover:border-[#3CE7FF] hover:scale-105"
                      onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      See How It Works
                    </Button>
                  </GlowHover>
                </div>

                {/* Stats Banner with Animation */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <FadeInOnScroll delay={100}>
                    <GlowHover glowColor="cyan">
                      <div className="glass-card p-6 hover:scale-105 transition-transform backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] bg-clip-text text-transparent mb-2">
                          $2.5M+
                        </div>
                        <div className="text-white/70 font-medium">Total Invested</div>
                      </div>
                    </GlowHover>
                  </FadeInOnScroll>
                  <FadeInOnScroll delay={200}>
                    <GlowHover glowColor="purple">
                      <div className="glass-card p-6 hover:scale-105 transition-transform backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#EFBF60] bg-clip-text text-transparent mb-2">
                          $450K+
                        </div>
                        <div className="text-white/70 font-medium">Earnings Paid Out</div>
                      </div>
                    </GlowHover>
                  </FadeInOnScroll>
                  <FadeInOnScroll delay={300}>
                    <GlowHover glowColor="yellow">
                      <div className="glass-card p-6 hover:scale-105 transition-transform backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-r from-[#EFBF60] to-[#3CE7FF] bg-clip-text text-transparent mb-2">
                          98%
                        </div>
                        <div className="text-white/70 font-medium">Satisfaction Rate</div>
                      </div>
                    </GlowHover>
                  </FadeInOnScroll>
                </div>
              </div>
            </div>
          </section>
        </FadeInOnScroll>
      </ParallaxSection>

      {/* Features Section with Scroll Animation */}
      <FadeInOnScroll>
        <section id="features" className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-transparent via-black/20 to-transparent">
          <ParallaxSection speed={0.3}>
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
                  <FadeInOnScroll key={idx} delay={idx * 100}>
                    <GlowHover glowColor={feature.color === "#3CE7FF" ? "cyan" : feature.color === "#6C63FF" ? "purple" : "yellow"}>
                      <div className="glass-card p-8 h-full hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-white/10 group bg-gradient-to-br from-white/5 to-white/0 hover:from-white/10 hover:to-white/5">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform animate-float"
                          style={{ backgroundColor: `${feature.color}20`, border: `2px solid ${feature.color}40` }}
                        >
                          <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-white/70 leading-relaxed">{feature.description}</p>
                      </div>
                    </GlowHover>
                  </FadeInOnScroll>
                ))}
              </div>
            </div>
          </ParallaxSection>
        </section>
      </FadeInOnScroll>

      {/* Success Stories Section */}
      <FadeInOnScroll>
        <section id="success-stories" className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-transparent to-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Real Success Stories
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                See what our investors have achieved with ChronosTime
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <SuccessStories />
            </div>
          </div>
        </section>
      </FadeInOnScroll>

      {/* Investment Calculator Section */}
      <FadeInOnScroll>
        <section id="calculator" className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-black/30 to-transparent">
          <ParallaxSection speed={0.4}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Calculate Your <span className="bg-gradient-to-r from-[#EFBF60] to-[#3CE7FF] bg-clip-text text-transparent">Potential Returns</span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  See how much you could earn with our compound interest calculator
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <InvestmentCalculator />
              </div>

              <div className="text-center mt-12">
                <GlowHover glowColor="yellow">
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-[#EFBF60] to-[#3CE7FF] text-black font-bold px-12 py-7 rounded-xl text-xl hover:scale-105 transition-all shadow-2xl shadow-[#EFBF60]/40 group"
                  >
                    Start Investing Now
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </GlowHover>
              </div>
            </div>
          </ParallaxSection>
        </section>
      </FadeInOnScroll>

      {/* How It Works Section with Animation */}
      <FadeInOnScroll>
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
                <FadeInOnScroll key={idx} delay={idx * 150}>
                  <div className="relative">
                    <GlowHover glowColor="cyan">
                      <div className="glass-card p-8 text-center hover:scale-105 transition-transform bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] flex items-center justify-center text-3xl font-bold text-black mx-auto mb-6 animate-float">
                          {item.step}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-white/70">{item.desc}</p>
                      </div>
                    </GlowHover>
                    {idx < 2 && (
                      <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-[#3CE7FF] -translate-y-1/2 animate-pulse" />
                    )}
                  </div>
                </FadeInOnScroll>
              ))}
            </div>

            <div className="text-center mt-12">
              <GlowHover glowColor="purple">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-[#3CE7FF] to-[#6C63FF] text-black font-bold px-10 py-6 rounded-xl hover:scale-105 transition-all shadow-2xl shadow-[#3CE7FF]/40"
                >
                  Get Started Now
                </Button>
              </GlowHover>
            </div>
          </div>
        </section>
      </FadeInOnScroll>

      {/* Testimonials Section with Premium Design */}
      <FadeInOnScroll>
        <section id="testimonials" className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-black/20 to-transparent">
          <ParallaxSection speed={0.2}>
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
                  <FadeInOnScroll key={idx} delay={idx * 100}>
                    <GlowHover glowColor="purple">
                      <div className="glass-card p-8 hover:scale-105 transition-transform bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl h-full">
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-[#EFBF60] text-[#EFBF60] animate-pulse" />
                          ))}
                        </div>
                        <p className="text-white/80 mb-6 italic">"{testimonial.text}"</p>
                        <div className="border-t border-white/10 pt-4">
                          <div className="font-bold text-white">{testimonial.name}</div>
                          <div className="text-sm text-white/60">{testimonial.role}</div>
                        </div>
                      </div>
                    </GlowHover>
                  </FadeInOnScroll>
                ))}
              </div>
            </div>
          </ParallaxSection>
        </section>
      </FadeInOnScroll>

      {/* Final CTA Section with Premium Effects */}
      <FadeInOnScroll>
        <section className="relative z-10 py-20 lg:py-32">
          <ParallaxSection speed={0.6}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <GlowHover glowColor="cyan" className="w-full">
                <div className="glass-card p-12 md:p-16 relative overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3CE7FF]/10 via-[#6C63FF]/10 to-[#EFBF60]/10 animate-gradient-slow" />
                  <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Ready to Start Your Investment Journey?
                    </h2>
                    <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                      Join 50,000+ investors already earning passive income with ChronosTime
                    </p>
                    
                    {/* Final Countdown Timer */}
                    <div className="flex justify-center mb-8">
                      <OfferCountdown endTime={offerEndTime} />
                    </div>
                    
                    <GlowHover glowColor="yellow">
                      <Button 
                        onClick={onGetStarted}
                        size="lg"
                        className="bg-gradient-to-r from-[#3CE7FF] via-[#6C63FF] to-[#EFBF60] text-black font-bold px-12 py-7 rounded-xl text-xl hover:scale-105 transition-all shadow-2xl shadow-[#3CE7FF]/50 group animate-pulse-subtle"
                      >
                        Create Free Account
                        <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </GlowHover>
                    
                    <p className="text-sm text-white/50 mt-6">No credit card required • Start with $10</p>
                  </div>
                </div>
              </GlowHover>
            </div>
          </ParallaxSection>
        </section>
      </FadeInOnScroll>

      {/* Footer with Animation */}
      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <FadeInOnScroll delay={100}>
              <div>
                <ChronosTimeLogo />
                <p className="text-white/60 mt-4 text-sm">Invest in your future with time-based passive income.</p>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll delay={200}>
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <div className="space-y-2">
                  <a href="#features" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Features</a>
                  <a href="#how-it-works" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">How It Works</a>
                  <a href="#success-stories" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Success Stories</a>
                  <a href="#calculator" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">ROI Calculator</a>
                </div>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll delay={300}>
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">About Us</a>
                  <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Contact</a>
                  <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Support</a>
                </div>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll delay={400}>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Privacy Policy</a>
                  <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Terms of Service</a>
                  <a href="#" className="block text-white/60 hover:text-[#3CE7FF] transition-colors text-sm">Disclaimer</a>
                </div>
              </div>
            </FadeInOnScroll>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            © 2025 ChronosTime. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add CSS for subtle animations */}
      <style jsx global>{`
        @keyframes gradient-slow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
      `}</style>
    </div>
  )
}