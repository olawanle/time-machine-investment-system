"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Star,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Wallet,
  RefreshCw,
  Calculator
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface MachineTemplate {
  id: string
  machine_type: string
  name: string
  description: string
  base_price: number
  base_reward: number
  claim_interval_hours: number
  roi_percentage: number
  max_level: number
  icon_url: string
  is_available: boolean
  tier: string
  metrics: {
    daily_reward: number
    weekly_reward: number
    monthly_reward: number
    yearly_reward: number
    payback_days: number
    claim_frequency: string
  }
}

interface DatabaseMarketplaceProps {
  user: any
  onUserUpdate: (user: any) => void
}

export function DatabaseMarketplace({ user, onUserUpdate }: DatabaseMarketplaceProps) {
  const [templates, setTemplates] = useState<MachineTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>({})
  const { theme } = useTheme()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/machines/templates')
      const result = await response.json()
      
      if (result.success) {
        setTemplates(result.data.templates)
      } else {
        setError(result.error || 'Failed to fetch machine templates')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setError('Failed to load marketplace')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (template: MachineTemplate) => {
    setError("")
    setSuccess("")
    setPurchasing(template.id)

    try {
      const investmentAmount = parseFloat(customAmounts[template.id] || template.base_price.toString())
      
      if (investmentAmount < template.base_price) {
        setError(`Minimum investment for ${template.name} is $${template.base_price}`)
        return
      }

      if (investmentAmount > user.balance) {
        setError('Insufficient balance')
        return
      }

      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          machine_type: template.machine_type,
          investment_amount: investmentAmount
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to purchase machine')
      }

      setSuccess(`Successfully purchased ${template.name} for $${investmentAmount}!`)
      
      // Update user balance
      const updatedUser = {
        ...user,
        balance: result.new_balance
      }
      onUserUpdate(updatedUser)

      // Clear custom amount
      setCustomAmounts(prev => ({ ...prev, [template.id]: '' }))

      // Auto-hide success message
      setTimeout(() => setSuccess(""), 5000)

    } catch (error: any) {
      setError(error.message || 'Failed to purchase machine')
    } finally {
      setPurchasing(null)
    }
  }

  const getMachineImage = (machineType: string) => {
    const isDarkMode = theme === 'dark'
    const images: { [key: string]: string } = {
      'basic_miner': isDarkMode ? "/time black 1.png" : "/time 1.png",
      'advanced_miner': isDarkMode ? "/time black 2.png" : "/time 2.png",
      'premium_miner': isDarkMode ? "/time black 3.png" : "/time 3.png",
      'elite_miner': isDarkMode ? "/time black 4.png" : "/time 4.png",
      'quantum_miner': isDarkMode ? "/time black 5.png" : "/time 5.png"
    }
    return images[machineType] || images['basic_miner']
  }

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      'bronze': "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300",
      'silver': "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-300",
      'gold': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300",
      'platinum': "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300"
    }
    return colors[tier] || colors['bronze']
  }

  const getTierGradient = (tier: string) => {
    const gradients: { [key: string]: string } = {
      'bronze': "from-orange-500/10 to-amber-500/10 border-orange-500/20",
      'silver': "from-gray-500/10 to-slate-500/10 border-gray-500/20",
      'gold': "from-yellow-500/10 to-amber-500/10 border-yellow-500/20",
      'platinum': "from-purple-500/10 to-indigo-500/10 border-purple-500/20"
    }
    return gradients[tier] || gradients['bronze']
  }

  const calculateCustomRewards = (template: MachineTemplate, customAmount: number) => {
    const multiplier = customAmount / template.base_price
    return {
      daily: (template.metrics.daily_reward * multiplier).toFixed(2),
      weekly: (template.metrics.weekly_reward * multiplier).toFixed(2),
      monthly: (template.metrics.monthly_reward * multiplier).toFixed(2),
      yearly: (template.metrics.yearly_reward * multiplier).toFixed(2)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Time Machine Marketplace</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Invest in cutting-edge time machines to generate passive income. Each machine provides regular rewards based on your investment.
        </p>
        
        {/* User Balance */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Available Balance:</span>
          <span className="text-lg font-bold text-primary">${user.balance?.toLocaleString() || '0'}</span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const customAmount = parseFloat(customAmounts[template.id] || template.base_price.toString())
          const customRewards = calculateCustomRewards(template, customAmount)
          
          return (
            <Card 
              key={template.id} 
              className={`bg-gradient-to-br ${getTierGradient(template.tier)} hover:shadow-lg transition-all duration-300 hover:scale-105`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <Badge className={getTierColor(template.tier)}>
                    {template.tier.charAt(0).toUpperCase() + template.tier.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Machine Image */}
                <div className="flex justify-center">
                  <Image
                    src={getMachineImage(template.machine_type)}
                    alt={template.name}
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>

                {/* Investment Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Investment Amount (USD)</label>
                  <Input
                    type="number"
                    min={template.base_price}
                    step="0.01"
                    placeholder={`Min: $${template.base_price}`}
                    value={customAmounts[template.id] || ''}
                    onChange={(e) => setCustomAmounts(prev => ({ 
                      ...prev, 
                      [template.id]: e.target.value 
                    }))}
                    className="text-center font-semibold"
                  />
                </div>

                {/* Rewards Display */}
                <div className="bg-background/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Projected Returns</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">Daily</div>
                      <div className="font-semibold text-green-600">${customRewards.daily}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Weekly</div>
                      <div className="font-semibold text-green-600">${customRewards.weekly}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Monthly</div>
                      <div className="font-semibold text-green-600">${customRewards.monthly}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Yearly</div>
                      <div className="font-semibold text-green-600">${customRewards.yearly}</div>
                    </div>
                  </div>
                </div>

                {/* Machine Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI:</span>
                    <span className="font-semibold text-blue-600">{template.roi_percentage}% annually</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Claim Frequency:</span>
                    <span className="font-semibold">Every {template.claim_interval_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payback Period:</span>
                    <span className="font-semibold">{Math.ceil(customAmount / parseFloat(customRewards.daily))} days</span>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(template)}
                  disabled={
                    purchasing === template.id || 
                    customAmount < template.base_price || 
                    customAmount > (user.balance || 0)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  {purchasing === template.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase for ${customAmount.toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Validation Messages */}
                {customAmount < template.base_price && (
                  <p className="text-xs text-red-600 text-center">
                    Minimum investment: ${template.base_price}
                  </p>
                )}
                {customAmount > (user.balance || 0) && (
                  <p className="text-xs text-red-600 text-center">
                    Insufficient balance
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Section */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Investment Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Higher investments in the same machine type yield proportionally higher rewards</li>
            <li>• Diversify across different tiers to balance risk and reward</li>
            <li>• Premium and Elite machines offer better ROI but require larger investments</li>
            <li>• Claims are available every 24 hours - set reminders to maximize earnings</li>
            <li>• Reinvest your earnings to compound your returns over time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}