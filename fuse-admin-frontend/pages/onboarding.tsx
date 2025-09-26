import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Monitor,
  Sparkles,
  Settings,
  Clock,
  Shield,
  CreditCard,
  AlertCircle,
  Check
} from 'lucide-react'
import Layout from '@/components/Layout'

interface OnboardingOption {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  icon: any
  recommended?: boolean
}

interface PlanData {
  planType: string
  planName: string
  planPrice: number
}

const onboardingOptions: OnboardingOption[] = [
  {
    id: 'standard',
    name: 'Standard Build',
    description: 'Launch fast with Fuse doctors and pharmacies connected to your brand-ready static site or existing web presence.',
    price: 3000,
    features: [
      'Go-live in under 30 days',
      'Fuse platform + telehealth physician configuration',
      'Branded static info page or website hand-off',
      'Initial data + provider import',
      'Live training for your patient and support teams'
    ],
    icon: Monitor
  },
  {
    id: 'high-definition',
    name: 'High Definition',
    description: 'Elevated design, richer content, and automation to convert patients for telehealth services from day one.',
    price: 5000,
    features: [
      'Everything in Standard',
      'Custom multi-section marketing site',
      'Conversion copy and photography direction',
      'Advanced workflow + automation build-out',
      '60-day optimization + analytics review'
    ],
    icon: Sparkles,
    recommended: true
  },
  {
    id: 'custom',
    name: 'Custom Implementation',
    description: 'Enterprise rollout with LegitScript certification, bespoke integrations, and multi-brand support included.',
    price: 20000,
    features: [
      'Technical discovery + architecture sprint',
      'Full LegitScript certification submission',
      'Complex integration & data migration plan',
      'Multi-location / multi-brand configuration',
      'Stakeholder training and executive launch workshop'
    ],
    icon: Settings
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [planData, setPlanData] = useState<PlanData | null>(null)

  useEffect(() => {
    // Get plan data from query params or sessionStorage
    const planType = router.query.planType as string
    const planName = router.query.planName as string
    const planPrice = router.query.planPrice as string

    if (planType && planName && planPrice) {
      setPlanData({
        planType,
        planName,
        planPrice: parseInt(planPrice)
      })
    } else {
      // Redirect back to plans if no plan data
      router.push('/plans')
    }
  }, [router.query])

  const handleSelectOnboarding = async (optionId: string) => {
    if (!planData) return

    const selectedOnboarding = onboardingOptions.find(opt => opt.id === optionId)
    if (!selectedOnboarding) return

    try {
      // Save onboarding selection to user profile
      const token = localStorage.getItem('token')
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            selectedOnboardingType: optionId,
            selectedOnboardingName: selectedOnboarding.name,
            selectedOnboardingPrice: selectedOnboarding.price,
            onboardingSelectionTimestamp: new Date().toISOString()
          })
        })
      }

      // Navigate to checkout page with all metadata
      router.push({
        pathname: '/checkout',
        query: {
          planType: planData.planType,
          planName: planData.planName,
          planPrice: planData.planPrice,
          onboardingType: optionId,
          onboardingName: selectedOnboarding.name,
          onboardingPrice: selectedOnboarding.price
        }
      })
    } catch (error) {
      console.error('Error saving onboarding selection:', error)
      // Still navigate even if saving fails
      router.push({
        pathname: '/checkout',
        query: {
          planType: planData.planType,
          planName: planData.planName,
          planPrice: planData.planPrice,
          onboardingType: optionId,
          onboardingName: selectedOnboarding.name,
          onboardingPrice: selectedOnboarding.price
        }
      })
    }
  }

  if (!planData) {
    return <div>Loading...</div>
  }

  return (
    <Layout>
      <Head>
        <title>Choose Your Onboarding Experience - Fuse Health</title>
        <meta name="description" content="Select your onboarding experience" />
      </Head>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/plans')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to platform plans
            </Button>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Fuse Admin Platform
            </Badge>
          </div>

          {/* Hero Section - Matching plans page style */}
          <div className="text-center mb-16">
            {/* Social Proof Bar */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>500+ clinics powered</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>HIPAA compliant</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Launch in 1-2 weeks</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Talk to expert
              </Button>
            </div>

            {/* Main Hero Content */}
            <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
              Your <span className="text-orange-500">revenue engine</span> setup
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Select your launch package below. From zero to first patient in 14 days.
            </p>
            
          </div>


          {/* Onboarding Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {onboardingOptions.map((option) => (
              <Card 
                key={option.id}
                className={`relative group cursor-pointer transition-all duration-300 flex flex-col ${
                  option.recommended 
                    ? 'shadow-xl scale-105 border-primary hover:shadow-2xl hover:scale-110 hover:border-primary/80' 
                    : 'border-muted hover:shadow-xl hover:scale-105 hover:border-primary'
                }`}
              >
                {option.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-medium">
                      MOST SELECTED
                    </Badge>
                  </div>
                )}


                <CardHeader className="pt-12 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <option.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{option.name}</CardTitle>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold">${option.price.toLocaleString()}</span>
                      <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">one-time</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-3 mb-8 flex-grow">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>


                  <Button 
                    className={`w-full mt-auto transition-colors ${
                      option.id === 'standard' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : option.id === 'high-definition'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectOnboarding(option.id)}
                  >
                    {option.id === 'custom' ? (
                      <>
                        Book Strategy Call
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : option.recommended ? (
                      <>
                        Start Earning in 14 Days
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Quick Launch Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section - Matching plans page style */}
          <div className="max-w-5xl mx-auto mt-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">What happens next</h2>
              <p className="text-muted-foreground">Your complete setup timeline</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">Secure Payment</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Complete your setup with secure Stripe checkout processing
                    </p>
                    <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                      <span>Safe & secure</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">Schedule onboarding call</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We configure your platform and connect all partners
                    </p>
                    <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                      <span>Full configuration</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">Go Live</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Launch your telehealth practice and start treating patients
                    </p>
                    <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                      <span>Ready to launch</span>
                      <Check className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
