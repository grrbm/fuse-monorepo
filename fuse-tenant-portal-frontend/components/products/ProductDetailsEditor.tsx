import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Package, Edit, X } from "lucide-react"
import { CATEGORY_OPTIONS } from "@fuse/enums"

interface Product {
    id: string
    name: string
    description: string
    price: number
    dosage: string
    activeIngredients: string[]
    categories?: string[]
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
        categories: product.categories || [],
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
            categories: product.categories || [],
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
                categories: formData.categories && formData.categories.length > 0 ? formData.categories : undefined,
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
            categories: product.categories || [],
            medicationSize: product.medicationSize || "",
            activeIngredients: product.activeIngredients?.join(", ") || "",
            slug: product.slug || "",
        })
        setError(null)
        setEditing(false)
    }

    const handleCategoryToggle = (categoryValue: string) => {
        setFormData(prev => {
            const currentCategories = prev.categories || []
            const newCategories = currentCategories.includes(categoryValue)
                ? currentCategories.filter(c => c !== categoryValue)
                : [...currentCategories, categoryValue]
            return { ...prev, categories: newCategories }
        })
    }

    return (
        <div className="bg-gradient-to-r from-muted/50 to-transparent rounded-xl p-5 border border-border/30 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight mb-2 flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        Product Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Configure the product information and specifications
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={product.isActive ? "default" : "secondary"} className="rounded-full px-3 py-1">
                        {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {!editing ? (
                        <Button size="sm" onClick={() => setEditing(true)} className="rounded-full shadow-md hover:shadow-lg transition-shadow">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                        </Button>
                    ) : (
                        <>
                            <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving} className="rounded-full shadow-md hover:shadow-lg transition-shadow">
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-shadow">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <div className="space-y-4 bg-card rounded-xl p-6 shadow-sm border border-border/40">
                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                        <span className="font-semibold">Error:</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Name */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Product Name *</label>
                        {editing ? (
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Semaglutide 2.5mg"
                            />
                        ) : (
                            <p className="text-foreground font-semibold">{product.name}</p>
                        )}
                    </div>

                    {/* URL Slug */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">
                            URL Slug
                            <span className="text-xs text-muted-foreground ml-2">(used in preview URLs)</span>
                        </label>
                        {editing ? (
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                placeholder="e.g., my-tirzepatide"
                                className="font-mono text-sm"
                            />
                        ) : (
                            <p className="text-foreground font-mono text-sm">{product.slug || "——"}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Description *</label>
                        {editing ? (
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description..."
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                            />
                        ) : (
                            <p className="text-muted-foreground">{product.description}</p>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Categories</label>
                        {editing ? (
                            <div className="max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-background">
                                <div className="grid grid-cols-2 gap-2">
                                    {CATEGORY_OPTIONS.filter((c: { value: string }) => c.value !== "").map((cat) => (
                                        <label key={cat.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.categories?.includes(cat.value) || false}
                                                onChange={() => handleCategoryToggle(cat.value)}
                                                className="rounded border-gray-300"
                                            />
                                            <span>{cat.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {product.categories && product.categories.length > 0 ? (
                                    product.categories.map(cat => {
                                        const catOption = CATEGORY_OPTIONS.find((c: { value: string }) => c.value === cat)
                                        return catOption && catOption.value !== "" ? (
                                            <Badge key={cat} variant="secondary">{catOption.label}</Badge>
                                        ) : null
                                    })
                                ) : (
                                    <p className="text-muted-foreground">No categories selected</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Dosage */}
                    <div>
                        <label className="text-sm font-medium mb-1 block">Dosage *</label>
                        {editing ? (
                            <Input
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                placeholder="e.g., 2.5mg/0.5ml"
                            />
                        ) : (
                            <p className="text-foreground">{product.dosage || "——"}</p>
                        )}
                    </div>

                    {/* Medication Size */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Medication Size</label>
                        {editing ? (
                            <Input
                                value={formData.medicationSize}
                                onChange={(e) => setFormData({ ...formData, medicationSize: e.target.value })}
                                placeholder="e.g., 10ml vial, 30 tablets"
                            />
                        ) : (
                            <p className="text-foreground">{product.medicationSize || "——"}</p>
                        )}
                    </div>

                    {/* Active Ingredients */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Active Ingredients *</label>
                        {editing ? (
                            <Input
                                value={formData.activeIngredients}
                                onChange={(e) => setFormData({ ...formData, activeIngredients: e.target.value })}
                                placeholder="Comma separated: Ingredient1, Ingredient2"
                            />
                        ) : (
                            <p className="text-foreground">{product.activeIngredients?.join(", ") || "——"}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

