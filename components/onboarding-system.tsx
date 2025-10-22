"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Zap, 
  DollarSign, 
  Users, 
  Target,
  Star,
  Play,
  Skip
} from "lucide-react"
import type { User } from "@/lib/storage"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingSystemProps {
  user: User
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingSystem({ user, onComplete, onSkip }: OnboardingSystemProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ChronosTime!',
      description: 'Your journey to time machine investment success starts here.',
      icon: <Star className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Welcome to ChronosTime!</h3>
            <p className="text-muted-foreground">
              You're about to embark on an exciting journey of time machine investment. 
              Let us guide you through the basics to get you started.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'investment',
      title: 'Make Your First Investment',
      description: 'Invest to unlock time machines that generate rewards.',
      icon: <DollarSign className="w-8 h-8 text-success" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-success" />
                  <div>
                    <h4 className="font-semibold text-foreground">How Investment Works</h4>
                    <p className="text-sm text-muted-foreground">Invest money to unlock time machines</p>
                  </div>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Minimum investment: $100</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Maximum 5 time machines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Each machine generates $20 rewards</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">Time Machine Benefits</h4>
                    <p className="text-sm text-muted-foreground">Unlock powerful earning potential</p>
                  </div>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>10-minute claim intervals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>5-minute claims with referrals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>24/7 automated earning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
      action: {
        label: 'Start Investing',
        onClick: () => {
          // Navigate to investment page
          console.log('Navigate to investment')
        }
      }
    },
    {
      id: 'referrals',
      title: 'Invite Friends for Bonuses',
      description: 'Get referral bonuses to speed up your time machines.',
      icon: <Users className="w-8 h-8 text-warning" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Referral System</h3>
            <p className="text-muted-foreground">
              Invite friends to boost your earning potential and help them get started too!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-foreground">0</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">No Referrals</h4>
                <p className="text-sm text-muted-foreground">10-minute claims</p>
              </CardContent>
            </Card>

            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-warning">1-2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Some Referrals</h4>
                <p className="text-sm text-muted-foreground">8-minute claims</p>
              </CardContent>
            </Card>

            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-success">3+</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">3+ Referrals</h4>
                <p className="text-sm text-muted-foreground">5-minute claims</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
      action: {
        label: 'Get Referral Code',
        onClick: () => {
          // Navigate to referrals page
          console.log('Navigate to referrals')
        }
      }
    },
    {
      id: 'achievements',
      title: 'Unlock Achievements',
      description: 'Complete milestones to earn bonus rewards and recognition.',
      icon: <Target className="w-8 h-8 text-info" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-info" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Achievement System</h3>
            <p className="text-muted-foreground">
              Track your progress and unlock special rewards as you reach milestones!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">Investment Achievements</h4>
                    <p className="text-sm text-muted-foreground">Reach investment milestones</p>
                  </div>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• First Investment ($100+)</li>
                  <li>• Big Investor ($1,000+)</li>
                  <li>• Whale Investor ($10,000+)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-success" />
                  <div>
                    <h4 className="font-semibold text-foreground">Machine Achievements</h4>
                    <p className="text-sm text-muted-foreground">Unlock all time machines</p>
                  </div>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• Time Traveler (1 machine)</li>
                  <li>• Machine Master (5 machines)</li>
                  <li>• Efficiency Expert (3+ referrals)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
      action: {
        label: 'View Achievements',
        onClick: () => {
          // Navigate to achievements page
          console.log('Navigate to achievements')
        }
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start your time machine investment journey now.',
      icon: <CheckCircle className="w-8 h-8 text-success" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Congratulations!</h3>
            <p className="text-muted-foreground mb-6">
              You now understand the basics of ChronosTime. Start investing to unlock your first time machine and begin earning rewards!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Ready to Invest?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Make your first investment to unlock time machines
                </p>
                <Button className="w-full btn-primary">
                  Start Investing
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-success mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Invite Friends</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Get referral bonuses to boost your earnings
                </p>
                <Button className="w-full bg-success hover:bg-success/90">
                  Get Referral Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-muted-foreground text-sm">{currentStepData.description}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}
        </CardContent>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button variant="ghost" onClick={handleSkip}>
              <Skip className="w-4 h-4 mr-2" />
              Skip Tour
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentStepData.action && (
              <Button 
                variant="outline" 
                onClick={currentStepData.action.onClick}
                className="mr-2"
              >
                {currentStepData.action.label}
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}


