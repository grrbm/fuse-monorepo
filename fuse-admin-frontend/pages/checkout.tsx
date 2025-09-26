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
  Settings,
  Calendar,
  Phone,
  TrendingUp,
  Star,
  Users
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [paymentData, setPaymentData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    country: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

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

  // Auto-populate user data when user is available
  useEffect(() => {
    if (user) {
      setPaymentData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      }))
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
          totalAmount: checkoutData.planPrice, // Only charge first month
          paymentMethod: selectedPaymentMethod,
          paymentData: selectedPaymentMethod === 'card' ? paymentData : null,
          items: [
            {
              name: checkoutData.planName,
              price: checkoutData.planPrice,
              quantity: 1,
              type: 'subscription'
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      
      if (selectedPaymentMethod === 'stripe-link' || selectedPaymentMethod === 'bank' || selectedPaymentMethod === 'google-pay') {
        window.location.href = checkoutUrl
      } else {
        // For card payments, process directly
        router.push('/plans?success=true&session_id=demo_session')
      }

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

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Your Setup Package */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-15 group-hover:opacity-40 transition duration-300"></div>
              <Card className="relative border-2 border-blue-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-white border-b border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Monthly
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                  Complete your payment
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Start your first month subscription and schedule your onboarding call
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {/* Plan Details */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{checkoutData.planName} Plan: Monthly Plan</h3>
                      <p className="text-sm text-gray-600 mt-1">1-month supply</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${checkoutData.planPrice.toLocaleString()}.00</div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 mt-6 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{checkoutData.onboardingName} Setup Fee</span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          <span className="line-through text-gray-400">${checkoutData.onboardingPrice.toLocaleString()}.00</span>
                        </div>
                        <div className="text-sm text-gray-900 font-medium">Pay Later</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Due Today</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-500">${checkoutData.planPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

              </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-15 group-hover:opacity-40 transition duration-300"></div>
              <Card className="relative border-2 border-blue-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Payment & Contact Information
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your information to get started today
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Social Proof */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                            <Users className="w-3 h-3 text-white" />
                          </div>
                        ))}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        50+ clinics launched
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-1 text-sm font-medium text-gray-700">4.8/5</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Contact information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
                      <Input 
                        type="email" 
                        placeholder="Enter your email"
                        value={paymentData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        autoComplete="email"
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">First name</label>
                        <Input 
                          type="text" 
                          placeholder="First name"
                          value={paymentData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          autoComplete="given-name"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Last name</label>
                        <Input 
                          type="text" 
                          placeholder="Last name"
                          value={paymentData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          autoComplete="family-name"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone number</label>
                      <Input 
                        type="tel" 
                        placeholder="(555) 123-4567"
                        value={paymentData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        autoComplete="tel"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Payment method
                  </h3>
                  <div className="space-y-3">
                    {/* Card Option */}
                    <div 
                      className="border border-gray-300 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300"
                      onClick={() => setSelectedPaymentMethod('card')}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-700" />
                        <span className="font-medium text-gray-900">Card</span>
                      </div>
                      
                      {/* Card Form - Only show when selected */}
                      {selectedPaymentMethod === 'card' && (
                        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
                            <Input 
                              type="text" 
                              placeholder="1234 1234 1234 1234"
                              value={paymentData.cardNumber}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                              autoComplete="cc-number"
                              className="w-full"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date</label>
                              <Input 
                                type="text" 
                                placeholder="MM / YY"
                                value={paymentData.expiryDate}
                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                autoComplete="cc-exp"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Security code</label>
                              <Input 
                                type="text" 
                                placeholder="CVC"
                                value={paymentData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                autoComplete="cc-csc"
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder name</label>
                            <Input 
                              type="text" 
                              placeholder="Name on card"
                              value={paymentData.cardholderName}
                              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                              autoComplete="cc-name"
                              className="w-full"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                              <Input 
                                type="text" 
                                placeholder="United States"
                                value={paymentData.country}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                autoComplete="country-name"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP code</label>
                              <Input 
                                type="text" 
                                placeholder="ZIP"
                                value={paymentData.zipCode}
                                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                autoComplete="postal-code"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stripe Link Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === 'stripe-link' 
                          ? 'border-2 border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedPaymentMethod('stripe-link')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">L</span>
                          </div>
                          <span className="font-medium text-gray-900">Link by Stripe</span>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Recommended
                        </div>
                      </div>
                      
                      {/* Stripe Link Details - Only show when selected */}
                      {selectedPaymentMethod === 'stripe-link' && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <div className="text-sm text-gray-700 mb-3">
                            Pay with your saved payment info from any Link-enabled site.
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Lock className="w-4 h-4" />
                            <span>Secure one-click checkout</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bank Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === 'bank' 
                          ? 'border-2 border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedPaymentMethod('bank')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-6 h-6 text-gray-700" />
                          <span className="font-medium text-gray-900">Bank transfer</span>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Save $5
                        </div>
                      </div>
                      
                      {/* Bank Details - Only show when selected */}
                      {selectedPaymentMethod === 'bank' && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <div className="text-sm text-gray-700 mb-2">
                            Pay directly from your bank account. Processing takes 1-3 business days.
                          </div>
                          <div className="text-xs text-green-700 font-medium">
                            🎉 Get $5 discount when you pay via bank transfer
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Google Pay Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === 'google-pay' 
                          ? 'border-2 border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedPaymentMethod('google-pay')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="font-medium text-gray-900">Google Pay</span>
                      </div>
                      
                      {/* Google Pay Details - Only show when selected */}
                      {selectedPaymentMethod === 'google-pay' && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <div className="text-sm text-gray-700 mb-2">
                            Pay with your Google account using saved payment methods.
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Shield className="w-4 h-4" />
                            <span>Fast and secure</span>
                          </div>
                        </div>
                      )}
                    </div>
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
                  onClick={handleCompleteCheckout}
                  disabled={isProcessing}
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
                  <p className="text-sm font-medium text-gray-900">
                    ✅ Onboarding path decided during your call
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Additional onboarding fees only charged if you select them during your call. No hidden costs.
                  </p>
                </div>
              </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}