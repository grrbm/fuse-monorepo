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
            // Fetch templates (isTemplate=true)
            const tplRes = await fetch(`${baseUrl}/questionnaires/templates`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const tplData = await tplRes.json().catch(() => ({}))
            const templatesList: any[] = Array.isArray(tplData?.data) ? tplData.data : []

            // Fetch all questionnaires (includes non-templates like account clones)
            const allRes = await fetch(`${baseUrl}/questionnaires`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const allData = await allRes.json().catch(() => ({}))
            const allList: any[] = Array.isArray(allData?.data) ? allData.data : []

            // Merge by id, prefer non-template records for user_profile
            const byId = new Map<string, any>()
            for (const q of [...templatesList, ...allList]) {
                if (!byId.has(q.id)) byId.set(q.id, q)
            }

            setQuestionnaires(Array.from(byId.values()))
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





