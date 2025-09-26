import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Analytics } from "@vercel/analytics/next"
import { useRouter } from 'next/router'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import "../styles/globals.css"

const publicPages = ['/signin', '/signup']

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)

  return (
    <>
      <Head>
        <title>Tenant Portal</title>
        <meta name="description" content="Tenant management portal for clinic onboarding and management" />
        <meta name="generator" content="Next.js" />
      </Head>
      <AuthProvider>
        <div className="font-sans">
          {isPublicPage ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          )}
          <Analytics />
        </div>
      </AuthProvider>
    </>
  )
}