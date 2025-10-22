"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChronosTimeLogo } from "./logo"
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Globe,
  Lock,
  BarChart3,
  Target,
  Award,
  DollarSign,
  Activity,
  PieChart
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Advanced Portfolio Management",
      description: "AI-powered investment strategies with real-time market analysis and automated rebalancing for optimal returns.",
      stats: "Up to 15% annual returns",
      color: "from-cyan-400 to-blue-400"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "256-bit encryption, multi-factor authentication, and regulatory compliance ensure your investments are protected.",
      stats: "99.9% uptime guarantee",
      color: "from-green-400 to-emerald-400"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Professional Network",
      description: "Connect with top investors, follow successful strategies, and build your professional investment network.",
      stats: "50,000+ active traders",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Execution",
      description: "Sub-millisecond order execution with advanced algorithms and institutional-grade infrastructure.",
      stats: "Sub-millisecond execution",
      color: "from-orange-400 to-red-400"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Portfolio Manager",
      company: "Goldman Sachs",
      content: "ChronosTime has revolutionized how I manage client portfolios. The AI insights are incredibly accurate and the returns speak for themselves.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Independent Trader",
      company: "Self-employed",
      content: "The professional network features helped me learn from the best. My returns improved by 40% in just 6 months.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Dr. Emily Watson",
      role: "Investment Advisor",
      company: "Morgan Stanley",
      content: "The security features give me complete confidence to recommend this platform to high-net-worth clients.",
      rating: 5,
      avatar: "EW"
    }
  ]

  const stats = [
    { label: "Assets Under Management", value: "$2.4B", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Active Users", value: "50,000+", icon: <Users className="w-5 h-5" /> },
    { label: "Countries Served", value: "45+", icon: <Globe className="w-5 h-5" /> },
    { label: "Years of Excellence", value: "8+", icon: <Award className="w-5 h-5" /> }
  ]

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Competitive Returns",
      description: "Access to institutional-grade investment strategies with proven track records"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Advanced market insights and portfolio performance tracking"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Diversified Strategies",
      description: "Multiple investment approaches to minimize risk and maximize returns"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal-based Investing",
      description: "Personalized investment plans tailored to your financial objectives"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChronosTimeLogo />
            <span className="text-xl font-bold text-white">ChronosTime</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-cyan-400">
              Features
            </Button>
            <Button variant="ghost" className="text-white hover:text-cyan-400">
              Pricing
            </Button>
            <Button variant="ghost" className="text-white hover:text-cyan-400">
              About
            </Button>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Professional
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Investment</span>
              <br />
              Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Join thousands of professional investors using AI-powered strategies, 
              advanced analytics, and institutional-grade security to maximize returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 text-lg"
              >
                Start Trading Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-cyan-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose ChronosTime?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by financial professionals, for financial professionals. 
              Experience the future of investment management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`glass cursor-pointer transition-all duration-300 ${
                    activeFeature === index ? 'border-cyan-500/50 glow-cyan' : 'border-white/10'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        activeFeature === index ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-300 mb-3">{feature.description}</p>
                        <div className="text-sm text-cyan-400 font-semibold">{feature.stats}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:pl-8">
              <Card className="glass glow-cyan">
                <CardContent className="p-8">
                  <div className="text-cyan-400 mb-4">
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-300 mb-6 text-lg">
                    {features[activeFeature].description}
                  </p>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="text-cyan-400 font-semibold text-lg">
                      {features[activeFeature].stats}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Key Benefits
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need for successful investing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass border-white/10 text-center">
                <CardContent className="p-6">
                  <div className="text-cyan-400 mb-4 flex justify-center">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-300 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-300">
              See what industry experts say about ChronosTime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                        <div className="text-sm text-cyan-400">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Investment Strategy?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professional investors who trust ChronosTime for their portfolio management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 text-lg"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChronosTimeLogo />
                <span className="text-xl font-bold text-white">ChronosTime</span>
              </div>
              <p className="text-gray-400">
                Professional investment platform for the modern investor.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400">Security</a></li>
                <li><a href="#" className="hover:text-cyan-400">API</a></li>
                <li><a href="#" className="hover:text-cyan-400">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400">Help Center</a></li>
                <li><a href="#" className="hover:text-cyan-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-cyan-400">Status</a></li>
                <li><a href="#" className="hover:text-cyan-400">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-cyan-400">Compliance</a></li>
                <li><a href="#" className="hover:text-cyan-400">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ChronosTime. All rights reserved. Licensed and regulated.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}