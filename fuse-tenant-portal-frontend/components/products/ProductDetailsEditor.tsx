import { useState, useEffect, useRef } from "react"
import { Loader2, Save, Package, RefreshCw, Upload, X, Image as ImageIcon } from "lucide-react"
import { CATEGORY_OPTIONS } from "@fuse/enums"
import { useAuth } from "@/contexts/AuthContext"

interface Product {
    id: string
    name: string
    description: string
    price: number
    placeholderSig: string
    activeIngredients: string[]
    category?: string
    categories?: string[]
    medicationSize?: string
    pharmacyProvider?: string
    pharmacyProductId?: string
    isActive: boolean
    slug?: string
    imageUrl?: string
}

interface ProductDetailsEditorProps {
    product: Product
    onUpdate: (updatedProduct: Partial<Product>) => Promise<void>
}

export function ProductDetailsEditor({ product, onUpdate }: ProductDetailsEditorProps) {
    const { token } = useAuth()
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null)

    // Helper function to generate slug from product name and medication size
    const generateSlug = (name: string, medicationSize: string) => {
        const parts = [name, medicationSize].filter(Boolean)
        return parts.join(" - ")
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        placeholderSig: product.placeholderSig,
        categories: Array.isArray(product.categories) && product.categories.length > 0
            ? product.categories
            : product.category
                ? [product.category]
                : [],
        medicationSize: product.medicationSize || "",
        activeIngredients: product.activeIngredients?.join(", ") || "",
        slug: product.slug || generateSlug(product.name, product.medicationSize || ""),
    })

    // Update form data and image preview when product changes
    useEffect(() => {
        setFormData({
            name: product.name,
            description: product.description,
            placeholderSig: product.placeholderSig,
            categories: Array.isArray(product.categories) && product.categories.length > 0
                ? product.categories
                : product.category
                    ? [product.category]
                    : [],
            medicationSize: product.medicationSize || "",
            activeIngredients: product.activeIngredients?.join(", ") || "",
            slug: product.slug || generateSlug(product.name, product.medicationSize || ""),
        })
        setImagePreview(product.imageUrl || null)
    }, [product])

    // Function to regenerate slug from current name and medication size
    const handleRegenerateSlug = () => {
        const newSlug = generateSlug(formData.name, formData.medicationSize)
        setFormData({ ...formData, slug: newSlug })
    }

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file')
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB')
            return
        }

        setError(null)
        setUploadingImage(true)

        try {
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch(`${baseUrl}/products/${product.id}/upload-image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload image')
            }

            setImagePreview(data.data.imageUrl)
            // Trigger parent update to refresh product data
            await onUpdate({ imageUrl: data.data.imageUrl })
        } catch (error: any) {
            console.error('Failed to upload image:', error)
            setError(error.message || 'Failed to upload image. Please try again.')
        } finally {
            setUploadingImage(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // Handle image removal
    const handleRemoveImage = async () => {
        if (!imagePreview) return

        setError(null)
        setUploadingImage(true)

        try {
            const response = await fetch(`${baseUrl}/products/${product.id}/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ removeImage: true }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove image')
            }

            setImagePreview(null)
            // Trigger parent update to refresh product data
            await onUpdate({ imageUrl: undefined })
        } catch (error: any) {
            console.error('Failed to remove image:', error)
            setError(error.message || 'Failed to remove image. Please try again.')
        } finally {
            setUploadingImage(false)
        }
    }

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
        if (!formData.placeholderSig || formData.placeholderSig.trim() === "") {
            setError("Placeholder Sig is required")
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
                placeholderSig: formData.placeholderSig,
                categories: formData.categories,
                category: formData.categories[0] || undefined,
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
            placeholderSig: product.placeholderSig,
            categories: Array.isArray(product.categories) && product.categories.length > 0
                ? product.categories
                : product.category
                    ? [product.category]
                    : [],
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${product.isActive
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

                {/* Product Image Section */}
                <div className="border-b border-[#E5E7EB] pb-5">
                    <label className="text-sm font-medium text-[#4B5563] mb-3 block">Product Image</label>
                    <div className="flex items-start gap-4">
                        {/* Image Preview */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-xl border-2 border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden flex items-center justify-center">
                                {imagePreview ? (
                                    <img 
                                        src={imagePreview} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="h-12 w-12 text-[#D1D5DB]" />
                                )}
                            </div>
                            {imagePreview && editing && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={uploadingImage}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                                    title="Remove image"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Upload Controls */}
                        {editing && (
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            {imagePreview ? 'Change Image' : 'Upload Image'}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-[#9CA3AF] mt-2">
                                    Maximum size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                                </p>
                            </div>
                        )}

                        {!editing && !imagePreview && (
                            <div className="flex-1">
                                <p className="text-[#6B7280] text-sm">No image uploaded</p>
                            </div>
                        )}
                    </div>
                </div>

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
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        placeholder="e.g., my-tirzepatide-10ml"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] font-mono focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRegenerateSlug}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] transition-all text-sm font-medium"
                                        title="Generate slug from Product Name and Medication Size"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Regenerate
                                    </button>
                                </div>
                                <p className="text-xs text-[#9CA3AF]">
                                    Auto-generated from Product Name and Medication Size. Click "Regenerate" to reset.
                                </p>
                            </div>
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

                    {/* Categories */}
                    <div>
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Categories</label>
                        {editing ? (
                            <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                                {CATEGORY_OPTIONS.filter((cat) => cat.value).map((cat) => {
                                    const isChecked = formData.categories.includes(cat.value)
                                    return (
                                        <label key={cat.value} className="flex items-center gap-3 text-sm text-[#1F2937]">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const next = new Set(formData.categories)
                                                    if (e.target.checked) {
                                                        next.add(cat.value)
                                                    } else {
                                                        next.delete(cat.value)
                                                    }
                                                    setFormData({
                                                        ...formData,
                                                        categories: Array.from(next),
                                                    })
                                                }}
                                                className="h-4 w-4 rounded border-[#D1D5DB] text-[#4FA59C] focus:ring-[#4FA59C]"
                                            />
                                            <span>{cat.label}</span>
                                        </label>
                                    )
                                })}
                                {formData.categories.length === 0 && (
                                    <p className="text-xs text-[#9CA3AF]">Select at least one category if applicable.</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const categories = Array.isArray(product.categories) && product.categories.length > 0
                                        ? product.categories
                                        : product.category
                                            ? [product.category]
                                            : []
                                    if (categories.length === 0) {
                                        return <span className="text-[#6B7280]">No Categories</span>
                                    }
                                    return categories.map((value) => {
                                        const option = CATEGORY_OPTIONS.find((opt) => opt.value === value)
                                        return (
                                            <span
                                                key={value}
                                                className="inline-flex items-center rounded-full bg-[#E0F2F1] text-[#196459] px-3 py-1 text-xs font-medium"
                                            >
                                                {option?.label || value}
                                            </span>
                                        )
                                    })
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Placeholder Sig */}
                    <div>
                        <label className="text-sm font-medium text-[#4B5563] mb-2 block">Placeholder Sig *</label>
                        {editing ? (
                            <input
                                value={formData.placeholderSig}
                                onChange={(e) => setFormData({ ...formData, placeholderSig: e.target.value })}
                                placeholder="e.g., 2.5mg/0.5ml"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                            />
                        ) : (
                            <p className="text-[#1F2937]">{product.placeholderSig || "——"}</p>
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
