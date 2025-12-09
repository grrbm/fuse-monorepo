import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { Loader2, RefreshCcw, Search, Edit3, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const SORT_OPTIONS = [
  { value: "name_asc", label: "A → Z" },
  { value: "name_desc", label: "Z → A" },
  { value: "updated_desc", label: "Recently Updated" },
  { value: "updated_asc", label: "Oldest First" },
] as const

export default function Forms() {
  const router = useRouter()
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", [])
  const { token } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSort, setSelectedSort] = useState("name_asc")
  const [creating, setCreating] = useState(false)
  const [productFormTemplates, setProductFormTemplates] = useState<Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
    user?: { id: string; email: string; firstName?: string; lastName?: string } | null;
  }>>([])

  // Fetch product form templates
  useEffect(() => {
    const fetchProductFormTemplates = async () => {
      if (!token) return
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${baseUrl}/questionnaires/templates/product-forms`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const data = await res.json()
          const forms = Array.isArray(data?.data) ? data.data : []
          setProductFormTemplates(forms.map((f: any) => ({
            id: f.id,
            title: f.title || 'Untitled Form',
            description: f.description || '',
            createdAt: f.createdAt || '',
            user: f.user || null,
          })))
        } else {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || "Failed to load templates")
        }
      } catch (error: any) {
        console.error('Failed to fetch product form templates:', error)
        setError(error.message || 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    }

    fetchProductFormTemplates()
  }, [token, baseUrl])

  const refresh = async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${baseUrl}/questionnaires/templates/product-forms`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const forms = Array.isArray(data?.data) ? data.data : []
        setProductFormTemplates(forms.map((f: any) => ({
          id: f.id,
          title: f.title || 'Untitled Form',
          description: f.description || '',
          createdAt: f.createdAt || '',
          user: f.user || null,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch product form templates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = [...productFormTemplates]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((template) =>
        template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      const titleA = a.title || ""
      const titleB = b.title || ""

      switch (selectedSort) {
        case "name_asc":
          return titleA.localeCompare(titleB)
        case "name_desc":
          return titleB.localeCompare(titleA)
        default:
          return 0
      }
    })

    return filtered
  }, [productFormTemplates, searchQuery, selectedSort])

  const handleCreateTemplate = async () => {
    if (!token || creating) return

    setCreating(true)
    try {
      const response = await fetch(`${baseUrl}/questionnaires/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `New Template`,
          description: `Template created on ${new Date().toLocaleDateString()}`,
          formTemplateType: 'normal',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || "Failed to create template")
      }

      const data = await response.json()
      const template = data.data

      router.push(`/forms/editor/${template.id}`)
    } catch (err: any) {
      console.error("Error creating template:", err)
      alert(err.message || "Failed to create template")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!token) return
    if (!confirm('Delete this template? This cannot be undone.')) return

    try {
      const res = await fetch(`${baseUrl}/questionnaires/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to delete template')

      // Refetch templates after deletion
      await refresh()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete template')
    }
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Medical Question Templates</h1>
              <p className="text-[#6B7280] text-base">
                Manage and edit medical question templates for patient intake forms.
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

          {error && (
            <div className="rounded-2xl p-4 bg-red-50 border border-red-200 text-red-700 shadow-sm">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 pb-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1F2937]">Filter & Sort</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">Find the template you want to edit</p>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#4B5563]">Search Templates</label>
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

          {/* Results Summary and Create Button */}
          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <span>
              Showing {filteredAndSortedTemplates.length} of {productFormTemplates.length} templates
            </span>
            <div className="flex items-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleCreateTemplate}
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                {creating ? 'Creating...' : 'Create New Template'}
              </button>
            </div>
          </div>

          {/* Templates List */}
          {loading ? (
            <div className="flex h-64 items-center justify-center text-[#6B7280]">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-[#4FA59C]" />
              <span className="text-base">Loading templates...</span>
            </div>
          ) : filteredAndSortedTemplates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-16">
              <div className="flex flex-col items-center justify-center text-[#6B7280]">
                <div className="bg-[#F3F4F6] rounded-full p-6 mb-4">
                  <Search className="h-12 w-12 text-[#9CA3AF]" />
                </div>
                <p className="text-lg text-[#4B5563]">
                  {productFormTemplates.length === 0
                    ? "No templates found. Create your first template to get started."
                    : "No templates found matching your filters."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:border-[#4FA59C] transition-all">
                  <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#1F2937]">{template.title || "Untitled Template"}</h3>
                        {template.description && !template.description.startsWith('Questionnaire for') && (
                          <p className="text-sm text-[#6B7280] mt-2">{template.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Creator info */}
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      {template.user ? (
                        <>
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-medium text-white">
                              {template.user.firstName?.charAt(0).toUpperCase() || template.user.email?.charAt(0).toUpperCase() || 'D'}
                            </span>
                          </div>
                          <span className="truncate">
                            Created by {template.user.firstName && template.user.lastName
                              ? `${template.user.firstName} ${template.user.lastName}`
                              : template.user.email}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-medium text-white">S</span>
                          </div>
                          <span>System template</span>
                        </>
                      )}
                      {template.createdAt && (
                        <span className="text-[#9CA3AF]">
                          • {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all bg-[#4FA59C] hover:bg-[#478F87] text-white"
                        onClick={() => router.push(`/forms/editor/${template.id}`)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Template
                      </button>
                      <button
                        className="px-4 py-2.5 rounded-full border border-[#E5E7EB] text-[#EF4444] hover:bg-[#FEF2F2] text-sm font-medium transition-all"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
