import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ProtectedRouteProvider } from '../providers/ProtectedRouteProvider'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <HeroUIProvider>
            <ToastProvider />
            <AuthProvider>
                <ProtectedRouteProvider>
                    <Component {...pageProps} />
                </ProtectedRouteProvider>
            </AuthProvider>
        </HeroUIProvider>
    )
}

export default MyApp