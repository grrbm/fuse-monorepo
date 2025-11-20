import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  email: string
  name: string
  role: string
  firstName?: string
  lastName?: string
  companyName?: string
  phone?: string
  website?: string
  clinicId?: string
}

interface Subscription {
  id: string
  planId: string | null
  status: string
  stripeSubscriptionId?: string
  stripePriceId?: string | null
  plan?: {
    name: string
    price: number
    type: string
    priceId?: string
  }
  nextBillingDate?: string
  monthlyPrice?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  subscription: Subscription | null
  hasActiveSubscription: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: (options?: { message?: string }) => void
  refreshSubscription: () => Promise<void>
  authenticatedFetch: (input: RequestInfo | URL, init?: RequestInit & { skipLogoutOn401?: boolean }) => Promise<Response>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Helper reused across unauthorized paths
  const handleUnauthorized = (message?: string) => {
    const logoutMessage = message || 'Your session has expired. Please sign in again.'

    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    setToken(null)
    setUser(null)
    setSubscription(null)
    setError(logoutMessage)

    if (router.pathname !== '/signin') {
      router.push(`/signin?message=${encodeURIComponent(logoutMessage)}`)
    }
  }

  const logout = ({ message }: { message?: string } = {}) => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    setToken(null)
    setUser(null)
    setSubscription(null)
    setError(message ?? null)

    if (router.pathname !== '/signin') {
      router.push(message ? `/signin?message=${encodeURIComponent(message)}` : '/signin')
    }
  }

  const authenticatedFetch = async (
    input: RequestInfo | URL,
    init: RequestInit & { skipLogoutOn401?: boolean } = {}
  ): Promise<Response> => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null)
    const headers = new Headers(init.headers || {})

    if (activeToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${activeToken}`)
    }

    const response = await fetch(input, {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
    })

    if (response.status === 401 && !init.skipLogoutOn401) {
      handleUnauthorized()
      throw new Error('unauthorized')
    }

    return response
  }

  // Check for existing token on mount or impersonation token in URL
  useEffect(() => {
    const checkAuth = async () => {
      // Check for impersonation token in URL
      const urlParams = new URLSearchParams(window.location.search)
      const impersonateToken = urlParams.get('impersonateToken')

      if (impersonateToken) {
        console.log('🎭 [Impersonation] Token found in URL, fetching user data...')
        
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          const response = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${impersonateToken}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              console.log('✅ [Impersonation] User data fetched successfully')
              
              // Store token and user data
              localStorage.setItem('admin_token', impersonateToken)
              localStorage.setItem('admin_user', JSON.stringify(data.user))
              
              setToken(impersonateToken)
              setUser(data.user)

              // Clean up URL by removing the impersonateToken parameter
              urlParams.delete('impersonateToken')
              const newUrl = urlParams.toString() 
                ? `${window.location.pathname}?${urlParams.toString()}`
                : window.location.pathname
              window.history.replaceState({}, '', newUrl)
              
              setIsLoading(false)
              return
            }
          }
          
          console.error('❌ [Impersonation] Failed to fetch user data with impersonation token')
        } catch (error) {
          console.error('❌ [Impersonation] Error:', error)
        }
      }

      // Fallback to checking for stored token
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Fetch subscription data when user or token changes
  useEffect(() => {
    if (user && token) {
      refreshSubscription()
    } else {
      setSubscription(null)
    }
  }, [user, token])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { token: authToken, user: userData } = data

        localStorage.setItem('admin_token', authToken)
        localStorage.setItem('admin_user', JSON.stringify(userData))

        setToken(authToken)
        setUser(userData)

        setIsLoading(false)
        return true
      } else {
        setError(data.message || 'Login failed')
        setIsLoading(false)
        return false
      }
    } catch (error) {
      setError('Network error. Please try again.')
      setIsLoading(false)
      return false
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const [firstName, ...lastNameParts] = name.split(' ')
      const lastName = lastNameParts.join(' ') || ''

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role: 'brand',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { token: authToken, user: userData } = data

        localStorage.setItem('admin_token', authToken)
        localStorage.setItem('admin_user', JSON.stringify(userData))

        setToken(authToken)
        setUser(userData)

        setIsLoading(false)
        return true
      } else {
        setError(data.message || 'Signup failed')
        setIsLoading(false)
        return false
      }
    } catch (error) {
      setError('Network error. Please try again.')
      setIsLoading(false)
      return false
    }
  }

  const refreshSubscription = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    try {
      const response = await authenticatedFetch(`${apiUrl}/subscriptions/current`, {
        method: 'GET',
        skipLogoutOn401: true,
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (response.ok) {
        const subscriptionData = await response.json()
        setSubscription(subscriptionData)
      } else {
        setSubscription(null)
      }
    } catch (error) {
      if ((error as Error).message === 'unauthorized') {
        return
      }
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    }
  }

  const hasActiveSubscription = subscription?.status === 'active'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        hasActiveSubscription,
        login,
        signup,
        logout,
        refreshSubscription,
        authenticatedFetch,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}