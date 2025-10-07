import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  planDetails: {
    name: string
    price: number
    type: string
  }
}

interface SubscriptionContextType {
  subscription: Subscription | null
  hasActivePlan: boolean
  isLoading: boolean
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  const fetchSubscription = async () => {
    if (!token) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [token])

  const hasActivePlan = subscription?.isActive || false

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      hasActivePlan,
      isLoading,
      refreshSubscription: fetchSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

