import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Analytics } from "@vercel/analytics/next"
import { useState, useCallback } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ToastManager } from '@/components/ui/toast'
import { Toaster } from 'sonner'
import "../styles/globals.css"

// Pages that don't require authentication
const publicPages = ['/signin', '/signup', '/verify-email']

export default function App({ Component, pageProps }: AppProps & { showToast?: (type: 'success' | 'error', message: string) => void }) {
    const router = useRouter()
    const isPublicPage = publicPages.includes(router.pathname)

    const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([])

    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        const id = crypto.randomUUID()
        setToasts((prev) => [...prev, { id, type, message }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, 3000)
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const content = (
        <div className="font-sans">
            {isPublicPage ? (
                <Component {...pageProps} showToast={showToast} />
            ) : (
                <ProtectedRoute>
                    <Component {...pageProps} showToast={showToast} />
                </ProtectedRoute>
            )}
            {process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true' && <Analytics />}
        </div>
    )

    return (
        <>
            <Head>
                <title>Doctor Portal</title>
                <meta name="description" content="Doctor portal for managing patients and appointments" />
                <meta name="generator" content="Next.js" />
            </Head>
            <ThemeProvider>
                <AuthProvider>
                    <WebSocketProvider>
                        {content}
                        <ToastManager toasts={toasts} onDismiss={dismissToast} />
                        <Toaster position="top-right" richColors />
                    </WebSocketProvider>
                </AuthProvider>
            </ThemeProvider>
        </>
    )
}

