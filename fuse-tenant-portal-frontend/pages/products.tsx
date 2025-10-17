import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit2, Trash2, Package, DollarSign, Building2, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
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
  const [quickEditMode, setQuickEditMode] = useState(false)
  const [quickEditData, setQuickEditData] = useState<Record<string, { pharmacyWholesaleCost: number; pharmacyProvider: string }>>({})
  const [savingProducts, setSavingProducts] = useState<Set<string>>(new Set())

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
    pharmacyWholesaleCost: 0,
    suggestedRetailPrice: 0,
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

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: 0,
      dosage: "",
      activeIngredients: [],
      category: "",
      medicationSize: "",
      pharmacyProvider: "",
      pharmacyWholesaleCost: 0,
      suggestedRetailPrice: 0,
      pharmacyProductId: "",
      requiredDoctorQuestions: [],
      isActive: true,
    })
    setShowModal(true)
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
      pharmacyWholesaleCost: product.pharmacyWholesaleCost || 0,
      suggestedRetailPrice: product.suggestedRetailPrice || 0,
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
        // Remove fields with 0 values (optional fields)
        pharmacyWholesaleCost: formData.pharmacyWholesaleCost > 0 ? formData.pharmacyWholesaleCost : undefined,
        suggestedRetailPrice: formData.suggestedRetailPrice > 0 ? formData.suggestedRetailPrice : undefined,
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
    try {
      const response = await fetch(`${baseUrl}/products-management/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      })

      if (!response.ok) throw new Error("Failed to update product status")

      const data = await response.json()
      setSaveMessage(data.message || (product.isActive ? "Product deactivated" : "Product activated"))
      fetchProducts()
    } catch (error: any) {
      console.error("❌ Error toggling product status:", error)
      setSaveMessage(error.message)
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

  const handleQuickEditSave = async (productId: string) => {
    if (!token || !quickEditData[productId]) return

    setSavingProducts(prev => new Set(prev).add(productId))

    try {
      const response = await fetch(`${baseUrl}/products-management/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: productId,
          pharmacyWholesaleCost: quickEditData[productId].pharmacyWholesaleCost,
          pharmacyProvider: quickEditData[productId].pharmacyProvider
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, ...quickEditData[productId] }
            : p
        ))
        
        setQuickEditData(prev => {
          const newData = { ...prev }
          delete newData[productId]
          return newData
        })

        setSaveMessage('Product updated successfully')
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        throw new Error(data.message || 'Failed to update product')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save changes')
    } finally {
      setSavingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const initializeQuickEditData = (product: Product) => {
    if (!quickEditData[product.id]) {
      setQuickEditData(prev => ({
        ...prev,
        [product.id]: {
          pharmacyWholesaleCost: product.pharmacyWholesaleCost || 0,
          pharmacyProvider: product.pharmacyProvider || 'absoluterx'
        }
      }))
    }
  }

  const updateQuickEditField = (productId: string, field: 'pharmacyWholesaleCost' | 'pharmacyProvider', value: any) => {
    setQuickEditData(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { pharmacyWholesaleCost: 0, pharmacyProvider: 'absoluterx' }),
        [field]: value
      }
    }))
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

          <div className="flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
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
            
            {activeTab === 'selected' && products.length > 0 && (
              <Button
                variant={quickEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setQuickEditMode(!quickEditMode)}
                className="text-xs font-medium mb-2"
              >
                <Edit2 className="h-3 w-3 mr-1.5" />
                {quickEditMode ? 'Exit Quick Edit' : 'Quick Edit'}
              </Button>
            )}
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
              {products.map((product) => {
                // Initialize quick edit data when entering quick edit mode
                if (quickEditMode && !quickEditData[product.id]) {
                  initializeQuickEditData(product)
                }
                
                const isSaving = savingProducts.has(product.id)
                const hasChanges = quickEditData[product.id] && (
                  quickEditData[product.id].pharmacyWholesaleCost !== (product.pharmacyWholesaleCost || 0) ||
                  quickEditData[product.id].pharmacyProvider !== (product.pharmacyProvider || 'absoluterx')
                )
                
                return (
                  <Card key={product.id} className={!product.isActive ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>
                        </div>
                        <div className="flex gap-2 ml-2">
                          {quickEditMode && hasChanges && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickEditSave(product.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                            </Button>
                          )}
                          {!quickEditMode && (
                            <>
                              <Button size="sm" variant={product.isActive ? "destructive" : "default"} onClick={() => handleToggleActive(product)}>
                                {product.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
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
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  <CardContent className="space-y-3">
                    {product.category && (
                      <Badge variant="secondary">{CATEGORY_OPTIONS.find((c: { value: string; label: string }) => c.value === product.category)?.label || product.category}</Badge>
                    )}

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

                      {/* Pharmacy Provider - Quick Edit or Display */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pharmacy:</span>
                        {quickEditMode ? (
                          <select
                            value={quickEditData[product.id]?.pharmacyProvider || product.pharmacyProvider || 'absoluterx'}
                            onChange={(e) => updateQuickEditField(product.id, 'pharmacyProvider', e.target.value)}
                            className="px-2 py-1 text-sm border border-border rounded-md bg-background w-32"
                          >
                            {pharmacyProviders.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium">
                            {pharmacyProviders.find(v => v.id === product.pharmacyProvider)?.name || product.pharmacyProvider || 'Not set'}
                          </span>
                        )}
                      </div>

                      {/* Wholesale Cost - Quick Edit or Display */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Wholesale Cost:</span>
                        {quickEditMode ? (
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={quickEditData[product.id]?.pharmacyWholesaleCost ?? product.pharmacyWholesaleCost ?? 0}
                              onChange={(e) => updateQuickEditField(product.id, 'pharmacyWholesaleCost', parseFloat(e.target.value) || 0)}
                              className="w-full pl-5 pr-2 py-1 text-sm border border-border rounded-md bg-background"
                            />
                          </div>
                        ) : (
                          <span className="font-medium text-foreground">
                            {product.pharmacyWholesaleCost ? `$${product.pharmacyWholesaleCost.toFixed(2)}` : 'Not set'}
                          </span>
                        )}
                      </div>

                      {product.suggestedRetailPrice && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Suggested Retail:</span>
                          <span className="font-medium text-green-600">${product.suggestedRetailPrice.toFixed(2)}</span>
                        </div>
                      )}

                      {product.pharmacyWholesaleCost && product.suggestedRetailPrice && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Profit Margin:</span>
                          <span className="font-bold text-primary">
                            {calculateProfitMargin(product.pharmacyWholesaleCost, product.suggestedRetailPrice)}%
                          </span>
                        </div>
                      )}
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
                )
              })}
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
                  <label className="text-sm font-medium">Pharmacy Wholesale Cost</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pharmacyWholesaleCost}
                    onChange={(e) => setFormData({ ...formData, pharmacyWholesaleCost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Suggested Retail Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.suggestedRetailPrice}
                    onChange={(e) => setFormData({ ...formData, suggestedRetailPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Selling Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
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

                {formData.pharmacyWholesaleCost > 0 && formData.suggestedRetailPrice > 0 && (
                  <div className="md:col-span-2 p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calculated Profit Margin:</span>
                      <span className="text-lg font-bold text-primary">
                        {calculateProfitMargin(formData.pharmacyWholesaleCost, formData.suggestedRetailPrice)}%
                      </span>
                    </div>
                  </div>
                )}
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

