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
  planType?: string
  features: PlanFeatures
  stripePriceId: string
}

interface PlansResponse {
  [key: string]: Plan
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
  const [plans, setPlans] = useState<PlansResponse | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [creatingCheckout, setCreatingCheckout] = useState<string | null>(null)
  const { user, token, hasActiveSubscription, refreshSubscription, authenticatedFetch } = useAuth()
  const router = useRouter()

  // Handle URL messages
  useEffect(() => {
    if (router.query.message) {
      setMessage(router.query.message as string)
    }
  }, [router.query.message])

  // Handle success/cancel parameters
  useEffect(() => {
    const { success, canceled } = router.query

    if (success === 'true') {
      setError(null)
      refreshSubscription().finally(() => {
        router.replace('/settings?message=Subscription activated successfully!', undefined, { shallow: true })
      })
    }

    if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.')
      setTimeout(() => {
        router.replace('/plans', undefined, { shallow: true })
      }, 3000)
    }
  }, [router.query, refreshSubscription, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

      try {
        setLoading(true)

        const plansResponse = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/plans`,
          { method: 'GET' }
        )

        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          if (plansData.success && plansData.plans) {
            const plansObject = plansData.plans.reduce((acc: PlansResponse, plan: any) => {
              acc[plan.planType] = {
                name: plan.name,
                price: plan.monthlyPrice,
                planType: plan.planType,
                features: plan.features,
                stripePriceId: plan.stripePriceId
              }
              return acc
            }, {} as PlansResponse)
            setPlans(plansObject)
          }
        }

        const subResponse = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/current`,
          { method: 'GET', skipLogoutOn401: true }
        )

        if (subResponse.status === 401) {
          setCurrentSubscription(null)
        } else if (subResponse.ok) {
          const subData = await subResponse.json()
          if (subData && subData.status) {
            setCurrentSubscription({
              id: subData.id,
              planType: subData.plan?.type || subData.planType,
              status: subData.status,
              monthlyPrice: subData.plan?.price || subData.monthlyPrice || 0,
              currentPeriodStart: subData.currentPeriodStart,
              currentPeriodEnd: subData.nextBillingDate,
              daysUntilRenewal: 0,
              isActive: subData.status === 'active',
              isTrialing: subData.status === 'trialing',
              planDetails: subData.plan
            })
          } else {
            setCurrentSubscription(null)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, authenticatedFetch])

  const handleSelectPlan = async (planCategory: string) => {
    if (!token) {
      alert('You need to be signed in to select a plan.')
      return
    }

    const planMappings = {
      standard: {
        displayName: 'Standard',
        planType: 'standard_build',
        downpayment: {
          type: 'downpayment_standard',
          name: 'Discounted First Month',
          amount: 1500
        }
      },
      professional: {
        displayName: 'Controlled Substances',
        planType: 'high-definition',
        downpayment: {
          type: 'downpayment_professional',
          name: 'Discounted Professional First Month',
          amount: 2500
        }
      }
    } as const

    const mapping = planMappings[planCategory as keyof typeof planMappings]

    if (!mapping) {
      return
    }

    const downpaymentAmount = mapping.downpayment.amount

    try {
      setCreatingCheckout(planCategory)

      const payload = {
        selectedPlanCategory: planCategory,
        selectedPlanType: mapping.planType,
        selectedPlanName: mapping.displayName,
        selectedPlanPrice: downpaymentAmount,
        selectedDownpaymentType: mapping.downpayment.type,
        selectedDownpaymentName: mapping.downpayment.name,
        selectedDownpaymentPrice: downpaymentAmount,
        planSelectionTimestamp: new Date().toISOString()
      }

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        alert('Plan selection failed. Status: ' + response.status)
        setCreatingCheckout(null)
        return
      }

      const queryParams = new URLSearchParams({
        planCategory,
        subscriptionPlanType: mapping.planType,
        subscriptionPlanName: mapping.displayName,
        subscriptionMonthlyPrice: plans?.[mapping.planType]?.price?.toString() || String(mapping.downpayment.amount),
        downpaymentPlanType: mapping.downpayment.type,
        downpaymentName: mapping.downpayment.name,
        downpaymentAmount: String(mapping.downpayment.amount)
      })

      router.push(`/checkout?${queryParams.toString()}`)
    } catch (error) {
      alert('Error saving plan selection: ' + (error instanceof Error ? error.message : String(error)))
      setCreatingCheckout(null)
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
          {message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          <div className="text-center mb-16">
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

            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Turn Your Clinic Into a
              <span className="text-foreground block">Telehealth Powerhouse</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Your brand + Licensed physicians + Pharmacies =
              <span className="font-semibold text-foreground"> Recurring revenue</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {router.query.success === 'true' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-green-700">Subscription created successfully! Welcome to Fuse Brand Partners.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
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
                  <span className="text-3xl font-bold text-[#825AD1]">$1,500</span>
                  <span className="text-muted-foreground"> / month</span>
                  <div className="text-xs text-muted-foreground mt-1">+ 1% transaction fee</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Core software to manage patient journeys, connect with Fuse telehealth physicians, and automate pharmacy fulfillment.
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
                  onClick={() => handleSelectPlan('standard')}
                  disabled={
                    !!creatingCheckout ||
                    (currentSubscription?.planType === 'standard_build' && currentSubscription?.status === 'active')
                  }
                >
                  {creatingCheckout === 'standard' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : currentSubscription?.planType === 'standard_build' && currentSubscription?.status === 'active' ? (
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
                  <span className="text-3xl font-bold text-[#825AD1]">$2,500</span>
                  <span className="text-muted-foreground"> / month</span>
                  <div className="text-xs text-muted-foreground mt-1">+ 1% transaction fee</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Everything in the standard package plus the workflows you need to prescribe regulated therapies through Fuse doctors and pharmacies.
                </p>
              </CardHeader>

              <CardContent className="flex flex-col h-full">
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perfect for clinics offering TRT, growth hormone releasing peptides, and other Schedule III therapies that require licensed prescribers.</span>
                  </li>
                </ul>

                <Button
                  className="w-full bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors mt-auto"
                  onClick={() => handleSelectPlan('professional')}
                  disabled={
                    !!creatingCheckout ||
                    (currentSubscription?.planType === 'high-definition' && currentSubscription?.status === 'active')
                  }
                >
                  {creatingCheckout === 'professional' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : currentSubscription?.planType === 'high-definition' && currentSubscription?.status === 'active' ? (
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

          <div className="max-w-5xl mx-auto mt-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Why clinics choose Fuse</h2>
              <p className="text-muted-foreground">Everything you need to scale your telehealth practice</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-stretch">
              <div className="relative group h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-15 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Recurring Revenue</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                      Build predictable monthly income that grows with your patient base
                    </p>
                    <div className="flex items-center justify-center text-xs font-medium text-blue-600 mt-auto">
                      <span>Monthly Recurring Revenue</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-15 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">1-2 Week Setup</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                      From signup to treating your first patient in record time
                    </p>
                    <div className="flex items-center justify-center text-xs font-medium text-blue-600 mt-auto">
                      <span>Get started today</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-15 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Zero Compliance Risk</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                      Licensed physicians handle everything—you focus on growth
                    </p>
                    <div className="flex items-center justify-center text-xs font-medium text-blue-600 mt-auto">
                      <span>HIPAA compliant</span>
                      <Check className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-15 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Transparent Pricing</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                      Simple monthly fee + 1% transaction rate. No hidden costs or surprises
                    </p>
                    <div className="flex items-center justify-center text-xs font-medium text-blue-600 mt-auto">
                      <span>Industry standard rates</span>
                      <Check className="w-3 h-3 ml-1" />
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