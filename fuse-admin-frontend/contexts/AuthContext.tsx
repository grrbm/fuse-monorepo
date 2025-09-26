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
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
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
    console.log('🔐 AuthContext mounted')
    const storedToken = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')

    console.log('🔐 Stored token exists:', !!storedToken)
    console.log('🔐 Stored user exists:', !!storedUser)

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        console.log('🔐 Parsed user data from localStorage:', userData)
        console.log('🔐 User clinicId from localStorage:', userData?.clinicId)
        setToken(storedToken)
        setUser(userData)
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
    console.log('🔐 AuthContext initialization complete')
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('API URL:', apiUrl)
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
        
        // Store in localStorage
        localStorage.setItem('admin_token', authToken)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        
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

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [firstName, ...lastNameParts] = name.split(' ')
      const lastName = lastNameParts.join(' ') || ''
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('API URL:', apiUrl)
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
          role: 'brand' 
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { token: authToken, user: userData } = data
        
        // Store in localStorage
        localStorage.setItem('admin_token', authToken)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        
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
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    
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