import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useTenant } from "@/contexts/TenantContext"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  const [productInfoById, setProductInfoById] = useState<Record<string, { dosage?: string }>>({})

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

  // Fetch product info (e.g., dosage) for each assignment's productId
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
          setProductInfoById(prev => ({ ...prev, [productId]: { dosage: data.data.dosage || undefined } }))
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
    const list = (questionnaires || []).filter((q: any) => q.formTemplateType === 'user_profile')
    return list.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0] || null
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Form Management</h1>
              <p className="text-muted-foreground">
                Configure product-specific forms and manage standardized question templates.
              </p>
            </div>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("products")}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "products"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "templates"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Standardized Questions
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "account"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Account Questions
              </button>
              {/* <button
                onClick={() => setActiveTab("tenant")}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "tenant"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Generate Form for Tenant
              </button> */}
            </div>
          </div>

          {error && (
            <Card className="border-destructive/40 bg-destructive/10">
              <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <>
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filter & Sort</CardTitle>
                  <CardDescription>Find the product form you want to configure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Products</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name..."
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
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
                      <label className="text-sm font-medium">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
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
                      <label className="text-sm font-medium">Sort By</label>
                      <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredAndSortedAssignments.length} of {assignments.length} product forms
                </span>
                <div className="flex items-center gap-2">
                  {(searchQuery || selectedCategory || selectedStatus !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("")
                        setSelectedStatus("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(Math.max(1, page - 1))}>
                      Prev
                    </Button>
                    <span className="text-xs">Page {page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Forms List */}
              {loading ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading forms...
                </div>
              ) : filteredAndSortedAssignments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Search className="h-12 w-12 mb-4" />
                    <p>No product forms found matching your filters.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedAssignments.map((assignment) => {
                    const locked = isLocked(assignment)
                    const isLive = assignment.publishedUrl && assignment.lastPublishedAt
                    const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === assignment.treatment?.category)?.label

                    return (
                      <Card key={assignment.id} className="hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{assignment.treatment?.name || "Untitled Product"}</CardTitle>
                              <div className="mt-1 flex items-center gap-2">
                                {categoryLabel && (
                                  <Badge variant="secondary" className="text-xs">
                                    {categoryLabel}
                                  </Badge>
                                )}
                                {assignment?.treatmentId && productInfoById[assignment.treatmentId]?.dosage && (
                                  <div className="text-xs text-muted-foreground">{productInfoById[assignment.treatmentId]?.dosage}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-2">
                            {!assignment.hasAssignment ? (
                              <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                                Not Configured
                              </Badge>
                            ) : isLive ? (
                              <Badge variant="info" className="text-xs uppercase tracking-wide">
                                Live
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-xs uppercase tracking-wide">
                                Pending
                              </Badge>
                            )}
                            {locked && (
                              <Badge variant="warning" className="text-xs uppercase tracking-wide">
                                <Clock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                            {assignment.hasAssignment && (
                              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                                {assignment.layoutTemplate}
                              </Badge>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {assignment.lastPublishedAt && (
                              <div className="flex items-center justify-between">
                                <span>Last Updated:</span>
                                <span className="font-medium">
                                  {new Date(assignment.lastPublishedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {locked && (
                              <div className="flex items-center justify-between">
                                <span>Unlocks:</span>
                                <span className="font-medium text-amber-600">
                                  {new Date(assignment.lockedUntil!).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Template Summary removed per requirements */}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1"
                              variant={assignment.hasAssignment ? "default" : "secondary"}
                              size="sm"
                              onClick={() => handleConfigureProduct(assignment)}
                              disabled={configuringProductId === assignment.treatmentId}
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              {configuringProductId === assignment.treatmentId
                                ? 'Opening...'
                                : (!assignment.hasAssignment ? "Configure Form" : locked ? "View Form" : "Edit Form")}
                            </Button>
                            {productQStatus[assignment.treatmentId] !== 'exists' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateProductQuestionnaire(assignment)}
                                disabled={creatingForProductId === assignment.treatmentId}
                              >
                                {creatingForProductId === assignment.treatmentId ? 'Creating...' : 'Create Questionnaire'}
                              </Button>
                            )}
                            {isLive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLive(assignment)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Standardized Questions Tab */}
          {activeTab === "templates" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage Standardized Templates</CardTitle>
                  <CardDescription>
                    Edit templates that are used across multiple product forms. Changes here will update all forms using these templates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Personalization Questions</CardTitle>
                            <CardDescription>
                              Category: {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              These questions are shown in all {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label} product forms.
                            </p>
                            {(() => {
                              const categoryTemplate = (questionnaires || []).find(
                                (q: any) => q.formTemplateType === 'standardized_template' && q.category === selectedCategory
                              )
                              return (
                                <div className="grid gap-2">
                                  {categoryTemplate && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <Button
                                        onClick={() => router.push(`/forms/editor/${categoryTemplate.id}`)}
                                        className="w-full"
                                      >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Edit Personalization Questions
                                      </Button>
                                      <Button
                                        variant="outline"
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
                                        className="w-full"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  )}
                                  {!categoryTemplate && (
                                    <Button
                                      onClick={() => handleCreateTemplate("personalization", selectedCategory)}
                                      className="w-full"
                                      disabled={creating}
                                    >
                                      {creating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <Layers className="mr-2 h-4 w-4" />
                                      )}
                                      {creating ? "Creating..." : "Create Personalization Template"}
                                    </Button>
                                  )}
                                </div>
                              )
                            })()}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {!selectedCategory && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a category above to manage its standardized question templates.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "account" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage Account Questions</CardTitle>
                  <CardDescription>
                    Configure the universal account questions shown in every product form across all categories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    These questions are used globally. Changes will impact every product form.
                  </p>
                  {accountQuestionnaire ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => router.push(`/forms/editor/${accountQuestionnaire.id}`)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Account Template
                      </Button>
                      <Button
                        variant="outline"
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
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCreateTemplate("account")}
                      variant="outline"
                      className="w-full"
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Layers className="mr-2 h-4 w-4" />
                      )}
                      {creating ? "Creating..." : "Create Account Template"}
                    </Button>
                  )}
                </CardContent>
              </Card>
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