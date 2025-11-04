import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/signin')
            return
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div>
                        <p className="text-lg font-medium text-foreground">Refreshing your session…</p>
                        <p className="text-sm text-muted-foreground">One moment while we verify your access.</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}

