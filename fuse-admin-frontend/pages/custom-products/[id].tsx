import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    ShoppingCart,
    Users,
    FileText,
    Edit,
    Palette,
    DollarSign
} from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    description?: string
    pharmacyProductId?: string
    placeholderSig?: string
    imageUrl?: string | null
    activeIngredients?: string[]
    active: boolean
    createdAt: string
    updatedAt: string
    pharmacyWholesaleCost?: number
    suggestedRetailPrice?: number
    slug?: string | null
}

interface TenantProductData {
    id: string
    productId: string
    clinicId: string
    price: number
    stripeProductId?: string
    stripePriceId?: string
    active: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProductDetail() {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [templates, setTemplates] = useState<any[]>([])
    const [tenantProduct, setTenantProduct] = useState<TenantProductData | null>(null)
    const [editingPrice, setEditingPrice] = useState(false)
    const [newPrice, setNewPrice] = useState<string>('')
    const [savingPrice, setSavingPrice] = useState(false)
    const [enabledForms, setEnabledForms] = useState<any[]>([])
    const [enablingId, setEnablingId] = useState<string | null>(null)
    const [productStats, setProductStats] = useState<{ totalOrders: number; activeSubscribers: number }>({
        totalOrders: 0,
        activeSubscribers: 0
    })
    const [clinicSlug, setClinicSlug] = useState<string | null>(null)
    const [clinicCustomDomain, setClinicCustomDomain] = useState<string | null>(null)
    const [clinicIsCustomDomain, setClinicIsCustomDomain] = useState<boolean>(false)
    const [customizations, setCustomizations] = useState<Record<string, { customColor?: string | null; isActive: boolean }>>({})
    const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null)

    const { user, token, authenticatedFetch } = useAuth()
    const [copiedPreview, setCopiedPreview] = useState<boolean>(false)
    const router = useRouter()
    const { id } = router.query

    const wholesaleCost = product?.pharmacyWholesaleCost ?? product?.price ?? 0

    // Preset colors
    const presetColors = [
        { name: "Ocean Blue", color: "#0EA5E9" },
        { name: "Purple", color: "#A855F7" },
        { name: "Emerald", color: "#10B981" },
        { name: "Rose", color: "#F43F5E" },
        { name: "Amber", color: "#F59E0B" },
        { name: "Indigo", color: "#6366F1" },
        { name: "Pink", color: "#EC4899" },
        { name: "Teal", color: "#14B8A6" },
    ]

    // Fetch customizations
    useEffect(() => {
        const loadCustomizations = async () => {
            if (!token) return

            try {
                const res = await fetch(`${API_URL}/admin/questionnaire-customizations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    const customizationsMap: Record<string, { customColor?: string; isActive: boolean }> = {}

                    if (Array.isArray(data?.data)) {
                        data.data.forEach((c: any) => {
                            customizationsMap[c.questionnaireId] = {
                                customColor: c.customColor,
                                isActive: c.isActive
                            }
                        })
                    }

                    setCustomizations(customizationsMap)
                }
            } catch (err) {
                console.error('Error fetching customizations:', err)
            }
        }
        loadCustomizations()
    }, [token])

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerOpen && !(event.target as Element).closest('.color-picker-container')) {
                setColorPickerOpen(null)
            }
        }

        if (colorPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [colorPickerOpen])

    // Fetch clinic information
    useEffect(() => {
        const fetchClinic = async () => {
            if (!token || !user?.clinicId) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clinic/${user.clinicId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.data) {
                        console.log('🏥 Clinic data:', data.data)
                        console.log('🌐 Custom Domain:', data.data.customDomain)
                        setClinicSlug(data.data.slug)
                        setClinicCustomDomain(data.data.customDomain || null)
                        setClinicIsCustomDomain(data.data.isCustomDomain || false)
                    }
                }
            } catch (err) {
                console.error('Failed to load clinic:', err)
            }
        }
        fetchClinic()
    }, [token, user?.clinicId])

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            if (!token || !id) return

            try {
                setLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setProduct(data.data)
                    } else {
                        setError(data.message || 'Failed to load product')
                    }
                } else {
                    setError('Failed to load product')
                }
            } catch (err) {
                setError('Failed to load product')
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [token, id])

    // Fetch tenant product, templates, and stats
    useEffect(() => {
        const fetchData = async () => {
            if (!token || !id || !user) return

            try {
                const userWithClinic: any = user
                const clinicId = userWithClinic?.clinicId

                // Fetch product to get its category
                const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const productData = await productRes.json()
                const productCategory = productData?.data?.category || productData?.data?.categories?.[0] || null

                // Fetch global structures, product forms, standardized forms, and tenant data
                const [tpRes, globalStructuresRes, productFormsRes, standardizedFormsRes, tpfRes, ordersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    // Get global form structures
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/global-form-structures`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    // Get product-specific questionnaires
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/product/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    // Get standardized templates for this product's category
                    productCategory ? fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/standardized?category=${productCategory}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }) : Promise.resolve(null),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms?productId=${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    clinicId ? fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders?clinicId=${clinicId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }) : Promise.resolve(null)
                ])

                // Process tenant product
                if (tpRes.ok) {
                    const list = await tpRes.json().then(r => r?.data || [])
                    const tenantProd = list.find((r: any) => r?.productId === id)
                    setTenantProduct(tenantProd || null)
                }

                // Process global structures - show structures themselves, not underlying forms
                let displayTemplates = []

                if (globalStructuresRes.ok) {
                    const structuresData = await globalStructuresRes.json()
                    const globalStructures = Array.isArray(structuresData?.data) ? structuresData.data : []

                    // Get product and standardized forms for reference
                    let productForms: any[] = []
                    let standardizedForms: any[] = []

                    if (productFormsRes.ok) {
                        const data = await productFormsRes.json()
                        productForms = Array.isArray(data?.data) ? data.data : []
                    }

                    if (standardizedFormsRes && standardizedFormsRes.ok) {
                        const data = await standardizedFormsRes.json()
                        standardizedForms = Array.isArray(data?.data) ? data.data : []
                    }

                    // Display ONE entry per global structure (consolidate product + category forms)
                    for (const structure of globalStructures) {
                        const enabledSections = structure.sections?.filter((s: any) => s.enabled) || []
                        const hasProductSection = enabledSections.some((s: any) => s.type === 'product_questions')
                        const hasCategorySection = enabledSections.some((s: any) => s.type === 'category_questions')

                        // Use product form if available, otherwise create placeholder
                        const baseForm = productForms[0] || standardizedForms[0] || {
                            id: `structure-${structure.id}`,
                            title: structure.name,
                            formTemplateType: hasCategorySection ? 'standardized_template' : 'normal',
                            isTemplate: hasCategorySection
                        }

                        // Add ONE entry per structure - use structure ID to ensure uniqueness
                        displayTemplates.push({
                            ...baseForm,
                            id: `structure-${structure.id}`, // Override with structure ID for uniqueness
                            title: structure.name,
                            _structureName: structure.name,
                            _structureId: structure.id,
                            _structure: structure,
                            _hasProductSection: hasProductSection,
                            _hasCategorySection: hasCategorySection,
                            _productForm: productForms[0] || null,
                            _categoryForms: standardizedForms,
                            _underlyingQuestionnaireId: baseForm.id, // Keep the original questionnaire ID
                            _isStructurePlaceholder: !productForms[0] && !standardizedForms[0]
                        })
                    }
                } else {
                    // Fallback: show all forms if global structures not available
                    if (productFormsRes.ok) {
                        const data = await productFormsRes.json()
                        displayTemplates.push(...(Array.isArray(data?.data) ? data.data : []))
                    }
                    if (standardizedFormsRes && standardizedFormsRes.ok) {
                        const data = await standardizedFormsRes.json()
                        displayTemplates.push(...(Array.isArray(data?.data) ? data.data : []))
                    }
                }

                setTemplates(displayTemplates)

                // Process enabled forms
                if (tpfRes.ok) {
                    const data = await tpfRes.json()
                    setEnabledForms(Array.isArray(data?.data) ? data.data : [])
                }

                // Auto-enable exactly 1 form per Global Form Structure
                // Forms are built from global structure blueprint - no questionnaire needed
                const enabledTracker = new Set<string>()

                for (const template of displayTemplates) {
                    const structureId = (template as any)._structureId || 'default'
                    const trackingKey = `${structureId}:${String(id)}` // Product ID is the key

                    // Skip if we've already enabled this structure
                    if (enabledTracker.has(trackingKey)) continue

                    // Check if a form exists for this structure + product
                    const existingFormsForStructure = enabledForms.filter((f: any) =>
                        (f?.globalFormStructureId ?? 'default') === structureId
                    )

                    // Only auto-enable if ZERO forms exist for this structure
                    if (existingFormsForStructure.length === 0) {
                        try {
                            console.log(`Auto-enabling form for structure ${structureId} for product ${id}`)
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    productId: String(id),
                                    questionnaireId: null, // No questionnaire needed - built from global structure
                                    currentFormVariant: null,
                                    globalFormStructureId: structureId
                                })
                            })

                            if (res.ok) {
                                const formData = await res.json()
                                if (formData?.success && formData?.data) {
                                    setEnabledForms(prev => [...prev, formData.data])
                                    enabledTracker.add(trackingKey)
                                    console.log(`✅ Form created for structure ${structureId}`)
                                }
                            } else {
                                console.error(`Failed to create form for structure ${structureId}:`, await res.text())
                            }
                        } catch (e) {
                            console.error('Error auto-enabling form:', e)
                        }
                    } else if (existingFormsForStructure.length > 0) {
                        // Mark as already enabled
                        enabledTracker.add(trackingKey)
                    }
                }

                // Process orders to get stats
                if (ordersRes && ordersRes.ok) {
                    const ordersData = await ordersRes.json()
                    const allOrders = ordersData?.data?.orders || []
                    const productOrders = allOrders.filter((order: any) =>
                        order.orderItems?.some((item: any) => item.productId === id)
                    )
                    setProductStats({
                        totalOrders: productOrders.length,
                        activeSubscribers: 0 // TODO: Count active subscriptions for this product
                    })
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            }
        }
        fetchData()
    }, [token, id, user])

    const handleUpdatePrice = async () => {
        if (!tenantProduct || !token) return

        const priceValue = parseFloat(newPrice)
        if (isNaN(priceValue) || priceValue <= 0) {
            setError('Please enter a valid price greater than $0')
            return
        }

        try {
            setSavingPrice(true)
            setError(null)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantProductId: tenantProduct.id,
                    price: priceValue
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to update price')
            }

            const data = await response.json()

            if (data.success) {
                setTenantProduct({ ...tenantProduct, price: priceValue })
                setEditingPrice(false)
                setNewPrice('')
                setError('✅ Price updated successfully!')
                setTimeout(() => setError(null), 3000)
            } else {
                throw new Error(data.message || 'Failed to update price')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update price')
        } finally {
            setSavingPrice(false)
        }
    }

    const fetchCustomizations = async () => {
        if (!token) return

        try {
            const res = await fetch(`${API_URL}/admin/questionnaire-customizations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                const customizationsMap: Record<string, { customColor?: string; isActive: boolean }> = {}

                if (Array.isArray(data?.data)) {
                    data.data.forEach((c: any) => {
                        customizationsMap[c.questionnaireId] = {
                            customColor: c.customColor,
                            isActive: c.isActive
                        }
                    })
                }

                setCustomizations(customizationsMap)
            }
        } catch (err) {
            console.error('Error fetching customizations:', err)
        }
    }

    const enableTemplate = async (questionnaireId: string) => {
        if (!token || !id) return
        setEnablingId(questionnaireId)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(id), questionnaireId })
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                try {
                    const json = JSON.parse(text)
                    throw new Error(json?.message || `Failed to enable form (${res.status})`)
                } catch {
                    throw new Error(text || `Failed to enable form (${res.status})`)
                }
            }

            const data = await res.json().catch(() => ({} as any))
            if (data?.success && data?.data) {
                setEnabledForms(prev => [...prev.filter((f: any) => f?.questionnaireId !== questionnaireId), data.data])
                // Reload customizations
                await fetchCustomizations()
                // TenantProduct creation is ensured by the backend before creating the form
                window.location.reload()
            } else {
                throw new Error(data?.message || 'Failed to enable form')
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to enable form')
        } finally {
            setEnablingId(null)
        }
    }

    const enableTemplateWithVariant = async (questionnaireId: string, currentFormVariant: string | null) => {
        if (!token || !id) return
        const enablingKey = `${questionnaireId}:${currentFormVariant ?? 'main'}`
        setEnablingId(enablingKey)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(id), questionnaireId, currentFormVariant })
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                try {
                    const json = JSON.parse(text)
                    throw new Error(json?.message || `Failed to enable form (${res.status})`)
                } catch {
                    throw new Error(text || `Failed to enable form (${res.status})`)
                }
            }

            const data = await res.json().catch(() => ({} as any))
            if (data?.success && data?.data) {
                setEnabledForms(prev => {
                    const withoutDuplicate = prev.filter((f: any) => f?.id !== data.data.id)
                    return [...withoutDuplicate, data.data]
                })
                await fetchCustomizations()
            } else {
                throw new Error(data?.message || 'Failed to enable form')
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to enable form')
        } finally {
            setEnablingId(prev => (prev === enablingKey ? null : prev))
        }
    }

    const disableTemplate = async (formId: string, questionnaireId: string) => {
        if (!token || !id) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantProductFormId: formId, questionnaireId, productId: id })
            })

            if (!res.ok) {
                throw new Error('Failed to disable form')
            }

            setEnabledForms(prev => prev.filter((f: any) => f?.id !== formId))
        } catch (e: any) {
            setError(e?.message || 'Failed to disable form')
        }
    }

    const updateFormColor = async (questionnaireId: string, color: string) => {
        if (!token) return

        try {
            // Empty string means "clear color" - send null to backend
            const colorValue = color === '' ? null : color;

            const res = await fetch(`${API_URL}/admin/questionnaire-customization/color`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ questionnaireId, customColor: colorValue })
            })

            if (!res.ok) {
                throw new Error('Failed to update color')
            }

            setCustomizations(prev => ({
                ...prev,
                [questionnaireId]: {
                    ...prev[questionnaireId],
                    customColor: colorValue
                }
            }))

            setColorPickerOpen(null)
            const message = colorValue ? '✅ Color updated successfully!' : '✅ Color cleared - using clinic default';
            setError(message)
            setTimeout(() => setError(null), 2000)
        } catch (e: any) {
            setError(e?.message || 'Failed to update color')
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const getStatusBadge = (active: boolean) => {
        return active
            ? <Badge variant="outline" className="text-xs font-medium"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
            : <Badge variant="outline" className="text-xs font-medium text-muted-foreground"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
    }

    const buildFormPreviewUrlFor = (form: any, _variantKey: string | null) => {
        if (!product?.slug) return null
        if (!form?.id) return null

        const formId = form.id
        const isLocalhost = process.env.NODE_ENV !== 'production'
        const protocol = isLocalhost ? 'http' : 'https'

        // Priority 1: Use custom domain if configured
        if (clinicCustomDomain) {
            // customDomain already includes the full domain (e.g., app.limitless2.health)
            return `${protocol}://${clinicCustomDomain}/my-products/${formId}/${product.slug}`
        }

        // Priority 2: Use subdomain URL
        if (!clinicSlug) return null

        const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true'
        const baseDomain = isStaging ? 'fusehealthstaging.xyz' : 'fuse.health'
        const baseUrl = isLocalhost
            ? `http://${clinicSlug}.localhost:3000`
            : `https://${clinicSlug}.${baseDomain}`

        // Same format for both local and prod: /my-products/<form-id>/<product-slug>
        return `${baseUrl}/my-products/${formId}/${product.slug}`
    }

    // Build BOTH URLs for forms with custom domains
    const buildFormUrls = (form: any) => {
        if (!product?.slug || !clinicSlug) return null

        const isLocalhost = process.env.NODE_ENV !== 'production'
        const formId = form?.id
        if (!formId) return null

        const protocol = isLocalhost ? 'http' : 'https'

        // Standard subdomain URL (always available)
        const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true'
        const baseDomain = isStaging ? 'fusehealthstaging.xyz' : 'fuse.health'
        const subdomainBase = isLocalhost
            ? `http://${clinicSlug}.localhost:3000`
            : `https://${clinicSlug}.${baseDomain}`
        const subdomainUrl = `${subdomainBase}/my-products/${formId}/${product.slug}`

        // Custom domain URL (if configured)
        let customDomainUrl = null
        if (clinicCustomDomain) {
            customDomainUrl = `${protocol}://${clinicCustomDomain}/my-products/${formId}/${product.slug}`
        }

        return {
            subdomainUrl,
            customDomainUrl
        }
    }

    const buildPreviewUrl = () => {
        // This is for backward compatibility, just return the first form's URL if available
        const firstForm = enabledForms[0]
        if (firstForm) {
            return buildFormPreviewUrlFor(firstForm, null)
        }
        return null
    }

    const handleCopyPreview = async () => {
        const url = buildPreviewUrl()
        if (!url) return
        try {
            await navigator.clipboard.writeText(url)
            setCopiedPreview(true)
            setTimeout(() => setCopiedPreview(false), 1500)
        } catch { }
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading product...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error && !product) {
        return (
            <Layout>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button variant="outline" onClick={() => router.push('/products')} className="mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Button>
                        <Card className="p-12 text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </Card>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>{product?.name || 'Product'} - Fuse Admin</title>
            </Head>

            <div className="min-h-screen bg-[#F9FAFB] p-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/products')}
                        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#4B5563] text-sm font-medium transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </button>

                    {/* Custom Product Disclaimer */}
                    <div className="bg-gradient-to-r from-[#4FA59C] to-[#478F87] rounded-2xl shadow-lg border border-[#4FA59C]/20 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">Custom Product</h3>
                                <p className="text-white/90 text-sm leading-relaxed">
                                    This is a custom product created by your brand. You have full control to edit, manage, and delete this product at any time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl font-semibold text-[#1F2937]">{product?.name}</h1>
                                    {product && getStatusBadge(product.active)}
                                </div>
                                <p className="text-[#6B7280] text-base leading-relaxed max-w-3xl">{product?.description}</p>
                                {product?.placeholderSig && (
                                    <div className="mt-4 pt-4 border-t border-[#E5E7EB] inline-block">
                                        <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Placeholder Sig</span>
                                        <p className="text-sm text-[#1F2937] mt-1 font-medium">{product.placeholderSig}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {error && (
                        <div className={`mb-6 p-4 border rounded-md ${error.includes('✅') ? 'bg-background border-border' : 'bg-background border-red-200'}`}>
                            <p className={error.includes('✅') ? 'text-foreground' : 'text-red-600 text-sm'}>{error}</p>
                        </div>
                    )}

                    {/* Pricing Section */}
                    <div className="grid grid-cols-12 gap-6 mb-6">
                        {/* Pharmacy Wholesale Cost */}
                        <div className="col-span-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-[#4FA59C]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Pharmacy Wholesale Cost</p>
                                        <p className="text-[10px] text-[#9CA3AF]">What you pay</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-semibold text-[#1F2937]">
                                    {product ? formatPrice(wholesaleCost) : '$0.00'}
                                </p>
                            </div>
                        </div>

                        {/* Retail Price */}
                        <div className="col-span-6">
                            {tenantProduct ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all h-full">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Retail Price</div>
                                        {!editingPrice && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2 text-xs font-medium hover:bg-muted"
                                                onClick={() => {
                                                    setEditingPrice(true)
                                                    setNewPrice(tenantProduct.price.toString())
                                                }}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3">What customers pay</div>

                                    {editingPrice ? (
                                        <div>
                                            <div className="mb-3">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={newPrice}
                                                        onChange={(e) => setNewPrice(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 text-2xl font-semibold border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleUpdatePrice} disabled={savingPrice} className="flex-1">
                                                    {savingPrice ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setEditingPrice(false)
                                                    setNewPrice('')
                                                }} disabled={savingPrice}>
                                                    Cancel
                                                </Button>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                                {(() => {
                                                    const price = parseFloat(newPrice) || 0
                                                    const cost = wholesaleCost
                                                    const profit = price - cost
                                                    const margin = price > 0 ? ((profit / price) * 100) : 0
                                                    return `Profit: ${formatPrice(profit)} (${margin.toFixed(1)}% margin)`
                                                })()}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-3xl font-semibold text-foreground">
                                                {formatPrice(tenantProduct.price)}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                                {(() => {
                                                    const price = tenantProduct.price
                                                    const cost = wholesaleCost
                                                    const profit = price - cost
                                                    const margin = price > 0 ? ((profit / price) * 100) : 0
                                                    return `Profit: ${formatPrice(profit)} per unit (${margin.toFixed(1)}% margin)`
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-[#E5E7EB] p-6 flex items-center justify-center h-full">
                                    <p className="text-sm text-[#6B7280] text-center">
                                        Enable this product to set custom pricing
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Forms Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Product Forms</h3>
                            {templates.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-[#E5E7EB] rounded-2xl text-center bg-[#F9FAFB]/50">
                                    <FileText className="h-10 w-10 text-[#9CA3AF] mx-auto mb-3" />
                                    <p className="text-sm text-[#6B7280] font-medium">No forms available for this product</p>
                                    <p className="text-xs text-[#9CA3AF] mt-1">Create a global structure in the tenant portal to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Show all structures - each with exactly 1 form */}
                                    {templates.map((t, structureIndex) => {
                                        const structure = (t as any)._structure
                                        const structureId = (t as any)._structureId || 'default'

                                        // Filter forms for THIS specific structure
                                        // New global form structure system: match by globalFormStructureId and productId
                                        // Forms created from global structures have questionnaireId: null
                                        const formsForStructure = enabledForms.filter((f: any) => {
                                            const matchesStructure = (f?.globalFormStructureId ?? 'default') === structureId
                                            const matchesProduct = f?.productId === id
                                            return matchesStructure && matchesProduct
                                        })
                                        const form = formsForStructure[0] // Just get the single form for this structure

                                        return (
                                            <div key={t.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                                                {/* Structure Header with Inline Form Flow + Color Picker */}
                                                <div className="p-5 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
                                                    <div className="flex items-center justify-between gap-6">
                                                        {/* Left: Name and Type */}
                                                        <div className="flex-shrink-0">
                                                            <h4 className="text-lg font-semibold text-[#1F2937] mb-1">
                                                                {(t as any)._structureName || t.title}
                                                            </h4>
                                                            <p className="text-xs text-[#6B7280]">
                                                                {t.formTemplateType === 'normal' ? '📦 Product-Specific Form' :
                                                                    t.formTemplateType === 'standardized_template' ? '📋 Standardized Category Template' :
                                                                        'Standard Form'}
                                                            </p>
                                                        </div>

                                                        {/* Center: Form Flow Preview (Inline) */}
                                                        {structure?.sections && (
                                                            <div className="flex items-center gap-2 overflow-x-auto flex-1">
                                                                {structure.sections
                                                                    .filter((s: any) => s.enabled)
                                                                    .sort((a: any, b: any) => a.order - b.order)
                                                                    .map((section: any, idx: number, arr: any[]) => (
                                                                        <div key={section.id} className="flex items-center gap-2 flex-shrink-0">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg border border-[#E5E7EB]">
                                                                                    {section.icon}
                                                                                </div>
                                                                                <span className="text-[10px] font-medium text-[#6B7280] max-w-[60px] leading-tight">
                                                                                    {section.label}
                                                                                </span>
                                                                            </div>
                                                                            {idx < arr.length - 1 && (
                                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#D1D5DB] flex-shrink-0">
                                                                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        )}

                                                        {/* Right: Color Picker */}
                                                        <div className="relative color-picker-container flex-shrink-0">
                                                            <button
                                                                onClick={() => setColorPickerOpen(colorPickerOpen === t.id ? null : t.id)}
                                                                className="w-8 h-8 rounded border-2 border-border hover:border-muted-foreground transition-colors flex items-center justify-center"
                                                                style={{
                                                                    backgroundColor: customizations[t.id]?.customColor || 'transparent',
                                                                    backgroundImage: !customizations[t.id]?.customColor
                                                                        ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)'
                                                                        : 'none',
                                                                    backgroundSize: '8px 8px',
                                                                    backgroundPosition: '0 0, 4px 4px'
                                                                }}
                                                                title={customizations[t.id]?.customColor ? 'Change form color' : 'Set custom color (currently using clinic default)'}
                                                            >
                                                                <Palette className="h-4 w-4 text-muted-foreground" />
                                                            </button>

                                                            {colorPickerOpen === t.id && (
                                                                <div className="absolute right-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg z-10 w-48">
                                                                    <p className="text-xs font-medium text-foreground mb-2">Select Color</p>
                                                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                                                        {presetColors.map((preset) => (
                                                                            <button
                                                                                key={preset.color}
                                                                                onClick={() => updateFormColor(t.id, preset.color)}
                                                                                className="w-10 h-10 rounded border-2 border-border hover:border-muted-foreground transition-colors"
                                                                                style={{ backgroundColor: preset.color }}
                                                                                title={preset.name}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    {customizations[t.id]?.customColor && (
                                                                        <button
                                                                            onClick={() => updateFormColor(t.id, '')}
                                                                            className="w-full text-xs py-1.5 px-2 text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground rounded transition-colors"
                                                                        >
                                                                            Clear (use clinic default)
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Form URL - Show BOTH subdomain and custom domain URLs */}
                                                {form && (() => {
                                                    const urls = buildFormUrls(form)
                                                    return (
                                                        <div className="p-5">
                                                            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
                                                                <div className="text-sm font-medium text-[#1F2937] mb-3">
                                                                    Form #{structureIndex + 1}
                                                                </div>

                                                                {urls && (
                                                                    <div className="space-y-3">
                                                                        {/* Standard Subdomain URL */}
                                                                        <div>
                                                                            <div className="text-xs font-medium text-[#6B7280] mb-1">
                                                                                Subdomain URL:
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-xs text-[#1F2937] truncate flex-1 font-mono bg-gray-50 px-2 py-1 rounded">
                                                                                    {urls.subdomainUrl}
                                                                                </div>
                                                                                <Button size="sm" variant="outline" onClick={() => window.open(urls.subdomainUrl, '_blank')}>
                                                                                    Preview
                                                                                </Button>
                                                                                <Button size="sm" variant="outline" onClick={async () => {
                                                                                    await navigator.clipboard.writeText(urls.subdomainUrl)
                                                                                }}>
                                                                                    Copy
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Custom Domain URL (if configured) */}
                                                                        {urls.customDomainUrl && (
                                                                            <div>
                                                                                <div className="text-xs font-medium text-[#6B7280] mb-1">
                                                                                    Custom Domain URL:
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="text-xs text-[#1F2937] truncate flex-1 font-mono bg-gray-50 px-2 py-1 rounded">
                                                                                        {urls.customDomainUrl}
                                                                                    </div>
                                                                                    <Button size="sm" variant="outline" onClick={() => urls.customDomainUrl && window.open(urls.customDomainUrl, '_blank')}>
                                                                                        Preview
                                                                                    </Button>
                                                                                    <Button size="sm" variant="outline" onClick={async () => {
                                                                                        if (urls.customDomainUrl) await navigator.clipboard.writeText(urls.customDomainUrl)
                                                                                    }}>
                                                                                        Copy
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {!urls && (
                                                                    <div className="text-xs text-[#6B7280]">
                                                                        Preview URL will generate after publishing
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Performance */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
                        <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Product Performance</h3>
                        <div className="grid grid-cols-2 gap-6">

                            {/* Total Orders */}
                            <div className="p-5 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</span>
                                </div>
                                <div className="text-3xl font-semibold text-foreground">{productStats.totalOrders}</div>
                                <p className="text-xs text-muted-foreground mt-2">All-time orders for this product</p>
                            </div>

                            {/* Active Subscribers */}
                            <div className="p-5 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Subscribers</span>
                                </div>
                                <div className="text-3xl font-semibold text-foreground">{productStats.activeSubscribers}</div>
                                <p className="text-xs text-muted-foreground mt-2">Customers with active subscriptions</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Product Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div>
                                <span className="text-muted-foreground text-xs uppercase tracking-wide">Pharmacy Product ID</span>
                                <p className="font-medium text-foreground mt-1">{product?.pharmacyProductId || 'Not assigned'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs uppercase tracking-wide">Default Dosage</span>
                                <p className="font-medium text-foreground mt-1">{product?.placeholderSig || 'N/A'}</p>
                            </div>
                            {product?.activeIngredients && product.activeIngredients.length > 0 && (
                                <div className="col-span-2">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Active Ingredients</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {product.activeIngredients.map((ing, i) => (
                                            <Badge key={i} variant="outline" className="text-xs font-normal">{ing}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
