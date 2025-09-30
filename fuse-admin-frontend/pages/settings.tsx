import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, User, CreditCard, Check, Camera, Upload, Crown, RefreshCw, Calendar, Shield, ArrowRight } from 'lucide-react'
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type SubscriptionPlanType = 'standard_build' | 'high-definition'

const getAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string,
  useShort = false
) => {
  if (!components) return ''
  const component = components.find((item) => item.types.includes(type))
  if (!component) return ''
  return useShort ? component.short_name : component.long_name
}

const parsePlaceAddress = (place: google.maps.places.PlaceResult) => {
  const components = place.address_components
  if (!components) {
    return null
  }

  const streetNumber = getAddressComponent(components, 'street_number')
  const route = getAddressComponent(components, 'route')
  const city =
    getAddressComponent(components, 'locality') ||
    getAddressComponent(components, 'sublocality') ||
    getAddressComponent(components, 'administrative_area_level_2')
  const state = getAddressComponent(components, 'administrative_area_level_1', true)
  const zipCode = getAddressComponent(components, 'postal_code')

  const address = [streetNumber, route].filter(Boolean).join(' ')

  return {
    address,
    city,
    state,
    zipCode,
  }
}

const PLAN_DEFINITIONS: Record<SubscriptionPlanType, {
  label: string
  price: number
  description: string
  highlights: string[]
}> = {
  'standard_build': {
    label: 'Standard',
    price: 1500,
    description: 'Ideal for wellness, aesthetics, weight-loss, and lifestyle telehealth brands that do not require controlled scripts.',
    highlights: [
      'Patient journey management & automation',
      'Fuse telehealth physician network access',
      'Pharmacy fulfillment pipelines',
    ],
  },
  'high-definition': {
    label: 'Controlled Substances',
    price: 2500,
    description: 'Everything in the standard package plus workflows for prescribing regulated therapies through Fuse doctors and pharmacies.',
    highlights: [
      'Schedule III therapy workflows (TRT, peptides, etc.)',
      'Enhanced compliance & monitoring',
      'Integrated pharmacy routing for regulated medications',
    ],
  },
}

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount && amount !== 0) return '—'
  return `$${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

const formatDate = (date?: string | null) => {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  } catch (error) {
    return '—'
  }
}

export default function Settings({ showToast }: { showToast: (type: 'success' | 'error', message: string) => void }) {
  const router = useRouter()
  const { user, token, hasActiveSubscription, refreshSubscription, authenticatedFetch } = useAuth()
  const [loading, setLoading] = useState(false)

  const [organizationData, setOrganizationData] = useState({
    businessName: '',
    businessType: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    logo: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isHoveringLogo, setIsHoveringLogo] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [creatingPlan, setCreatingPlan] = useState<'standard' | 'professional' | null>(null)

  const buildAuthHeaders = (additional: Record<string, string> = {}) => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null)
    const headers: Record<string, string> = { ...additional }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    return headers
  }

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      fetchOrganizationData()
      fetchSubscriptionData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    setSubscriptionLoading(true)
    try {
      const response = await authenticatedFetch(`${API_URL}/subscriptions/current`, {
        method: 'GET',
        skipLogoutOn401: true,
      })

      if (response.status === 401) {
        setSubscriptionData(null)
      } else if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      } else {
        setSubscriptionData(null)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscriptionData(null)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const fetchOrganizationData = async () => {
    try {
      const response = await authenticatedFetch(`${API_URL}/organization`, {
        method: 'GET',
        skipLogoutOn401: true,
      })

      if (response.status === 401) {
        setOrganizationData((prev) => ({ ...prev }))
        return
      }

      if (response.ok) {
        const data = await response.json()
        setOrganizationData({
          businessName: data.clinicName || data.businessName || '',
          businessType: data.businessType || '',
          website: data.website || '',
          phone: data.phone || data.phoneNumber || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          logo: data.logo || '',
        })
        if (data.logo) {
          setLogoPreview(data.logo)
        }
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
    }
  }

  const handlePlaceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    const parsed = parsePlaceAddress(place)
    if (!parsed) {
      showToast('error', 'Unable to read that address. Please try a different search.')
      return
    }

    setOrganizationData((prev) => ({
      ...prev,
      address: parsed.address || prev.address,
      city: parsed.city || prev.city,
      state: parsed.state || prev.state,
      zipCode: parsed.zipCode || prev.zipCode,
    }))

    if (place.formatted_address) {
      setOrganizationData((prev) => ({
        ...prev,
        address: parsed.address || prev.address,
      }))
    }

    showToast('success', 'Address details updated from search')
  }, [showToast])

  const { inputRef: addressInputRef } = usePlacesAutocomplete({
    onPlaceSelected: handlePlaceSelected,
    componentRestrictions: { country: 'us' },
  })

  const handleRefreshSubscription = async () => {
    await fetchSubscriptionData()
    await refreshSubscription()
  }

  const handlePlanSelect = async (planType: 'standard' | 'professional') => {
    if (!token) {
      alert('You need to be signed in to select a plan.')
      return
    }

    const planMappings = {
      standard: {
        apiPlanType: 'standard_build' as const,
        downpayment: {
          type: 'downpayment_standard',
          name: 'Discounted First Month',
          amount: 1500,
        },
        label: 'Standard',
      },
      professional: {
        apiPlanType: 'high-definition' as const,
        downpayment: {
          type: 'downpayment_professional',
          name: 'Discounted Professional First Month',
          amount: 2500,
        },
        label: 'Controlled Substances',
      },
    } as const

    const mapping = planMappings[planType]

    try {
      setCreatingPlan(planType)
      const response = await authenticatedFetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPlanCategory: planType,
          selectedPlanType: mapping.apiPlanType,
          selectedPlanName: mapping.label,
          selectedPlanPrice: mapping.downpayment.amount,
          selectedDownpaymentType: mapping.downpayment.type,
          selectedDownpaymentName: mapping.downpayment.name,
          selectedDownpaymentPrice: mapping.downpayment.amount,
          planSelectionTimestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        alert('Plan selection failed. Status: ' + response.status)
        setCreatingPlan(null)
        return
      }

      const queryParams = new URLSearchParams({
        planCategory: planType,
        subscriptionPlanType: mapping.apiPlanType,
        subscriptionPlanName: mapping.label,
        subscriptionMonthlyPrice: PLAN_DEFINITIONS[mapping.apiPlanType].price.toString(),
        downpaymentPlanType: mapping.downpayment.type,
        downpaymentName: mapping.downpayment.name,
        downpaymentAmount: mapping.downpayment.amount.toString(),
      })

      router.push(`/checkout?${queryParams.toString()}`)
    } catch (error) {
      alert('Error saving plan selection: ' + (error instanceof Error ? error.message : String(error)))
      setCreatingPlan(null)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)

      if (file.type === 'application/pdf') {
        setLogoPreview(file.name)
        await uploadLogo(file)
      } else {
        const reader = new FileReader()
        reader.onloadend = async () => {
          setLogoPreview(reader.result as string)
          await uploadLogo(file)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const uploadLogo = async (file: File) => {
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const uploadResponse = await fetch(`${API_URL}/upload/logo`, {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: formData,
      })

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        setOrganizationData({ ...organizationData, logo: uploadData.url })
        showToast('success', 'Logo uploaded successfully!')
      } else {
        showToast('error', 'Failed to upload logo')
      }
    } catch (error) {
      showToast('error', 'An error occurred while uploading')
    } finally {
      setLoading(false)
    }
  }

  const handleOrganizationUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/organization/update`, {
        method: 'PUT',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(organizationData),
      })

      if (response.ok) {
        showToast('success', 'Organization settings updated successfully!')
      } else {
        showToast('error', 'Failed to update organization settings')
      }
    } catch (error) {
      showToast('error', 'An error occurred while updating')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      showToast('error', 'New passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          ...(profileData.newPassword && {
            currentPassword: profileData.currentPassword,
            newPassword: profileData.newPassword,
          }),
        }),
      })

      if (response.ok) {
        showToast('success', 'Profile updated successfully!')
        setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        showToast('error', error.message || 'Failed to update profile')
      }
    } catch (error) {
      showToast('error', 'An error occurred while updating')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    setLoading(true)

    try {
      const response = await authenticatedFetch(`${API_URL}/subscriptions/cancel`, {
        method: 'POST',
      })

      if (response.ok) {
        showToast('success', 'Subscription cancelled successfully')
        fetchSubscriptionData()
      } else {
        showToast('error', 'Failed to cancel subscription')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const currentPlanType = subscriptionData?.plan?.type as SubscriptionPlanType | undefined
  const currentPlanDefinition = currentPlanType ? PLAN_DEFINITIONS[currentPlanType] : null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your organization, profile, and subscription settings</p>
              </div>

              {/* Logo Upload - Top Right */}
              <div className="flex-shrink-0">
                <div
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setIsHoveringLogo(true)}
                  onMouseLeave={() => setIsHoveringLogo(false)}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted transition-all group-hover:border-primary">
                      {logoPreview || organizationData.logo ? (
                        logoPreview?.endsWith('.pdf') || organizationData.logo?.endsWith('.pdf') ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">PDF</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={logoPreview || organizationData.logo}
                            alt="Company logo"
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity ${isHoveringLogo ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center text-white">
                          <Camera className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-xs font-medium">Edit Logo</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">Company Logo</p>
              </div>
            </div>

            <Tabs defaultValue="organization" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="organization" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscription & Billing
                </TabsTrigger>
              </TabsList>

              {/* Organization Settings */}
              <TabsContent value="organization">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>Update your business information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleOrganizationUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Business Name</label>
                          <input
                            type="text"
                            value={organizationData.businessName}
                            onChange={(e) => setOrganizationData({ ...organizationData, businessName: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="Enter business name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Business Type</label>
                          <input
                            type="text"
                            value={organizationData.businessType || 'Not specified'}
                            readOnly
                            disabled
                            className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Website</label>
                          <input
                            type="text"
                            value={organizationData.website}
                            onChange={(e) => setOrganizationData({ ...organizationData, website: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="company.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone</label>
                          <input
                            type="tel"
                            value={organizationData.phone}
                            onChange={(e) => setOrganizationData({ ...organizationData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="(555) 123-4567"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">Address</label>
                          <input
                            type="text"
                            ref={addressInputRef}
                            value={organizationData.address}
                            onChange={(e) => setOrganizationData({ ...organizationData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="123 Main St"
                            autoComplete="off"
                          />
                          <p className="text-xs text-muted-foreground pt-1">
                            {typeof window === 'undefined'
                              ? 'Preparing address suggestions…'
                              : window.google && window.google.maps && window.google.maps.places
                                ? 'Autocomplete suggestions powered by Google Places'
                                : 'Type to search for your address'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">City</label>
                          <input
                            type="text"
                            value={organizationData.city}
                            onChange={(e) => setOrganizationData({ ...organizationData, city: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">State</label>
                          <input
                            type="text"
                            value={organizationData.state}
                            onChange={(e) => setOrganizationData({ ...organizationData, state: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="State"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">ZIP Code</label>
                          <input
                            type="text"
                            value={organizationData.zipCode}
                            onChange={(e) => setOrganizationData({ ...organizationData, zipCode: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="12345"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information and password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="w-full px-3 py-2 border border-input rounded-md bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <input
                              type="password"
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              placeholder="Enter current password"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <input
                              type="password"
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <input
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscriptions */}
              <TabsContent value="subscription">
                <div className="space-y-6">
                  {/* Current Subscription */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Overview</CardTitle>
                      <CardDescription>
                        Review your current plan status and explore available subscriptions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subscriptionData ? (
                        <div className="space-y-4 text-sm text-muted-foreground">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-border p-4 bg-muted/40">
                              <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Current Plan</span>
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {currentPlanDefinition?.label || subscriptionData.plan?.name || '—'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {currentPlanDefinition?.description || 'Active subscription'}
                              </p>
                            </div>

                            <div className="rounded-lg border border-border p-4 bg-muted/40">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Billing</span>
                              </div>
                              <div className="grid gap-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Monthly price</span>
                                  <span className="font-medium text-foreground">{formatCurrency(currentPlanDefinition?.price ?? subscriptionData.plan?.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <span className="capitalize font-medium text-foreground">{subscriptionData.status || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Next billing date</span>
                                  <span className="font-medium text-foreground">{formatDate(subscriptionData.nextBillingDate)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Identifiers</p>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>Subscription ID: <span className="text-foreground font-medium">{subscriptionData.id}</span></p>
                                <p>Stripe Subscription: <span className="text-foreground font-medium">{subscriptionData.stripeSubscriptionId || 'N/A'}</span></p>
                                <p>Stripe Price ID: <span className="text-foreground font-medium">{subscriptionData.plan?.stripePriceId || subscriptionData.stripePriceId || 'N/A'}</span></p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button variant="outline" onClick={handleRefreshSubscription} disabled={subscriptionLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${subscriptionLoading ? 'animate-spin' : ''}`} />
                                {subscriptionLoading ? 'Refreshing' : 'Refresh'}
                              </Button>
                              <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                                Cancel Subscription
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">No active subscription found. Select a plan to get started.</p>
                          <Button onClick={() => router.push('/plans')}>Browse Plans</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Available Plans */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle>Subscriptions</CardTitle>
                          <CardDescription>Choose the plan that best fits your needs.</CardDescription>
                        </div>
                        {!hasActiveSubscription && (
                          <Badge className="bg-primary text-primary-foreground">Action required</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {(['standard', 'professional'] as const).map((planKey) => {
                          const isStandard = planKey === 'standard'
                          const planDefinition = PLAN_DEFINITIONS[isStandard ? 'standard_build' : 'high-definition']
                          const isCurrentPlan = currentPlanType === (isStandard ? 'standard_build' : 'high-definition')
                          const isActive = subscriptionData?.status === 'active'
                          const Icon = isStandard ? Building2 : Shield
                          const buttonLabel = isCurrentPlan
                            ? isActive
                              ? 'Current Plan'
                              : 'Plan Selected'
                            : isStandard
                              ? 'Get started'
                              : hasActiveSubscription
                                ? 'Upgrade for $1,000 more'
                                : 'Get started'

                          return (
                            <Card
                              key={planKey}
                              className={`relative group transition-all duration-300 flex flex-col ${
                                isStandard
                                  ? 'border-primary shadow-lg hover:shadow-2xl hover:scale-[1.02]'
                                  : 'border-border hover:border-primary/60 hover:shadow-xl hover:scale-[1.01]'
                              } ${creatingPlan ? 'opacity-75' : ''}`}
                            >
                              {isStandard && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Most Popular
                                  </div>
                                </div>
                              )}

                              <div className="absolute top-4 left-4">
                                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-md">
                                  Monthly
                                </div>
                              </div>

                              {isCurrentPlan && (
                                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                                  Active Plan
                                </div>
                              )}

                              <CardHeader className="pt-12 pb-6">
                                <div className="flex items-center gap-2 mb-3">
                                  <Icon className="h-5 w-5" />
                                  <CardTitle className="text-xl font-semibold">{planDefinition.label}</CardTitle>
                                </div>
                                <div className="mb-4">
                                  <span className={`text-3xl font-bold ${isStandard ? 'text-[#825AD1]' : 'text-[#825AD1]'}`}>
                                    {formatCurrency(planDefinition.price)}
                                  </span>
                                  <span className="text-muted-foreground"> / month</span>
                                  <div className="text-xs text-muted-foreground mt-1">+ 1% transaction fee</div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {planDefinition.description}
                                </p>
                              </CardHeader>

                              <CardContent className="flex flex-col h-full">
                                <ul className="space-y-3 mb-8 flex-grow">
                                  {planDefinition.highlights.map((highlight, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{highlight}</span>
                                    </li>
                                  ))}
                                </ul>

                                <Button
                                  className={`w-full mt-auto ${
                                    isCurrentPlan && isActive
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      : isStandard
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-white border border-gray-300 text-foreground hover:bg-gray-50'
                                  }`}
                                  onClick={() => handlePlanSelect(planKey)}
                                  disabled={
                                    isCurrentPlan && isActive || creatingPlan === 'standard' || creatingPlan === 'professional'
                                  }
                                >
                                  {creatingPlan === planKey
                                    ? 'Preparing checkout...'
                                    : buttonLabel}
                                  {!isCurrentPlan && creatingPlan !== planKey && (
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Onboarding Options - Configure later */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Onboarding Options</CardTitle>
                      <CardDescription>Configure optional onboarding support packages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Choose an onboarding package that fits your launch needs. These offerings are optional and can be purchased at any time.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="border-muted">
                            <CardHeader>
                              <CardTitle className="text-base">Standard Build</CardTitle>
                              <CardDescription>$3,000 • Launch in under 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-sm text-muted-foreground space-y-2">
                                <li>Platform + physician configuration</li>
                                <li>Branded static site hand-off</li>
                                <li>Initial data + provider import</li>
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="border-primary/50 shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-base">High Definition</CardTitle>
                              <CardDescription>$5,000 • Conversion optimized launch</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-sm text-muted-foreground space-y-2">
                                <li>Everything in Standard</li>
                                <li>Custom marketing site & automation</li>
                                <li>60-day optimization support</li>
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="border-muted">
                            <CardHeader>
                              <CardTitle className="text-base">Custom Implementation</CardTitle>
                              <CardDescription>$20,000 • Enterprise rollout</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-sm text-muted-foreground space-y-2">
                                <li>LegitScript certification support</li>
                                <li>Bespoke integrations & migrations</li>
                                <li>Multi-brand deployment planning</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
