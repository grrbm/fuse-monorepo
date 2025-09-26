import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  Check, 
  AlertCircle,
  ArrowRight,
  Building2,
  Shield
} from 'lucide-react'
import Layout from '@/components/Layout'

interface PlanFeatures {
  maxProducts: number
  maxCampaigns: number
  analyticsAccess: boolean
  customerSupport: string
  customBranding: boolean
  apiAccess?: boolean
  whiteLabel?: boolean
  customIntegrations?: boolean
}

interface Plan {
  name: string
  price: number
  features: PlanFeatures
  stripePriceId: string
}

interface Plans {
  starter: Plan
  professional: Plan
  enterprise: Plan
}

interface Subscription {
  id: string
  planType: string
  status: string
  monthlyPrice: number
  currentPeriodStart?: string
  currentPeriodEnd?: string
  daysUntilRenewal: number
  isActive: boolean
  isTrialing: boolean
  planDetails: Plan
}

export default function Plans() {
  const [plans, setPlans] = useState<Plans | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingCheckout, setCreatingCheckout] = useState<string | null>(null)
  const { user, token } = useAuth()
  const router = useRouter()

  // Handle success/cancel parameters
  useEffect(() => {
    const { success, canceled, session_id } = router.query
    
    if (success === 'true') {
      setError(null)
      setTimeout(() => {
        router.replace('/plans', undefined, { shallow: true })
      }, 3000)
    }
    
    if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.')
      setTimeout(() => {
        router.replace('/plans', undefined, { shallow: true })
      }, 3000)
    }
  }, [router.query])

  // Fetch plans and current subscription from backend API
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

      try {
        setLoading(true)
        
        // Fetch available plans from backend
        const plansResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-subscriptions/plans`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          setPlans(plansData.plans)
        }

        // Fetch current subscription from backend
        const subResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-subscriptions/current`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (subResponse.ok) {
          const subData = await subResponse.json()
          if (subData.success && subData.subscription) {
            setCurrentSubscription(subData.subscription)
          }
        } else if (subResponse.status !== 404) {
          console.error('Failed to fetch subscription')
        }

      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleSelectPlan = async (planType: string) => {
    if (!token) return

    const planData = {
      starter: { name: 'Standard', price: 1500 },
      professional: { name: 'Controlled Substances', price: 2500 }
    }

    const selectedPlan = planData[planType as keyof typeof planData]
    
    if (selectedPlan) {
      try {
        // Save plan selection to user profile
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            selectedPlanType: planType,
            selectedPlanName: selectedPlan.name,
            selectedPlanPrice: selectedPlan.price,
            planSelectionTimestamp: new Date().toISOString()
          })
        })

        // Navigate to onboarding page with plan data
        router.push({
          pathname: '/onboarding',
          query: {
            planType,
            planName: selectedPlan.name,
            planPrice: selectedPlan.price
          }
        })
      } catch (error) {
        console.error('Error saving plan selection:', error)
        // Still navigate even if saving fails
        router.push({
          pathname: '/onboarding',
          query: {
            planType,
            planName: selectedPlan.name,
            planPrice: selectedPlan.price
          }
        })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>
      case 'payment_due':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertCircle className="h-3 w-3 mr-1" /> Payment Due</Badge>
      case 'past_due':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Past Due</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscription plans...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Subscription Plans - Fuse</title>
        <meta name="description" content="Choose your brand subscription plan" />
      </Head>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
            {/* Hero Section - Conversion Optimized */}
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
                  <span>Launch in 2 weeks</span>
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
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                Turn Your Clinic Into a
                <span className="text-orange-500 block">Telehealth Powerhouse</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Your brand + Licensed physicians + Pharmacies = 
                <span className="font-semibold text-foreground">Recurring revenue</span>
              </p>

            </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {router.query.success === 'true' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-green-700">Subscription created successfully! Welcome to Fuse Brand Partners.</p>
              </div>
            </div>
          )}

          {/* Current Subscription */}
          {currentSubscription && (
            <Card className="mb-8 border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Subscription
                    </CardTitle>
                  </div>
                  {getStatusBadge(currentSubscription.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {currentSubscription.planDetails?.name} Plan
                    </h3>
                    <p className="text-2xl font-bold text-primary">${currentSubscription.monthlyPrice}/month</p>
                  </div>
                  
                  {currentSubscription.isActive && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next billing date</p>
                      <p className="font-medium">
                        {new Date(currentSubscription.currentPeriodEnd!).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ({currentSubscription.daysUntilRenewal} days remaining)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans Grid - Only show Standard and Controlled Substances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Standard Plan - Permanent elevation with enhanced hover */}
            <Card className="relative group cursor-pointer transition-all duration-300 shadow-xl scale-105 border-primary hover:shadow-2xl hover:scale-110 hover:border-primary/80 flex flex-col">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground font-medium">
                  MOST POPULAR
                </Badge>
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Monthly
                </Badge>
              </div>
              
              <CardHeader className="pt-12 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5" />
                  <CardTitle className="text-xl font-semibold">Standard</CardTitle>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$1,500</span>
                  <span className="text-muted-foreground"> / month</span>
                  <div className="text-xs text-muted-foreground mt-1">+ 1% transaction fee</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Core software to manage patient journeys, connect with Fuse telehealth
                  physicians, and automate pharmacy fulfillment.
                </p>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Ideal for wellness, aesthetics, weight-loss, and lifestyle telehealth brands that don't require controlled scripts.</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors mt-auto"
                  onClick={() => handleSelectPlan('starter')}
                  disabled={
                    !!creatingCheckout || 
                    (currentSubscription?.planType === 'starter' && currentSubscription?.isActive)
                  }
                >
                  {creatingCheckout === 'starter' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : currentSubscription?.planType === 'starter' && currentSubscription?.isActive ? (
                    'Current Plan'
                  ) : (
                    <>
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Controlled Substances Plan - Only hover effects on interaction */}
            <Card className="relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary flex flex-col border-muted">
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Monthly
                </Badge>
              </div>
              
              <CardHeader className="pt-12 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle className="text-xl font-semibold">Controlled Substances</CardTitle>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$2,500</span>
                  <span className="text-muted-foreground"> / month</span>
                  <div className="text-xs text-muted-foreground mt-1">+ 1% transaction fee</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Everything in the standard package plus the workflows you need to
                  prescribe regulated therapies through Fuse doctors and pharmacies.
                </p>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perfect for clinics offering TRT (testosterone replacement), growth hormone releasing peptides, and other Schedule III therapies that require licensed prescribers.</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors mt-auto"
                  onClick={() => handleSelectPlan('professional')}
                  disabled={
                    !!creatingCheckout || 
                    (currentSubscription?.planType === 'professional' && currentSubscription?.isActive)
                  }
                >
                  {creatingCheckout === 'professional' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : currentSubscription?.planType === 'professional' && currentSubscription?.isActive ? (
                    'Current Plan'
                  ) : (
                    <>
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Key Benefits Section - Enhanced UX */}
          <div className="max-w-5xl mx-auto mt-16">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Why clinics choose Fuse</h2>
              <p className="text-muted-foreground">Everything you need to scale your telehealth practice</p>
            </div>

            {/* Benefits Grid - Clean Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Recurring Revenue */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">Recurring Revenue</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Build predictable monthly income that grows with your patient base
                  </p>
                  <div className="inline-flex items-center text-xs font-medium text-blue-600">
                    <span>Monthly Recurring Revenue</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>

              {/* Fast Setup */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">1-2 Week Setup</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    From signup to treating your first patient in record time
                  </p>
                  <div className="inline-flex items-center text-xs font-medium text-blue-600">
                    <span>Get started today</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>

              {/* Zero Risk */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">Zero Compliance Risk</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Licensed physicians handle everything—you focus on growth
                  </p>
                  <div className="inline-flex items-center text-xs font-medium text-blue-600">
                    <span>HIPAA compliant</span>
                    <Check className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>

              {/* Transparent Pricing */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">Transparent Pricing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Simple monthly fee + 1% transaction rate. No hidden costs or surprises
                  </p>
                  <div className="inline-flex items-center text-xs font-medium text-blue-600">
                    <span>Industry standard rates</span>
                    <Check className="w-3 h-3 ml-1" />
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