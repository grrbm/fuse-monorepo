import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/router'
import { ApiClient } from '@/lib/api'

interface User {
    id: string
    email: string
    name: string
    role: string
    firstName?: string
    lastName?: string
    phone?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<boolean>
    signup: (email: string, password: string, name: string) => Promise<boolean>
    logout: (options?: { message?: string }) => void
    authenticatedFetch: (input: RequestInfo | URL, init?: RequestInit & { skipLogoutOn401?: boolean }) => Promise<Response>
    apiClient: ApiClient
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

    // Helper reused across unauthorized paths
    const handleUnauthorized = (message?: string) => {
        const logoutMessage = message || 'Your session has expired. Please sign in again.'

        localStorage.removeItem('doctor_token')
        localStorage.removeItem('doctor_user')

        setToken(null)
        setUser(null)
        setError(logoutMessage)

        if (router.pathname !== '/signin') {
            router.push(`/signin?message=${encodeURIComponent(logoutMessage)}`)
        }
    }

    const logout = ({ message }: { message?: string } = {}) => {
        localStorage.removeItem('doctor_token')
        localStorage.removeItem('doctor_user')

        setToken(null)
        setUser(null)
        setError(message ?? null)

        if (router.pathname !== '/signin') {
            router.push(message ? `/signin?message=${encodeURIComponent(message)}` : '/signin')
        }
    }

    const authenticatedFetch = async (
        input: RequestInfo | URL,
        init: RequestInit & { skipLogoutOn401?: boolean } = {}
    ): Promise<Response> => {
        const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('doctor_token') : null)
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

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('doctor_token') : null
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('doctor_user') : null

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser)
                setToken(storedToken)
                setUser(userData)
            } catch (error) {
                localStorage.removeItem('doctor_token')
                localStorage.removeItem('doctor_user')
            }
        }

        setIsLoading(false)
    }, [])

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

                localStorage.setItem('doctor_token', authToken)
                localStorage.setItem('doctor_user', JSON.stringify(userData))

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
                    role: 'doctor',
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                const { token: authToken, user: userData } = data

                localStorage.setItem('doctor_token', authToken)
                localStorage.setItem('doctor_user', JSON.stringify(userData))

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

    const apiClient = useMemo(() => new ApiClient(authenticatedFetch), [token])

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                signup,
                logout,
                authenticatedFetch,
                apiClient,
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

