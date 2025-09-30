import { ReactNode, createContext, useContext, useMemo } from 'react'
import { useRouter } from 'next/router'

interface ProtectedRouteContextValue {
    isProtected: boolean
}

const ProtectedRouteContext = createContext<ProtectedRouteContextValue>({ isProtected: true })

const UNPROTECTED_PATHS = ['/my-treatments/[slug]', '/treatments/[slug]']

interface ProviderProps {
    children: ReactNode
}

export function ProtectedRouteProvider({ children }: ProviderProps) {
    const router = useRouter()

    const value = useMemo(() => {
        const asPath = router.asPath.split('?')[0]
        const pathname = router.pathname

        const isUnprotected = UNPROTECTED_PATHS.some((pattern) => {
            const cleanPattern = pattern.trim()
            console.log('[ProtectedRouteProvider] Checking pattern:', cleanPattern, {
                pathname,
                asPath,
            })

            if (!pattern.includes('[')) {
                const match = cleanPattern === pathname || cleanPattern === asPath
                if (match) {
                    console.log('[ProtectedRouteProvider] Matched static pattern:', cleanPattern)
                }
                return match
            }

            const regex = new RegExp(`^${cleanPattern.replace(/\[.*?\]/g, '[^/]+')}$`)
            const match = regex.test(pathname) || regex.test(asPath)
            if (match) {
                console.log('[ProtectedRouteProvider] Matched dynamic pattern:', cleanPattern)
            }
            return match
        })

        console.log('[ProtectedRouteProvider] Result', {
            pathname,
            asPath,
            isUnprotected,
        })

        return {
            isProtected: !isUnprotected,
        }
    }, [router.pathname, router.asPath])

    return <ProtectedRouteContext.Provider value={value}>{children}</ProtectedRouteContext.Provider>
}

export function useProtectedRoute() {
    return useContext(ProtectedRouteContext)
}
