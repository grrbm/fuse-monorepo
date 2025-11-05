import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useTenant } from "@/contexts/TenantContext"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Loader2, RefreshCcw, Search, Edit3, ExternalLink, Clock, Edit, Layers } from "lucide-react"
import { useTemplates } from "@/hooks/useTemplates"
import { QuestionnaireEditor } from "./QuestionnaireEditor"
import { useQuestionnaires } from "@/hooks/useQuestionnaires"
import { useAuth } from "@/contexts/AuthContext"
import { CATEGORY_OPTIONS, STATUS_OPTIONS, SORT_OPTIONS } from "@fuse/enums"



export default function Forms() {
  const router = useRouter()
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", [])
  const { loading, error, assignments, sections, refresh, page, totalPages, setPage } = useTemplates(baseUrl)
  const { questionnaires, refresh: refreshQuestionnaires } = useQuestionnaires(baseUrl)
  const { token } = useAuth()
  const { selectedTenant } = useTenant()

  const [activeTab, setActiveTab] = useState<"products" | "templates" | "account" | "tenant">("products")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSort, setSelectedSort] = useState("name_asc")
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [editingTemplateType, setEditingTemplateType] = useState<"personalization" | "account" | "doctor" | null>(null)
  const [creating, setCreating] = useState(false)
  const [configuringProductId, setConfiguringProductId] = useState<string | null>(null)
  const [creatingForProductId, setCreatingForProductId] = useState<string | null>(null)
  const [deletingForProductId, setDeletingForProductId] = useState<string | null>(null)
  const [productQStatus, setProductQStatus] = useState<Record<string, 'unknown' | 'exists' | 'none'>>({})
  const [productInfoById, setProductInfoById] = useState<Record<string, { placeholderSig?: string }>>({})

  useEffect(() => {
    refresh()
    refreshQuestionnaires()
  }, [])

  // Probe product questionnaire existence for current assignments
  useEffect(() => {
    if (!token) return
    const toCheck = (assignments || []).map((a: any) => a.treatmentId).filter(Boolean)
    toCheck.forEach(async (productId: string) => {
      if (!productId) return
      if (productQStatus[productId]) return
      try {
        const res = await fetch(`${baseUrl}/questionnaires/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          setProductQStatus(prev => ({ ...prev, [productId]: 'none' }))
          return
        }
        const data = await res.json().catch(() => null)
        const list = Array.isArray(data?.data) ? data.data : []
        const existing = list.find((q: any) => q.formTemplateType === 'normal') || list[0]
        setProductQStatus(prev => ({ ...prev, [productId]: existing?.id ? 'exists' : 'none' }))
      } catch {
        setProductQStatus(prev => ({ ...prev, [productId]: 'none' }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, token])

  // Fetch product info (e.g., Placeholder Sig) for each assignment's productId
  useEffect(() => {
    if (!token) return
    const toCheck = (assignments || []).map((a: any) => a.treatmentId).filter(Boolean)
    toCheck.forEach(async (productId: string) => {
      if (!productId) return
      if (productInfoById[productId]) return
      try {
        const res = await fetch(`${baseUrl}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => null)
        if (res.ok && data?.success && data?.data) {
          setProductInfoById(prev => ({ ...prev, [productId]: { placeholderSig: data.data.placeholderSig || undefined } }))
        }
      } catch {
        // ignore
      }
    })
  }, [assignments, token, baseUrl, productInfoById])

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = [...assignments]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((assignment) =>
        assignment.treatment?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((assignment) => assignment.treatment?.category === selectedCategory)
    }

    // Filter by status
    if (selectedStatus === "live") {
      filtered = filtered.filter((assignment) => assignment.publishedUrl && assignment.lastPublishedAt)
    } else if (selectedStatus === "pending") {
      filtered = filtered.filter((assignment) => !assignment.publishedUrl || !assignment.lastPublishedAt)
    }

    // Sort
    filtered.sort((a, b) => {
      const nameA = a.treatment?.name || ""
      const nameB = b.treatment?.name || ""

      switch (selectedSort) {
        case "name_asc":
          return nameA.localeCompare(nameB)
        case "name_desc":
          return nameB.localeCompare(nameA)
        case "updated_desc":
          return new Date(b.lastPublishedAt || 0).getTime() - new Date(a.lastPublishedAt || 0).getTime()
        case "updated_asc":
          return new Date(a.lastPublishedAt || 0).getTime() - new Date(b.lastPublishedAt || 0).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [assignments, searchQuery, selectedCategory, selectedStatus, selectedSort])

  const accountQuestionnaire = useMemo(() => {
    // Pick the first questionnaire that is marked as user_profile (global account template)
    return (questionnaires || []).find((q: any) => q.formTemplateType === 'user_profile') || null
  }, [questionnaires])

  const handleEditForm = (assignmentId: string) => {
    router.push(`/forms/builder/${assignmentId}`)
  }

  const handleConfigureProduct = async (assignment: any) => {
    if (!token) return
    const productId = assignment?.treatmentId
    if (!productId) return
    setConfiguringProductId(productId)
    try {
      // Try to find existing product questionnaire (prefer formTemplateType: 'normal')
      const res = await fetch(`${baseUrl}/questionnaires/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data?.data) ? data.data : []
        const existing = list
          .filter((q: any) => q.formTemplateType === 'normal')
          .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0]
          || list[0]
        if (existing?.id) {
          router.push(`/forms/editor/${existing.id}`)
          return
        }
      }

      // None exists: create one
      const name = `${assignment?.treatment?.name || 'Product'} Form`
      const description = `Questionnaire for ${assignment?.treatment?.name || 'product'}`
      const createRes = await fetch(`${baseUrl}/questionnaires/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: name,
          description,
          productId,
          formTemplateType: 'normal',
        }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to create product questionnaire')
      }
      const created = await createRes.json()
      const q = created?.data
      if (q?.id) {
        setProductQStatus(prev => ({ ...prev, [productId]: 'exists' }))
        router.push(`/forms/editor/${q.id}`)
      }
    } catch (e: any) {
      console.error('❌ Configure product failed', e)
      alert(e?.message || 'Failed to configure form')
    } finally {
      setConfiguringProductId(null)
    }
  }

  const handleCreateProductQuestionnaire = async (assignment: any) => {
    if (!token) return
    const productId = assignment?.treatmentId
    if (!productId) return
    setCreatingForProductId(productId)
    try {
      const name = `${assignment?.treatment?.name || 'Product'} Form`
      const description = `Questionnaire for ${assignment?.treatment?.name || 'product'}`
      const createRes = await fetch(`${baseUrl}/questionnaires/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: name, description, productId, formTemplateType: 'normal' }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to create product questionnaire')
      }
      const created = await createRes.json()
      const q = created?.data
      // No automatic cloning here; use the Rebuild from Template button in the editor
      setProductQStatus(prev => ({ ...prev, [productId]: 'exists' }))
      router.push(`/forms/editor/${q.id}`)
    } catch (e: any) {
      alert(e?.message || 'Failed to create product questionnaire')
    } finally {
      setCreatingForProductId(null)
    }
  }

  const handleDeleteProductQuestionnaire = async (assignment: any) => {
    if (!token) return
    const productId = assignment?.treatmentId
    if (!productId) return
    if (!confirm('Delete this product questionnaire? This cannot be undone.')) return
    setDeletingForProductId(productId)
    try {
      const res = await fetch(`${baseUrl}/questionnaires/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => null)
      const list = Array.isArray(data?.data) ? data.data : []
      const existing = list.find((q: any) => q.formTemplateType === 'normal') || list[0]
      if (!existing?.id) {
        alert('No questionnaire found to delete')
        return
      }
      const del = await fetch(`${baseUrl}/questionnaires/${existing.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const delData = await del.json().catch(() => ({}))
      if (!del.ok || delData?.success === false) {
        throw new Error(delData?.message || 'Failed to delete questionnaire')
      }
      setProductQStatus(prev => ({ ...prev, [productId]: 'none' }))
      await refreshQuestionnaires()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete questionnaire')
    } finally {
      setDeletingForProductId(null)
    }
  }

  const handleViewLive = (assignment: any) => {
    if (assignment.publishedUrl) {
      window.open(assignment.publishedUrl, "_blank")
    }
  }

  const handleCreateTemplate = async (sectionType: "personalization" | "account" | "doctor", category?: string) => {
    if (!token || creating) return

    setCreating(true)
    try {
      const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === category)?.label
      const name = sectionType === "account"
        ? "Universal Account Questions"
        : sectionType === "personalization"
          ? `${categoryLabel} Personalization Questions`
          : `${categoryLabel} Doctor Questions`

      const description = sectionType === "account"
        ? "Standard account creation questions shown in all product forms"
        : sectionType === "personalization"
          ? `Category-specific personalization questions for ${categoryLabel} products`
          : `Doctor-required questions for ${categoryLabel} products`

      // For account templates, clone from master user_profile steps
      if (sectionType === 'account') {
        const cloneRes = await fetch(`${baseUrl}/questionnaires/templates/account-from-master`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })
        if (!cloneRes.ok) {
          const err = await cloneRes.json().catch(() => ({}))
          throw new Error(err?.message || 'Failed to clone account template')
        }
        const cloned = await cloneRes.json()
        const q = cloned?.data
        await refreshQuestionnaires()
        if (q?.id) {
          router.push(`/forms/editor/${q.id}`)
        }
        return
      }

      const response = await fetch(`${baseUrl}/questionnaires/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: name,
          description,
          // set category only for non-account templates
          category: category,
          formTemplateType: 'standardized_template',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || "Failed to create template")
      }

      const data = await response.json()
      const template = data.data

      // Refresh questionnaires to get the new one
      await refreshQuestionnaires()

      // Navigate to editor
      router.push(`/forms/editor/${template.id}`)
    } catch (err: any) {
      console.error("Error creating template:", err)
      alert(err.message || "Failed to create template")
    } finally {
      setCreating(false)
    }
  }

  const isLocked = (assignment: any) => {
    return assignment.lockedUntil && new Date(assignment.lockedUntil) > new Date()
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Form Management</h1>
              <p className="text-[#6B7280] text-base">
                Configure product-specific forms and manage standardized question templates.
              </p>
            </div>
            <button 
              onClick={refresh} 
              disabled={loading}
              className="rounded-full px-6 py-2.5 border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 w-fit shadow-sm border border-[#E5E7EB]">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === "products"
                  ? "bg-[#4FA59C] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-[#F3F4F6]"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-6 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === "templates"
                  ? "bg-[#4FA59C] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-[#F3F4F6]"
              }`}
            >
              Standardized Questions
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-6 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === "account"
                  ? "bg-[#4FA59C] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-[#F3F4F6]"
              }`}
            >
              Account Questions
            </button>
          </div>

          {error && (
            <div className="rounded-2xl p-4 bg-red-50 border border-red-200 text-red-700 shadow-sm">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#1F2937]">Filter & Sort</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">Find the product form you want to configure</p>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#4B5563]">Search Products</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name..."
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#4B5563]">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#4B5563]">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#4B5563]">Sort By</label>
                      <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-[#6B7280]">
                <span>
                  Showing {filteredAndSortedAssignments.length} of {assignments.length} product forms
                </span>
                <div className="flex items-center gap-3">
                  {(searchQuery || selectedCategory || selectedStatus !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("")
                        setSelectedStatus("all")
                      }}
                      className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-xl transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={page <= 1 || loading} 
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className="px-4 py-2 text-sm font-medium border border-[#E5E7EB] rounded-xl text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Prev
                    </button>
                    <span className="text-xs px-3">Page {page} / {totalPages}</span>
                    <button 
                      disabled={page >= totalPages || loading} 
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 text-sm font-medium border border-[#E5E7EB] rounded-xl text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Forms List */}
              {loading ? (
                <div className="flex h-64 items-center justify-center text-[#6B7280]">
                  <Loader2 className="mr-3 h-6 w-6 animate-spin text-[#4FA59C]" />
                  <span className="text-base">Loading forms...</span>
                </div>
              ) : filteredAndSortedAssignments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-16">
                  <div className="flex flex-col items-center justify-center text-[#6B7280]">
                    <div className="bg-[#F3F4F6] rounded-full p-6 mb-4">
                      <Search className="h-12 w-12 text-[#9CA3AF]" />
                    </div>
                    <p className="text-lg text-[#4B5563]">No product forms found matching your filters.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedAssignments.map((assignment) => {
                    const locked = isLocked(assignment)
                    const isLive = assignment.publishedUrl && assignment.lastPublishedAt
                    const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === assignment.treatment?.category)?.label

                    return (
                      <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:border-[#4FA59C] transition-all">
                        <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-[#1F2937]">{assignment.treatment?.name || "Untitled Product"}</h3>
                              <div className="mt-2 flex items-center gap-2">
                                {categoryLabel && (
                                  <span className="inline-block px-2.5 py-1 bg-[#F3F4F6] text-[#4B5563] text-xs font-medium rounded-full border border-[#E5E7EB]">
                                    {categoryLabel}
                                  </span>
                                )}
                                {assignment?.treatmentId && productInfoById[assignment.treatmentId]?.placeholderSig && (
                                  <div className="text-xs text-[#9CA3AF]">{productInfoById[assignment.treatmentId]?.placeholderSig}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-2">
                            {!assignment.hasAssignment ? (
                              <span className="inline-block px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-full border border-[#E5E7EB] uppercase tracking-wide">
                                Not Configured
                              </span>
                            ) : isLive ? (
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 uppercase tracking-wide">
                                Live
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-yellow-50 text-[#F59E0B] text-xs font-medium rounded-full border border-yellow-200 uppercase tracking-wide">
                                Pending
                              </span>
                            )}
                            {locked && (
                              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Locked
                              </span>
                            )}
                            {assignment.hasAssignment && (
                              <span className="inline-block px-3 py-1 bg-white text-[#4B5563] text-xs font-medium rounded-full border border-[#E5E7EB] uppercase tracking-wide">
                                {assignment.layoutTemplate}
                              </span>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="space-y-2 text-sm">
                            {assignment.lastPublishedAt && (
                              <div className="flex items-center justify-between py-2 border-t border-[#E5E7EB]">
                                <span className="text-[#6B7280]">Last Updated:</span>
                                <span className="font-medium text-[#1F2937]">
                                  {new Date(assignment.lastPublishedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {locked && (
                              <div className="flex items-center justify-between py-2 border-t border-[#E5E7EB]">
                                <span className="text-[#6B7280]">Unlocks:</span>
                                <span className="font-medium text-amber-600">
                                  {new Date(assignment.lockedUntil!).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all ${
                                assignment.hasAssignment 
                                  ? 'bg-[#4FA59C] hover:bg-[#478F87] text-white'
                                  : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] border border-[#E5E7EB]'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              onClick={() => handleConfigureProduct(assignment)}
                              disabled={configuringProductId === assignment.treatmentId}
                            >
                              <Edit3 className="h-4 w-4" />
                              {configuringProductId === assignment.treatmentId
                                ? 'Opening...'
                                : (!assignment.hasAssignment ? "Configure Form" : locked ? "View Form" : "Edit Form")}
                            </button>
                            {productQStatus[assignment.treatmentId] !== 'exists' && (
                              <button
                                className="px-4 py-2.5 rounded-full border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleCreateProductQuestionnaire(assignment)}
                                disabled={creatingForProductId === assignment.treatmentId}
                              >
                                {creatingForProductId === assignment.treatmentId ? 'Creating...' : 'Create'}
                              </button>
                            )}
                            {isLive && (
                              <button
                                className="p-2.5 rounded-full border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] transition-all"
                                onClick={() => handleViewLive(assignment)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Standardized Questions Tab */}
          {activeTab === "templates" && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#1F2937]">Manage Standardized Templates</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">
                    Edit templates that are used across multiple product forms. Changes here will update all forms using these templates.
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full md:w-1/2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select a category...</option>
                        {CATEGORY_OPTIONS.filter(c => c.value).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCategory && (
                      <div className="space-y-4">
                        {/* Personalization Questions */}
                        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] overflow-hidden">
                          <div className="p-4 border-b border-[#E5E7EB]">
                            <h3 className="text-base font-semibold text-[#1F2937]">Personalization Questions</h3>
                            <p className="text-sm text-[#6B7280] mt-0.5">
                              Category: {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label}
                            </p>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-[#6B7280] mb-4">
                              These questions are shown in all {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label} product forms.
                            </p>
                            {(() => {
                              const categoryTemplate = (questionnaires || []).find(
                                (q: any) => q.formTemplateType === 'standardized_template' && q.category === selectedCategory
                              )
                              return (
                                <div className="grid gap-2">
                                  {categoryTemplate && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <button
                                        onClick={() => router.push(`/forms/editor/${categoryTemplate.id}`)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                        Edit Questions
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!token) return
                                          if (!confirm('Delete this personalization template? This cannot be undone.')) return
                                          try {
                                            const res = await fetch(`${baseUrl}/questionnaires/${categoryTemplate.id}`, {
                                              method: 'DELETE',
                                              headers: { Authorization: `Bearer ${token}` },
                                            })
                                            const data = await res.json().catch(() => ({}))
                                            if (!res.ok) throw new Error(data?.message || 'Failed to delete personalization template')
                                            await refreshQuestionnaires()
                                          } catch (e: any) {
                                            alert(e?.message || 'Failed to delete personalization template')
                                          }
                                        }}
                                        className="w-full px-4 py-2.5 rounded-full border border-[#E5E7EB] text-[#EF4444] hover:bg-[#FEF2F2] transition-all text-sm font-medium"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                  {!categoryTemplate && (
                                    <button
                                      onClick={() => handleCreateTemplate("personalization", selectedCategory)}
                                      disabled={creating}
                                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {creating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Layers className="h-4 w-4" />
                                      )}
                                      {creating ? "Creating..." : "Create Personalization Template"}
                                    </button>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {!selectedCategory && (
                      <div className="text-center py-12 text-[#6B7280]">
                        <div className="bg-[#F3F4F6] rounded-full p-6 mx-auto w-fit mb-4">
                          <Search className="h-12 w-12 text-[#9CA3AF]" />
                        </div>
                        <p>Select a category above to manage its standardized question templates.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "account" && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#1F2937]">Manage Account Questions</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">
                    Configure the universal account questions shown in every product form across all categories.
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    These questions are used globally. Changes will impact every product form.
                  </p>
                  {accountQuestionnaire ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => router.push(`/forms/editor/${accountQuestionnaire.id}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Account Template
                      </button>
                      <button
                        onClick={async () => {
                          if (!token) return
                          if (!confirm('Delete this account questionnaire? This cannot be undone.')) return
                          try {
                            const res = await fetch(`${baseUrl}/questionnaires/${accountQuestionnaire.id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            const data = await res.json().catch(() => ({}))
                            if (!res.ok) throw new Error(data?.message || 'Failed to delete account questionnaire')
                            await refreshQuestionnaires()
                          } catch (e: any) {
                            alert(e?.message || 'Failed to delete account questionnaire')
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-full border border-[#E5E7EB] text-[#EF4444] hover:bg-[#FEF2F2] transition-all text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreateTemplate("account")}
                      disabled={creating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Layers className="h-4 w-4" />
                      )}
                      {creating ? "Creating..." : "Create Account Template"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* {activeTab === "tenant" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generate Form for Tenant</CardTitle>
                  <CardDescription>
                    Review the currently selected tenant before generating a tailored form experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTenant ? (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{selectedTenant.name}</h3>
                          <p className="text-sm text-muted-foreground">Slug: {selectedTenant.slug}</p>
                        </div>
                        <Badge variant="secondary" className="uppercase tracking-wide text-xs">
                          {selectedTenant.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Business Type</span>
                          <p className="text-sm font-medium text-foreground">
                            {selectedTenant.businessType || "Not specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Activation Status</span>
                          <p className="text-sm font-medium text-foreground">{selectedTenant.active ? "Active" : "Inactive"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Created</span>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(selectedTenant.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Last Updated</span>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(selectedTenant.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {selectedTenant.owner && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">Primary Contact</h4>
                          <div className="grid gap-2 text-sm text-muted-foreground">
                            <span>{selectedTenant.owner.firstName} {selectedTenant.owner.lastName}</span>
                            <span>{selectedTenant.owner.email}</span>
                            {selectedTenant.owner.phoneNumber && <span>{selectedTenant.owner.phoneNumber}</span>}
                          </div>
                        </div>
                      )}

                      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                        Form generation actions will appear here. For now, review the tenant details above to confirm you have the correct tenant selected in the header.
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Select a tenant from the header to view tenant information and generate forms.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )} */}
        </main>
      </div>
    </div>
  )
}