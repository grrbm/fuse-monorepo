import { useEffect, useMemo, useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"

export interface FormSectionTemplate {
    id: string
    name: string
    description?: string | null
    sectionType: "personalization" | "account" | "doctor"
    category?: string | null
    treatmentId?: string | null
    schema: Record<string, any>
    version: number
    publishedAt?: string | null
    isActive: boolean
}

export interface Treatment {
    id: string
    name: string
    category?: string | null
    treatmentLogo?: string | null
    active?: boolean
}

export interface TenantProductFormAssignment {
    id: string
    treatmentId: string
    layoutTemplate: string
    themeId?: string | null
    lockedUntil?: string | null
    publishedUrl?: string | null
    lastPublishedAt?: string | null
    personalizationTemplate?: FormSectionTemplate
    accountTemplate?: FormSectionTemplate
    doctorTemplate?: FormSectionTemplate
    treatment?: Treatment
    hasAssignment?: boolean
}

interface UseTemplatesResult {
    loading: boolean
    error: string | null
    sections: Record<string, FormSectionTemplate[]>
    assignments: TenantProductFormAssignment[]
    page: number
    totalPages: number
    setPage: (p: number) => void
    refresh: () => Promise<void>
    saveAssignment: (input: SaveAssignmentInput) => Promise<void>
}

interface SaveAssignmentInput {
    assignmentId: string
    treatmentId: string
    personalizationTemplateId?: string | null
    accountTemplateId?: string | null
    doctorTemplateId?: string | null
    layoutTemplate?: string
    themeId?: string
}

export function useTemplates(baseUrl: string): UseTemplatesResult {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [templates, setTemplates] = useState<FormSectionTemplate[]>([])
    const [assignments, setAssignments] = useState<TenantProductFormAssignment[]>([])
    const [page, setPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)

    const fetchTemplates = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError(null)

        try {
            // Always load products; other resources are optional
            const productsRes = await fetch(`${baseUrl}/products-management?limit=100&isActive=true&page=${page}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!productsRes.ok) {
                const data = await productsRes.json().catch(() => ({}))
                throw new Error(data.message || "Failed to load products")
            }
            const productsData = await productsRes.json()

            // Best-effort fetch of assignments; tolerate failures
            let existingAssignments: any[] = []
            try {
                const assignmentsRes = await fetch(`${baseUrl}/questionnaires/templates/assignments`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (assignmentsRes.ok) {
                    const assignmentsData = await assignmentsRes.json()
                    existingAssignments = assignmentsData.data ?? []
                }
            } catch { }

            // Best-effort fetch of templates; not required anymore for Forms index
            try {
                const templatesRes = await fetch(`${baseUrl}/questionnaires/templates`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (templatesRes.ok) {
                    const templatesData = await templatesRes.json()
                    setTemplates(templatesData.data ?? [])
                } else {
                    setTemplates([])
                }
            } catch {
                setTemplates([])
            }

            // Normalize products payload from various API shapes
            const allProducts = Array.isArray(productsData)
                ? productsData
                : Array.isArray(productsData?.data?.products)
                    ? productsData.data.products
                    : Array.isArray(productsData?.data)
                        ? productsData.data
                        : Array.isArray(productsData?.products)
                            ? productsData.products
                            : []

            // Derive pagination if present
            const pagination = productsData?.data?.pagination
            if (pagination && typeof pagination.totalPages === 'number') {
                setTotalPages(pagination.totalPages)
            } else {
                setTotalPages(1)
            }

            const assignmentMap = new Map(
                existingAssignments.map((a: TenantProductFormAssignment) => [a.treatmentId, a])
            )

            const mergedAssignments: TenantProductFormAssignment[] = allProducts
                .map((product: any) => {
                    const existingAssignment = assignmentMap.get(product.id)

                    if (existingAssignment) {
                        return {
                            ...existingAssignment,
                            hasAssignment: true,
                            treatment: {
                                id: product.id,
                                name: product.name,
                                category: product.category || null,
                                treatmentLogo: product.imageUrl,
                                active: product.isActive,
                            },
                        }
                    } else {
                        return {
                            id: `placeholder-${product.id}`,
                            treatmentId: product.id,
                            layoutTemplate: 'layout_a',
                            hasAssignment: false,
                            treatment: {
                                id: product.id,
                                name: product.name,
                                category: product.category || null,
                                treatmentLogo: product.imageUrl,
                                active: product.isActive,
                            },
                        } as TenantProductFormAssignment
                    }
                })

            setAssignments(mergedAssignments)
        } catch (err: any) {
            console.error("❌ Error loading templates:", err)
            setError(err.message ?? "Failed to load templates")
        } finally {
            setLoading(false)
        }
    }, [baseUrl, token, page])

    const saveAssignment = useCallback(
        async (input: SaveAssignmentInput) => {
            if (!token) throw new Error("Not authenticated")

            const response = await fetch(`${baseUrl}/questionnaires/import`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    treatmentId: input.treatmentId,
                    personalizationTemplateId: input.personalizationTemplateId,
                    accountTemplateId: input.accountTemplateId,
                    doctorTemplateId: input.doctorTemplateId,
                    layoutTemplate: input.layoutTemplate,
                    themeId: input.themeId,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.message || "Failed to save assignment")
            }

            const data = await response.json()
            if (data?.data) {
                setAssignments((prev) =>
                    prev.map((assignment) =>
                        assignment.treatmentId === input.treatmentId ? { ...assignment, ...data.data } : assignment
                    )
                )
            } else {
                await fetchTemplates()
            }
        },
        [baseUrl, fetchTemplates, token]
    )

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates, page])

    const sections = useMemo(() => {
        const grouped: Record<string, FormSectionTemplate[]> = {
            personalization: [],
            account: [],
            doctor: [],
        }

        for (const template of templates) {
            if (!grouped[template.sectionType]) {
                grouped[template.sectionType] = []
            }
            grouped[template.sectionType].push(template)
        }

        return grouped
    }, [templates])

    return {
        loading,
        error,
        sections,
        assignments,
        page,
        totalPages,
        setPage,
        refresh: fetchTemplates,
        saveAssignment,
    }
}


