import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const storedTheme = localStorage.getItem('doctor-portal-theme') as Theme
        if (storedTheme) {
            setThemeState(storedTheme)
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setThemeState(prefersDark ? 'dark' : 'light')
        }
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('doctor-portal-theme', theme)
    }, [theme, mounted])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light')
    }

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

