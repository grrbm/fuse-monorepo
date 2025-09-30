import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, hasActiveSubscription } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
      return
    }

    const subscriptionOptionalRoutes = new Set([
      '/plans',
      '/checkout',
      '/checkout/success',
      '/checkout/cancel',
      '/settings',
      '/settings/subscription',
      '/settings?message=You already have an active subscription.',
    ])

    if (
      !isLoading &&
      user &&
      !hasActiveSubscription &&
      !subscriptionOptionalRoutes.has(router.pathname)
    ) {
      router.push('/plans?message=Please select a plan to continue using the platform.')
    }
  }, [user, isLoading, hasActiveSubscription, router])

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