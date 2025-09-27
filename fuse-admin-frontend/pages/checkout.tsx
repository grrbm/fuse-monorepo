import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Shield,
  Lock,
  Building2,
  Star,
  Users
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import Layout from '@/components/Layout'

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
console.log('🔑 Stripe publishable key loaded:', stripePublishableKey ? 'YES' : 'NO')
const stripePromise = loadStripe(stripePublishableKey)

interface CheckoutData {
  planCategory: string
  planType: string
  planName: string
  planPrice: number
  onboardingType: string
  onboardingName: string
  onboardingPrice: number
  totalAmount: number
  subscriptionMonthlyPrice?: number
  downpaymentPlanType?: string
  downpaymentName?: string
}

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
}

// Checkout form component that uses Stripe hooks
function CheckoutForm({ checkoutData, paymentData, token, onSuccess, onError }: {
  checkoutData: CheckoutData
  paymentData: any
  token: string | null
  onSuccess: () => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🔍 handleSubmit called')
    console.log('🔍 Stripe loaded:', !!stripe)
    console.log('🔍 Elements loaded:', !!elements)
    console.log('🔍 Token available:', !!token)

    if (!stripe || !elements) {
      const errorMsg = 'Stripe has not loaded yet.'
      console.error('❌', errorMsg)
      onError(errorMsg)
      return
    }

    if (!token) {
      const errorMsg = 'User not authenticated.'
      console.error('❌', errorMsg)
      onError(errorMsg)
      return
    }

    setIsProcessing(true)
    setCardError('')

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement)
      console.log('🔍 CardElement found:', !!cardElement)

      if (!cardElement) {
        const errorMsg = 'Card element not found'
        console.error('❌', errorMsg)
        onError(errorMsg)
        return
      }

      console.log('🔍 Creating payment method...')
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${paymentData.firstName} ${paymentData.lastName}`,
          email: paymentData.email,
          phone: paymentData.phone,
        },
      })

      console.log('🔍 Payment method result:', { error: paymentMethodError, paymentMethod: paymentMethod?.id })

      if (paymentMethodError) {
        const errorMsg = paymentMethodError.message || 'An error occurred with your card.'
        console.error('❌ Payment method error:', paymentMethodError)
        setCardError(errorMsg)
        onError(errorMsg)
        return
      }

      if (!paymentMethod) {
        const errorMsg = 'Failed to create payment method'
        console.error('❌', errorMsg)
        onError(errorMsg)
        return
      }

      // Confirm payment intent
      console.log('🔍 Confirming payment intent...')
      console.log('🔍 Payment method ID:', paymentMethod.id)
      console.log('🔍 Plan type:', checkoutData.planType)
      console.log('🔍 Amount:', checkoutData.planPrice)

      const response = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planType: checkoutData.planType,
          planCategory: checkoutData.planCategory,
          downpaymentPlanType: checkoutData.downpaymentPlanType,
          amount: checkoutData.planPrice,
          currency: 'usd'
        })
      })

      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMsg = errorData.message || `Payment confirmation failed: ${response.statusText}`
        console.error('❌ Payment confirmation error:', errorData)
        throw new Error(errorMsg)
      }

      const { clientSecret, requiresAction, subscription, subscriptionId } = await response.json()
      console.log('🔍 Subscription confirmation response:', { clientSecret: !!clientSecret, requiresAction, subscription, subscriptionId })

      if (requiresAction && clientSecret) {
        // Handle 3D Secure or other authentication
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret)

        if (confirmError) {
          setCardError(confirmError.message || 'Payment authentication failed.')
          onError(confirmError.message || 'Payment failed')
          return
        }
      }

      // Subscription created successfully
      console.log('✅ Subscription created successfully:', subscriptionId)
      onSuccess()

    } catch (error: any) {
      console.error('Payment error:', error)
      const errorMessage = error.message || 'An unexpected error occurred'
      setCardError(errorMessage)
      onError(errorMessage)
      // Show alert to user
      alert(`Payment failed: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Contact information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email address</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={paymentData.email}
              onChange={(e) => paymentData.setEmail(e.target.value)}
              autoComplete="email"
              className="w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First name</label>
              <Input
                type="text"
                placeholder="First name"
                value={paymentData.firstName}
                onChange={(e) => paymentData.setFirstName(e.target.value)}
                autoComplete="given-name"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last name</label>
              <Input
                type="text"
                placeholder="Last name"
                value={paymentData.lastName}
                onChange={(e) => paymentData.setLastName(e.target.value)}
                autoComplete="family-name"
                className="w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone number</label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={paymentData.phone}
              onChange={(e) => paymentData.setPhone(e.target.value)}
              autoComplete="tel"
              className="w-full"
              required
            />
          </div>
        </div>
      </div>

      {/* Stripe Elements Card Form */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Payment method
        </h3>
        <div className="border rounded-lg p-4">
          <CardElement options={cardElementOptions} />
          {cardError && (
            <div className="mt-2 text-sm text-red-600">
              {cardError}
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-4">
        <div className="flex items-center gap-2">
          <span>By proceeding, you agree to our</span>
          <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">Terms & Conditions</a>
          <span>and</span>
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            <span>Pay ${checkoutData.planPrice.toLocaleString()} & Get Started</span>
          </>
        )}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-sm font-medium">
          ✅ Onboarding path decided during your call
        </p>
        <p className="text-xs text-muted-foreground">
          Additional onboarding fees only charged if you select them during your call. No hidden costs.
        </p>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin?redirect=' + encodeURIComponent(router.asPath))
    }
  }, [user, isLoading, router])
  const [paymentData, setPaymentData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    setEmail: (value: string) => setPaymentData(prev => ({ ...prev, email: value })),
    setFirstName: (value: string) => setPaymentData(prev => ({ ...prev, firstName: value })),
    setLastName: (value: string) => setPaymentData(prev => ({ ...prev, lastName: value })),
    setPhone: (value: string) => setPaymentData(prev => ({ ...prev, phone: value }))
  })

  useEffect(() => {
    // Wait for auth to load and check if user is authenticated
    if (isLoading) return

    if (!user) {
      // User not authenticated, redirect handled by other useEffect
      return
    }

    // Get checkout data from query params
    const {
      planCategory,
      planType,
      planName,
      planPrice,
      onboardingType,
      onboardingName,
      onboardingPrice,
      subscriptionMonthlyPrice,
      downpaymentPlanType,
      downpaymentName
    } = router.query

    if (planCategory && planType && planName && planPrice && onboardingType && onboardingName && onboardingPrice) {
      const planPriceNum = parseInt(planPrice as string)
      const onboardingPriceNum = parseInt(onboardingPrice as string)

      setCheckoutData({
        planCategory: planCategory as string,
        planType: planType as string,
        planName: planName as string,
        planPrice: planPriceNum,
        onboardingType: onboardingType as string,
        onboardingName: onboardingName as string,
        onboardingPrice: onboardingPriceNum,
        totalAmount: planPriceNum + onboardingPriceNum,
        subscriptionMonthlyPrice: subscriptionMonthlyPrice ? parseInt(subscriptionMonthlyPrice as string) : undefined,
        downpaymentPlanType: downpaymentPlanType as string,
        downpaymentName: downpaymentName as string
      })

      // Create payment intent
      createPaymentIntent(planType as string, planPriceNum)
    } else {
      // Redirect back if missing data
      router.push('/plans')
    }
  }, [router.query, user, isLoading])

  const createPaymentIntent = async (planType: string, amount: number) => {
    try {
      if (!token) {
        throw new Error('User not authenticated. Please log in again.')
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planType,
          amount,
          currency: 'usd'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      // Show error message to user
      alert(`Payment setup failed: ${error.message}`)
      // Redirect to plans page on error
      router.push('/plans')
    }
  }

  const handlePaymentSuccess = () => {
    router.push('/plans?success=true&payment_intent=completed')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    // You could show a toast notification here
  }

  // Auto-populate user data when user is available
  useEffect(() => {
    if (user) {
      setPaymentData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        setEmail: (value: string) => setPaymentData(prev => ({ ...prev, email: value })),
        setFirstName: (value: string) => setPaymentData(prev => ({ ...prev, firstName: value })),
        setLastName: (value: string) => setPaymentData(prev => ({ ...prev, lastName: value })),
        setPhone: (value: string) => setPaymentData(prev => ({ ...prev, phone: value }))
      }))
    }
  }, [user])


  // Show loading if auth is loading or if we don't have checkout data yet
  if (isLoading || !checkoutData || !clientSecret) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isLoading ? 'Checking authentication...' : 'Loading checkout...'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

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

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Complete your payment
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Start your subscription and schedule your onboarding call
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{checkoutData.planName} Plan</h3>
                    <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${checkoutData.planPrice.toLocaleString()}.00</div>
                  </div>
                </div>

                <div className="border-t mt-6 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{checkoutData.onboardingName} Setup Fee</span>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        <span className="line-through text-muted-foreground">${checkoutData.onboardingPrice.toLocaleString()}.00</span>
                      </div>
                      <div className="text-sm font-medium">Pay Later</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 mt-4">
                    <span className="font-bold">Due Today</span>
                    <div className="text-3xl font-bold text-orange-500">${checkoutData.planPrice.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stripe Elements Provider */}
            <Elements stripe={stripePromise}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Payment Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter your payment details to get started
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Social Proof */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                              <Users className="w-3 h-3 text-white" />
                            </div>
                          ))}
                        </div>
                        <div className="text-sm font-medium">
                          50+ clinics launched
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-sm font-medium">4.8/5</span>
                      </div>
                    </div>
                  </div>

                  <CheckoutForm
                    checkoutData={checkoutData}
                    paymentData={paymentData}
                    token={token}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </CardContent>
              </Card>
            </Elements>
          </div>
        </div>
      </div>
    </Layout>
  )
}