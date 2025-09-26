import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import "../styles/globals.css"

// Pages that don't require authentication
const publicPages = ['/signin', '/signup', '/verify-email']

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Admin dashboard for managing business operations" />
        <meta name="generator" content="Next.js" />
      </Head>
      <ThemeProvider>
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
      </ThemeProvider>
    </>
  )
}