import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  email: string
  name: string
  role: string
  organization?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, organization: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tenant_token')
    const storedUser = localStorage.getItem('tenant_user')
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('tenant_token')
        localStorage.removeItem('tenant_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { token: authToken, user: userData } = data.data
        
        // Store in localStorage
        localStorage.setItem('tenant_token', authToken)
        localStorage.setItem('tenant_user', JSON.stringify(userData))
        
        // Update state
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

  const signup = async (email: string, password: string, name: string, organization: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, organization }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { token: authToken, user: userData } = data.data
        
        // Store in localStorage
        localStorage.setItem('tenant_token', authToken)
        localStorage.setItem('tenant_user', JSON.stringify(userData))
        
        // Update state
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

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('tenant_token')
    localStorage.removeItem('tenant_user')
    
    // Clear state
    setToken(null)
    setUser(null)
    setError(null)
    
    // Redirect to signin
    router.push('/signin')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      signup,
      logout,
      isLoading,
      error
    }}>
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