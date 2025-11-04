import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        <Card className="mb-6">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Details
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {!editing ? (
                            <Button size="sm" onClick={() => setEditing(true)}>
                                Edit Details
                            </Button>
                        ) : (
                            <>
                                <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={saving}>
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
            </CardHeader>
            <CardContent className="space-y-4">
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

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium mb-1 block">Category</label>
                        {editing ? (
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select category...</option>
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-foreground">{product.category || "No Category"}</p>
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
            </CardContent>
        </Card>
    )
}

