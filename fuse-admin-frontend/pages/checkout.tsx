import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Check,
  CreditCard,
  Shield,
  Lock,
  Clock,
  Building2,
  Sparkles,
  Settings
} from 'lucide-react'
import Layout from '@/components/Layout'

interface CheckoutData {
  planType: string
  planName: string
  planPrice: number
  onboardingType: string
  onboardingName: string
  onboardingPrice: number
  totalAmount: number
}

const onboardingIcons = {
  standard: Building2,
  'high-definition': Sparkles,
  custom: Settings
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Get checkout data from query params
    const { 
      planType, 
      planName, 
      planPrice, 
      onboardingType, 
      onboardingName, 
      onboardingPrice 
    } = router.query

    if (planType && planName && planPrice && onboardingType && onboardingName && onboardingPrice) {
      const planPriceNum = parseInt(planPrice as string)
      const onboardingPriceNum = parseInt(onboardingPrice as string)
      
      setCheckoutData({
        planType: planType as string,
        planName: planName as string,
        planPrice: planPriceNum,
        onboardingType: onboardingType as string,
        onboardingName: onboardingName as string,
        onboardingPrice: onboardingPriceNum,
        totalAmount: planPriceNum + onboardingPriceNum
      })
    } else {
      // Redirect back if missing data
      router.push('/plans')
    }
  }, [router.query])

  const handleCompleteCheckout = async () => {
    if (!checkoutData || !user) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planType: checkoutData.planType,
          onboardingType: checkoutData.onboardingType,
          totalAmount: checkoutData.totalAmount,
          items: [
            {
              name: checkoutData.planName,
              price: checkoutData.planPrice,
              quantity: 1,
              type: 'subscription'
            },
            {
              name: checkoutData.onboardingName,
              price: checkoutData.onboardingPrice,
              quantity: 1,
              type: 'onetime'
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl

    } catch (error) {
      console.error('Checkout error:', error)
      // Handle error - show toast or error message
    } finally {
      setIsProcessing(false)
    }
  }

  if (!checkoutData) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const OnboardingIcon = onboardingIcons[checkoutData.onboardingType as keyof typeof onboardingIcons] || Building2

  return (
    <Layout>
      <Head>
        <title>Checkout - Fuse Health</title>
        <meta name="description" content="Complete your Fuse Health setup" />
      </Head>
      
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Secure checkout</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="order-2 lg:order-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Plan */}
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{checkoutData.planName} Plan</h3>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${checkoutData.planPrice.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>

                  {/* Onboarding Package */}
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <OnboardingIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{checkoutData.onboardingName}</h3>
                      <p className="text-sm text-muted-foreground">One-time onboarding fee</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${checkoutData.onboardingPrice.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">one-time</div>
                    </div>
                  </div>

                  <div className="border-t border-border"></div>

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly subscription</span>
                      <span>${checkoutData.planPrice.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Onboarding setup</span>
                      <span>${checkoutData.onboardingPrice.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Due today</span>
                      <span>${checkoutData.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2 mt-3">
                      <p className="text-xs text-muted-foreground">
                        Includes first month + onboarding setup
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Month 1 billing begins when your site is live • 1% transaction fee applies to patient orders
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Payment details
                  </h1>
                  <p className="text-muted-foreground">
                    Complete your payment to get started today
                  </p>
                </div>

                {/* Payment Form */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6 space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Contact information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            className="w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">First name</label>
                            <Input 
                              type="text" 
                              placeholder="First name"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Last name</label>
                            <Input 
                              type="text" 
                              placeholder="Last name"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Payment method</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Card number</label>
                          <div className="relative">
                            <Input 
                              type="text" 
                              placeholder="1234 1234 1234 1234"
                              className="w-full pr-12"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <CreditCard className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Expiry date</label>
                            <Input 
                              type="text" 
                              placeholder="MM / YY"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Security code</label>
                            <Input 
                              type="text" 
                              placeholder="CVC"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Cardholder name</label>
                          <Input 
                            type="text" 
                            placeholder="Name on card"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Billing address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Country or region</label>
                          <Input 
                            type="text" 
                            placeholder="United States"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                          <Input 
                            type="text" 
                            placeholder="Address"
                            className="w-full"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">City</label>
                            <Input 
                              type="text" 
                              placeholder="City"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">State</label>
                            <Input 
                              type="text" 
                              placeholder="State"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">ZIP code</label>
                            <Input 
                              type="text" 
                              placeholder="ZIP"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleCompleteCheckout}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing payment...
                    </>
                  ) : (
                    <>
                      Get started today - ${checkoutData.totalAmount.toLocaleString()}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By completing your purchase, you agree to our terms of service and privacy policy.
                  Your subscription will auto-renew monthly and can be cancelled anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
