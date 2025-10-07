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
  hasAssignment?: boolean // Added to track if this treatment has an assignment
}

interface UseTemplatesResult {
  loading: boolean
  error: string | null
  sections: Record<string, FormSectionTemplate[]>
  assignments: TenantProductFormAssignment[]
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

  const fetchTemplates = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const [templatesRes, assignmentsRes, productsRes] = await Promise.all([
        fetch(`${baseUrl}/questionnaires/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/questionnaires/templates/assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/products-management?limit=100&isActive=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!templatesRes.ok) {
        const data = await templatesRes.json().catch(() => ({}))
        throw new Error(data.message || "Failed to load templates")
      }

      if (!assignmentsRes.ok) {
        const data = await assignmentsRes.json().catch(() => ({}))
        throw new Error(data.message || "Failed to load template assignments")
      }

      if (!productsRes.ok) {
        const data = await productsRes.json().catch(() => ({}))
        throw new Error(data.message || "Failed to load products")
      }

      const templatesData = await templatesRes.json()
      const assignmentsData = await assignmentsRes.json()
      const productsData = await productsRes.json()

      setTemplates(templatesData.data ?? [])
      
      // Get all products and merge with assignments
      const allProducts = productsData.data?.products ?? []
      const existingAssignments = assignmentsData.data ?? []
      
      // Create a map of treatmentId (which is actually productId) -> assignment
      const assignmentMap = new Map(
        existingAssignments.map((a: TenantProductFormAssignment) => [a.treatmentId, a])
      )
      
      // Create assignments for all products (real + placeholders for unassigned)
      const mergedAssignments: TenantProductFormAssignment[] = allProducts
        .map((product: any) => {
          const existingAssignment = assignmentMap.get(product.id)
          
          if (existingAssignment) {
            // Use existing assignment
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
            // Create placeholder assignment for unassigned product
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
  }, [baseUrl, token])

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
  }, [fetchTemplates])

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
    refresh: fetchTemplates,
    saveAssignment,
  }
}

