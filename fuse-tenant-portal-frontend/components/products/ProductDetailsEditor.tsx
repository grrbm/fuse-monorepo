import { useState, useEffect } from "react"
import { Loader2, Save, Package } from "lucide-react"
import { CATEGORY_OPTIONS } from "@fuse/enums"

interface Product {
    id: string
    name: string
    description: string
    price: number
    dosage: string
    activeIngredients: string[]
    category?: string
    medicationSize?: string
    pharmacyProvider?: string
    pharmacyProductId?: string
    isActive: boolean
    slug?: string
}

interface ProductDetailsEditorProps {
    product: Product
    onUpdate: (updatedProduct: Partial<Product>) => Promise<void>
}

export function ProductDetailsEditor({ product, onUpdate }: ProductDetailsEditorProps) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        dosage: product.dosage,
        category: product.category || "",
        medicationSize: product.medicationSize || "",
        activeIngredients: product.activeIngredients?.join(", ") || "",
        slug: product.slug || "",
    })

    // Update form data when product changes
    useEffect(() => {
        setFormData({
            name: product.name,
            description: product.description,
            dosage: product.dosage,
            category: product.category || "",
            medicationSize: product.medicationSize || "",
            activeIngredients: product.activeIngredients?.join(", ") || "",
            slug: product.slug || "",
        })
    }, [product])

    const handleSave = async () => {
        setError(null)

        // Validate required fields
        if (!formData.name || formData.name.trim() === "") {
            setError("Product name is required")
            return
        }
        if (!formData.description || formData.description.trim() === "") {
            setError("Product description is required")
            return
        }
        if (!formData.dosage || formData.dosage.trim() === "") {
            setError("Dosage is required")
            return
        }

        const activeIngredientsArray = formData.activeIngredients.split(",").map(i => i.trim()).filter(Boolean)
        if (activeIngredientsArray.length === 0) {
            setError("At least one active ingredient is required")
            return
        }

        // Validate slug format (alphanumeric and hyphens only)
        if (formData.slug && formData.slug.trim() !== "") {
            const slugRegex = /^[a-z0-9-]+$/
            if (!slugRegex.test(formData.slug.trim())) {
                setError("URL slug can only contain lowercase letters, numbers, and hyphens")
                return
            }
        }

        setSaving(true)
        try {
            await onUpdate({
                name: formData.name,
                description: formData.description,
                dosage: formData.dosage,
                category: formData.category || undefined,
                medicationSize: formData.medicationSize || undefined,
                activeIngredients: activeIngredientsArray,
                slug: formData.slug.trim() || undefined,
            })
            setEditing(false)
            setError(null)
        } catch (error: any) {
            console.error("Failed to update product:", error)
            setError(error.message || "Failed to update product. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: product.name,
            description: product.description,
            dosage: product.dosage,
            category: product.category || "",
            medicationSize: product.medicationSize || "",
            activeIngredients: product.activeIngredients?.join(", ") || "",
            slug: product.slug || "",
        })
        setError(null)
        setEditing(false)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden mb-6">
            <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#F3F4F6] rounded-xl p-2">
                            <Package className="h-5 w-5 text-[#4FA59C]" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#1F2937]">Product Details</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            product.isActive 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!editing ? (
                            <button 
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 rounded-full bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium"
                            >
                                Edit Details
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handleCancel} 
                                    disabled={saving}
                                    className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-5">
                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 shadow-sm">
                        <span className="font-semibold">Error:</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Product Name */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Product Name *</label>
                        {editing ? (
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Semaglutide 2.5mg"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            />
                        ) : (
                            <p className="text-[#1F2937] font-semibold">{product.name}</p>
                        )}
                    </div>

                    {/* URL Slug */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">
                            URL Slug
                            <span className="text-xs text-[#9CA3AF] ml-2">(used in preview URLs)</span>
                        </label>
                        {editing ? (
                            <input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                placeholder="e.g., my-tirzepatide"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] font-mono focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            />
                        ) : (
                            <p className="text-[#6B7280] font-mono text-sm">{product.slug || "——"}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Description *</label>
                        {editing ? (
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description..."
                                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1F2937] min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all resize-none"
                            />
                        ) : (
                            <p className="text-[#6B7280]">{product.description}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Category</label>
                        {editing ? (
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            >
                                <option value="">Select category...</option>
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-[#1F2937]">{product.category || "No Category"}</p>
                        )}
                    </div>

                    {/* Dosage */}
                    <div>
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Dosage *</label>
                        {editing ? (
                            <input
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                placeholder="e.g., 2.5mg/0.5ml"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            />
                        ) : (
                            <p className="text-[#1F2937]">{product.dosage || "——"}</p>
                        )}
                    </div>

                    {/* Medication Size */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Medication Size</label>
                        {editing ? (
                            <input
                                value={formData.medicationSize}
                                onChange={(e) => setFormData({ ...formData, medicationSize: e.target.value })}
                                placeholder="e.g., 10ml vial, 30 tablets"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            />
                        ) : (
                            <p className="text-[#1F2937]">{product.medicationSize || "——"}</p>
                        )}
                    </div>

                    {/* Active Ingredients */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Active Ingredients *</label>
                        {editing ? (
                            <input
                                value={formData.activeIngredients}
                                onChange={(e) => setFormData({ ...formData, activeIngredients: e.target.value })}
                                placeholder="Comma separated: Ingredient1, Ingredient2"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            />
                        ) : (
                            <p className="text-[#1F2937]">{product.activeIngredients?.join(", ") || "——"}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
