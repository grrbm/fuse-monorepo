import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export interface QuestionnaireTemplate {
    id: string
    title: string
    description?: string | null
    isTemplate: boolean
    productId?: string | null
    personalizationQuestionsSetup?: boolean
    createAccountQuestionsSetup?: boolean
    doctorQuestionsSetup?: boolean
    createdAt?: string
    updatedAt?: string
}

export function useQuestionnaires(baseUrl: string) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [questionnaires, setQuestionnaires] = useState<QuestionnaireTemplate[]>([])

    const refresh = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${baseUrl}/questionnaires/templates`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || "Failed to load questionnaires")
            }
            const data = await res.json()
            setQuestionnaires(Array.isArray(data?.data) ? data.data : [])
        } catch (err: any) {
            setError(err?.message || "Failed to load questionnaires")
        } finally {
            setLoading(false)
        }
    }, [baseUrl, token])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { loading, error, questionnaires, refresh }
}


