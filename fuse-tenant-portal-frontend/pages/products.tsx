import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit2, Trash2, Package, DollarSign, Building2, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { CATEGORY_OPTIONS } from "@fuse/enums"
import { toast } from "sonner"

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
  pharmacyWholesaleCost?: number
  suggestedRetailPrice?: number
  pharmacyProductId?: string
  requiredDoctorQuestions?: any[]
  isActive: boolean
  createdAt: string
}

interface PharmacyVendor {
  id: string
  name: string
  baseUrl: string
  description: string
}



export default function Products() {
  const router = useRouter()
  const { token } = useAuth()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [pharmacyProviders, setPharmacyVendors] = useState<PharmacyVendor[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'selected' | 'all'>('selected')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    dosage: "",
    activeIngredients: [] as string[],
    category: "",
    medicationSize: "",
    pharmacyProvider: "",
    pharmacyProductId: "",
    requiredDoctorQuestions: [] as any[],
    isActive: true,
  })

  useEffect(() => {
    fetchProducts()
    fetchPharmacyVendors()
    fetchCategories()
  }, [selectedCategory, showActiveOnly, selectedPharmacy])

  useEffect(() => {
    setShowActiveOnly(activeTab === 'selected')
  }, [activeTab])

  const fetchProducts = async () => {
    if (!token) return
    setLoading(true)

    try {
      // Always use pagination; fetch all pages and merge so we show ALL products
      const baseParams = new URLSearchParams()
      baseParams.append("page", "1")
      baseParams.append("limit", "100") // server max is 100
      if (selectedCategory) baseParams.append("category", selectedCategory)
      if (activeTab === 'selected') baseParams.append("isActive", "true")
      if (selectedPharmacy) baseParams.append("pharmacyProvider", selectedPharmacy)

      const firstRes = await fetch(`${baseUrl}/products-management?${baseParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!firstRes.ok) throw new Error("Failed to fetch products")
      const firstJson = await firstRes.json()
      const firstPageProducts: Product[] = firstJson?.data?.products || []
      const totalPages: number = firstJson?.data?.pagination?.totalPages || 1

      if (totalPages <= 1) {
        setProducts(firstPageProducts)
      } else {
        // Fetch remaining pages in parallel
        const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
        const requests = pageNumbers.map((page) => {
          const params = new URLSearchParams(baseParams.toString())
          params.set("page", String(page))
          return fetch(`${baseUrl}/products-management?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()).catch(() => null)
        })
        const pages = await Promise.all(requests)
        const restProducts: Product[] = pages.flatMap(p => (p?.data?.products || []))
        setProducts([...firstPageProducts, ...restProducts])
      }
    } catch (error: any) {
      console.error("❌ Error fetching products:", error)
      setSaveMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPharmacyVendors = async () => {
    if (!token) return

    try {
      const response = await fetch(`${baseUrl}/products-management/vendors/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch pharmacy vendors")

      const data = await response.json()
      setPharmacyVendors(data.data || [])
    } catch (error: any) {
      console.error("❌ Error fetching pharmacy vendors:", error)
    }
  }

  const fetchCategories = async () => {
    if (!token) return

    try {
      const response = await fetch(`${baseUrl}/products-management/categories/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch categories")

      const data = await response.json()
      setCategories(data.data || [])
    } catch (error: any) {
      console.error("❌ Error fetching categories:", error)
    }
  }

  const handleCreateProduct = async () => {
    if (!token) return

    try {
      // Create a skeleton product with minimum required fields
      const response = await fetch(`${baseUrl}/products-management`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "New Product",
          description: "Edit product details below",
          price: 1, // Minimum positive price
          dosage: "TBD",
          activeIngredients: ["Ingredient"], // At least one required
          isActive: false, // Start as inactive
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Validation errors:', data.errors)
        throw new Error(data.message || "Failed to create product")
      }

      // Navigate to the product editor
      router.push(`/products/editor/${data.data.id}`)
    } catch (error: any) {
      console.error("❌ Error creating product:", error)
      setSaveMessage(error.message)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      dosage: product.dosage,
      activeIngredients: product.activeIngredients || [],
      category: product.category || "",
      medicationSize: product.medicationSize || "",
      pharmacyProvider: product.pharmacyProvider || "",
      pharmacyProductId: product.pharmacyProductId || "",
      requiredDoctorQuestions: product.requiredDoctorQuestions || [],
      isActive: product.isActive,
    })
    setShowModal(true)
  }

  const handleSaveProduct = async () => {
    if (!token) return
    setSaveMessage(null)

    const url = editingProduct
      ? `${baseUrl}/products-management/${editingProduct.id}`
      : `${baseUrl}/products-management`
    const method = editingProduct ? "PUT" : "POST"

    try {
      // Clean up the data before sending
      const cleanedData: any = {
        ...formData,
        // Remove empty strings
        pharmacyProvider: formData.pharmacyProvider || undefined,
        pharmacyProductId: formData.pharmacyProductId || undefined,
        medicationSize: formData.medicationSize || undefined,
        category: formData.category || undefined,
      }

      console.log('📤 Sending product data:', cleanedData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      })

      const data = await response.json()
      console.log('📥 Server response:', data)

      if (!response.ok) {
        const errorMsg = data.message || data.error || "Failed to save product"
        const validationErrors = data.errors ? JSON.stringify(data.errors) : ""
        throw new Error(`${errorMsg} ${validationErrors}`)
      }

      setSaveMessage(data.message || "Product saved successfully")
      setShowModal(false)
      fetchProducts()
    } catch (error: any) {
      console.error("❌ Error saving product:", error)
      setSaveMessage(error.message)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!token || !confirm("Are you sure you want to deactivate this product?")) return

    try {
      const response = await fetch(`${baseUrl}/products-management/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to delete product")

      const data = await response.json()
      setSaveMessage(data.message || "Product deactivated successfully")
      fetchProducts()
    } catch (error: any) {
      console.error("❌ Error deleting product:", error)
      setSaveMessage(error.message)
    }
  }

  const handleToggleActive = async (product: Product) => {
    if (!token) return

    // If activating (product is currently inactive), navigate to product editor
    if (!product.isActive) {
      router.push(`/products/editor/${product.id}`)
      return
    }

    // If deactivating, do it directly
    try {
      const response = await fetch(`${baseUrl}/products-management/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: false }),
      })

      if (!response.ok) throw new Error("Failed to deactivate product")

      const data = await response.json()
      setSaveMessage(data.message || "Product deactivated")
      fetchProducts()
    } catch (error: any) {
      console.error("❌ Error deactivating product:", error)
      setSaveMessage(error.message)
    }
  }

  const handleUpdateCategory = async (productId: string, newCategory: string, prevCategory?: string) => {
    if (!token) return
    // If "No Category" is selected, do nothing and revert UI
    if (newCategory === "") {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, category: prevCategory } : p))
      return
    }
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, category: newCategory || undefined } : p))
    try {
      const response = await fetch(`${baseUrl}/products-management/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category: newCategory === "" ? null : newCategory }),
      })
      if (!response.ok) {
        throw new Error('Failed to update category')
      }
      toast.success('Category saved')
    } catch (error: any) {
      console.error("❌ Error updating category:", error)
      toast.error(error.message || 'Failed to update category')
      // Revert by refetching
      fetchProducts()
    }
  }

  const handleDeactivateAll = async () => {
    if (!token) return
    if (!confirm("Are you sure you want to deactivate ALL products? This will affect all products in the system.")) return

    try {
      const activeProducts = products.filter(p => p.isActive)

      if (activeProducts.length === 0) {
        setSaveMessage("No active products to deactivate")
        return
      }

      // Deactivate each product
      const promises = activeProducts.map(product =>
        fetch(`${baseUrl}/products-management/${product.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: false }),
        })
      )

      await Promise.all(promises)
      setSaveMessage(`Successfully deactivated ${activeProducts.length} products`)
      fetchProducts()
    } catch (error: any) {
      console.error("❌ Error deactivating all products:", error)
      setSaveMessage(error.message)
    }
  }

  const calculateProfitMargin = (wholesale: number, retail: number) => {
    if (!wholesale || !retail) return 0
    return ((retail - wholesale) / wholesale * 100).toFixed(1)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Product Management</h1>
              <p className="text-muted-foreground">
                Manage your product catalog, pharmacy pricing, and medication details.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDeactivateAll}>
                Deactivate All
              </Button>
              <Button onClick={handleCreateProduct}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
          </div>

          {saveMessage && (
            <Card className="border-green-500/40 bg-green-500/10">
              <CardContent className="p-4 text-sm text-green-700 dark:text-green-400">{saveMessage}</CardContent>
            </Card>
          )}

          <div className="flex items-center gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('selected')}
              className={`px-3 py-2 text-sm border-b-2 transition-colors ${activeTab === 'selected' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Selected Products
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 text-sm border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              All Products
            </button>
          </div>

          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Category</label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((cat: { value: string; label: string }) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Pharmacy</label>
              <select
                value={selectedPharmacy || ""}
                onChange={(e) => setSelectedPharmacy(e.target.value || null)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Pharmacies</option>
                {pharmacyProviders.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading products...
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-12 w-12 mb-4" />
                <p>No products found. Create your first product to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className={!product.isActive ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>
                      </div>
                      <div className="flex gap-2 ml-2">
                        {product.isActive ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/products/editor/${product.id}`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleToggleActive(product)}
                            >
                              Deactivate
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleToggleActive(product)}
                          >
                            Configure
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={!product.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Category</label>
                      <select
                        value={product.category || ""}
                        onChange={(e) => handleUpdateCategory(product.id, e.target.value, product.category)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No Category</option>
                        {CATEGORY_OPTIONS.filter((c: { value: string }) => c.value !== "").map((cat: { value: string; label: string }) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Dosage:</span>
                        <span className="font-medium">{product.dosage}</span>
                      </div>

                      {product.medicationSize && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{product.medicationSize}</span>
                        </div>
                      )}

                      {product.pharmacyProvider && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Pharmacy:</span>
                          <span className="font-medium">
                            {pharmacyProviders.find(v => v.id === product.pharmacyProvider)?.name || product.pharmacyProvider}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Wholesale Cost:</span>
                        <span className="font-medium text-foreground">${product.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {product.activeIngredients && product.activeIngredients.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Active Ingredients:</strong> {product.activeIngredients.join(", ")}
                      </div>
                    )}

                    {!product.isActive && (
                      <Badge variant="warning" className="w-full justify-center">Inactive</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{editingProduct ? "Edit Product" : "Create Product"}</h2>
                <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Semaglutide 2.5mg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category...</option>
                    {CATEGORY_OPTIONS.map((cat: { value: string; label: string }) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed product description..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Dosage *</label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 2.5mg/0.5ml"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Medication Size</label>
                  <Input
                    value={formData.medicationSize}
                    onChange={(e) => setFormData({ ...formData, medicationSize: e.target.value })}
                    placeholder="e.g., 10ml vial, 30 tablets"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Active Ingredients *</label>
                  <Input
                    value={formData.activeIngredients.join(", ")}
                    onChange={(e) =>
                      setFormData({ ...formData, activeIngredients: e.target.value.split(",").map((s) => s.trim()) })
                    }
                    placeholder="Comma separated: Ingredient1, Ingredient2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pharmacy Vendor</label>
                  <select
                    value={formData.pharmacyProvider}
                    onChange={(e) => setFormData({ ...formData, pharmacyProvider: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select vendor...</option>
                    {pharmacyProviders.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pharmacy Product ID</label>
                  <Input
                    value={formData.pharmacyProductId}
                    onChange={(e) => setFormData({ ...formData, pharmacyProductId: e.target.value })}
                    placeholder="SKU or ID from pharmacy system"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pharmacy Wholesale Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">The wholesale price from the pharmacy</p>
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Product is active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct}>
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

