import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionFeatures {
  canAddCustomProducts: boolean
  hasAccessToAnalytics: boolean
  canUploadCustomProductImages: boolean
}

interface Subscription {
  id: string
  plan: {
    name: string
    maxProducts: number
  }
  customFeatures: SubscriptionFeatures | null
  tierConfig: SubscriptionFeatures | null
}

export function useSubscriptionFeatures() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [features, setFeatures] = useState<SubscriptionFeatures>({
    canAddCustomProducts: false,
    hasAccessToAnalytics: false,
    canUploadCustomProductImages: false,
  })

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    fetchSubscription()
  }, [token])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/subscriptions/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch subscription')
        return
      }

      const data = await response.json()
      
      if (!data) {
        setSubscription(null)
        setFeatures({
          canAddCustomProducts: false,
          hasAccessToAnalytics: false,
          canUploadCustomProductImages: false,
        })
        return
      }

      setSubscription(data)

      // Calculate effective features based on customFeatures (overrides) and tierConfig
      const effectiveFeatures: SubscriptionFeatures = {
        canAddCustomProducts: 
          data.customFeatures?.canAddCustomProducts ?? 
          data.tierConfig?.canAddCustomProducts ?? 
          false,
        hasAccessToAnalytics: 
          data.customFeatures?.hasAccessToAnalytics ?? 
          data.tierConfig?.hasAccessToAnalytics ?? 
          false,
        canUploadCustomProductImages: 
          data.customFeatures?.canUploadCustomProductImages ?? 
          data.tierConfig?.canUploadCustomProductImages ?? 
          false,
      }

      setFeatures(effectiveFeatures)
      
      console.log('📊 Subscription features loaded:', effectiveFeatures)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    subscription,
    features,
    refresh: fetchSubscription,
  }
}

