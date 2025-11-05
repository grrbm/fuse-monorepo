import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    X,
    Loader2,
    CheckCircle,
    XCircle,
    Upload,
    ImageIcon,
    Trash2,
    Package,
    DollarSign,
    FileText,
    Hash,
    Plus,
    Check,
    Sparkles,
    Eye,
    Building2,
    AlertCircle,
    Info,
    Percent,
    TrendingUp
} from 'lucide-react'

const PRODUCT_CATEGORIES = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
    { value: 'hair_growth', label: 'Hair Growth', icon: '💇' },
    { value: 'performance', label: 'Performance', icon: '⚡' },
    { value: 'sexual_health', label: 'Sexual Health', icon: '❤️' },
    { value: 'skincare', label: 'Skincare', icon: '✨' },
    { value: 'wellness', label: 'Wellness', icon: '🌿' },
    { value: 'other', label: 'Other', icon: '📦' },
]

interface Product {
    id: string
    name: string
    price: number
    description?: string
    pharmacyProductId?: string
    placeholderSig?: string
    category?: string
    imageUrl?: string | null
    activeIngredients?: string[]
    active: boolean
    createdAt: string
    updatedAt: string
    treatments?: Array<{
        id: string
        name: string
    }>
    tenantProductId?: string
    tenantPrice?: number
}

interface FormTemplate {
    id: string
    title: string
    description?: string
    formTemplateType?: string
    sections?: any[]
}

interface EnabledForm {
    id: string
    questionnaireId: string
    productId: string
}

export default function ProductEdit() {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [updatingPrice, setUpdatingPrice] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [templates, setTemplates] = useState<FormTemplate[]>([])
    const [enabledForms, setEnabledForms] = useState<EnabledForm[]>([])
    const [enablingTemplateId, setEnablingTemplateId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        tenantPrice: 0,
        useTenantPrice: false,
        description: '',
        pharmacyProductId: '',
        placeholderSig: '',
        category: 'other',
        activeIngredients: [] as string[],
        active: true
    })
    
    const { user, token } = useAuth()
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        const fetchProduct = async () => {
            if (!token || !id) return

            try {
                setLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        const productData = data.data
                        setProduct(productData)
                        setFormData({
                            name: productData.name,
                            price: productData.price,
                            tenantPrice: productData.tenantPrice || productData.price,
                            useTenantPrice: !!productData.tenantPrice,
                            description: productData.description || '',
                            pharmacyProductId: productData.pharmacyProductId || '',
                            placeholderSig: productData.placeholderSig || '',
                            category: productData.category || 'other',
                            activeIngredients: productData.activeIngredients || [],
                            active: productData.active
                        })
                    } else {
                        setError(data.message || 'Failed to load product')
                    }
                } else {
                    setError(`Failed to load product: ${response.status} ${response.statusText}`)
                }
            } catch (err) {
                console.error('Error fetching product:', err)
                setError('Failed to load product')
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [token, id])

    // Fetch form templates for this product
    useEffect(() => {
        const fetchTemplates = async () => {
            if (!token || !id) return
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/product/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setTemplates(Array.isArray(data?.data) ? data.data : [])
                }
            } catch (err) {
                console.error('Error fetching templates:', err)
            }
        }
        fetchTemplates()
    }, [token, id])

    // Fetch enabled forms
    useEffect(() => {
        const fetchEnabledForms = async () => {
            if (!token || !id) return
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms?productId=${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setEnabledForms(Array.isArray(data?.data) ? data.data : [])
                }
            } catch (err) {
                console.error('Error fetching enabled forms:', err)
            }
        }
        fetchEnabledForms()
    }, [token, id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product || !token) return

        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    price: formData.price,
                    description: formData.description,
                    pharmacyProductId: formData.pharmacyProductId,
                    placeholderSig: formData.placeholderSig,
                    category: formData.category,
                    activeIngredients: formData.activeIngredients,
                    active: formData.active
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setSuccessMessage('Product updated successfully')
                    setTimeout(() => {
                        router.push(`/products/${product.id}`)
                    }, 1500)
                } else {
                    setError(data.message || 'Failed to update product')
                }
            } else {
                setError(`Failed to update product: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error updating product:', err)
            setError('Failed to update product')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateTenantPrice = async () => {
        if (!product || !token || !product.tenantProductId) return

        setUpdatingPrice(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products/${product.tenantProductId}/price`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: formData.tenantPrice
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setSuccessMessage('Clinic price updated successfully')
                    setProduct({ ...product, tenantPrice: formData.tenantPrice })
                } else {
                    setError(data.message || 'Failed to update clinic price')
                }
            } else {
                setError(`Failed to update clinic price: ${response.status}`)
            }
        } catch (err) {
            console.error('Error updating tenant price:', err)
            setError('Failed to update clinic price')
        } finally {
            setUpdatingPrice(false)
        }
    }

    const handleToggleTemplate = async (templateId: string) => {
        if (!token || !id) return
        
        const isEnabled = enabledForms.some(f => f.questionnaireId === templateId)
        
        if (isEnabled) {
            // Disable template
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId: id, questionnaireId: templateId })
                })

                if (response.ok) {
                    setEnabledForms(enabledForms.filter(f => f.questionnaireId !== templateId))
                    setSuccessMessage('Form template disabled')
                    setTimeout(() => setSuccessMessage(null), 3000)
                } else {
                    setError('Failed to disable template')
                }
            } catch (err) {
                console.error('Error disabling template:', err)
                setError('Failed to disable template')
            }
        } else {
            // Enable template
            setEnablingTemplateId(templateId)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId: id, questionnaireId: templateId })
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.data) {
                        setEnabledForms([...enabledForms, data.data])
                        setSuccessMessage('Form template enabled')
                        setTimeout(() => setSuccessMessage(null), 3000)
                    }
                } else {
                    setError('Failed to enable template')
                }
            } catch (err) {
                console.error('Error enabling template:', err)
                setError('Failed to enable template')
            } finally {
                setEnablingTemplateId(null)
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleStatusChange = (active: boolean) => {
        setFormData(prev => ({
            ...prev,
            active
        }))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB')
                return
            }

            setImageFile(file)

            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            setError(null)
        }
    }

    const handleImageUpload = async () => {
        if (!product || !imageFile || !token) return

        setUploadingImage(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('image', imageFile)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${product.id}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setProduct(prev => prev ? { ...prev, imageUrl: data.data.imageUrl } : null)
                    setImageFile(null)
                    setImagePreview(null)
                    setSuccessMessage('Image uploaded successfully')
                    setTimeout(() => setSuccessMessage(null), 3000)

                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                } else {
                    setError(data.message || 'Failed to upload image')
                }
            } else {
                setError(`Failed to upload image: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error uploading image:', err)
            setError('Failed to upload image')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleRemoveImage = async () => {
        if (!product || !token) return

        if (!confirm('Are you sure you want to remove the product image?')) {
            return
        }

        setUploadingImage(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${product.id}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ removeImage: true })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setProduct(prev => prev ? { ...prev, imageUrl: '' } : null)
                    setSuccessMessage('Image removed successfully')
                    setTimeout(() => setSuccessMessage(null), 3000)
                } else {
                    setError(data.message || 'Failed to remove image')
                }
            } else {
                setError(`Failed to remove image: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error removing image:', err)
            setError('Failed to remove image')
        } finally {
            setUploadingImage(false)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground text-lg">Loading product...</p>
                    </motion.div>
                </div>
            </Layout>
        )
    }

    if (error && !product) {
        return (
            <Layout>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/products')}
                            className="mb-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="p-12 text-center border-red-200">
                                <div className="flex flex-col items-center gap-4">
                                    <XCircle className="h-16 w-16 text-red-500" />
                                    <div>
                                        <h3 className="text-2xl font-semibold text-foreground mb-2">Product Not Found</h3>
                                        <p className="text-muted-foreground mb-6 max-w-md">{error || 'The requested product could not be found.'}</p>
                                        <Button onClick={() => router.push('/products')} size="lg">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Products
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </Layout>
        )
    }

    const priceMarkup = formData.tenantPrice > formData.price 
        ? ((formData.tenantPrice - formData.price) / formData.price * 100).toFixed(1)
        : '0.0'

    return (
        <Layout>
            <Head>
                <title>Edit {product?.name || 'Product'} - Fuse Admin</title>
                <meta name="description" content={`Edit product details for ${product?.name || 'Unknown Product'}`} />
            </Head>

            <div className="w-full bg-background">
                <div className="bg-gradient-to-br from-background via-background to-primary/5 border-b border-border">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/products/${product?.id}`)}
                                    className="bg-background/80 backdrop-blur-sm"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <div>
                                    <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                                        <Package className="h-10 w-10 text-primary" />
                                        Edit Product
                                    </h1>
                                    <p className="text-muted-foreground mt-2 text-lg">Update product information and settings</p>
                                </div>
                            </div>
                            {product && (
                                <Badge 
                                    className={product.active 
                                        ? "bg-green-100 text-green-800 border-green-300 px-4 py-2 text-base" 
                                        : "bg-red-100 text-red-800 border-red-300 px-4 py-2 text-base"
                                    }
                                >
                                    {product.active ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                    {product.active ? 'Active' : 'Inactive'}
                                </Badge>
                            )}
                        </motion.div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Success/Error Messages */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm"
                            >
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <p className="text-green-800 font-medium">{successMessage}</p>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-sm"
                            >
                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                <p className="text-red-800 font-medium">{error}</p>
                                <button 
                                    onClick={() => setError(null)}
                                    className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Product Information */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <CardHeader className="bg-gradient-to-br from-background to-primary/5">
                                            <CardTitle className="flex items-center gap-3 text-xl">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                                Product Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                                                    Product Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    placeholder="Enter product name"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">
                                                    Category *
                                                </label>
                                                <select
                                                    id="category"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                >
                                                    {PRODUCT_CATEGORIES.map((cat) => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.icon} {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                                    placeholder="Enter product description"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                <label htmlFor="placeholderSig" className="block text-sm font-semibold text-foreground mb-2">
                                                    Default Placeholder Sig
                                                    </label>
                                                    <input
                                                        type="text"
                                                    id="placeholderSig"
                                                    name="placeholderSig"
                                                    value={formData.placeholderSig}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    placeholder="e.g., 500mg"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="pharmacyProductId" className="block text-sm font-semibold text-foreground mb-2">
                                                        Pharmacy ID
                                                    </label>
                                                    <div className="relative">
                                                        <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            id="pharmacyProductId"
                                                            name="pharmacyProductId"
                                                            value={formData.pharmacyProductId}
                                                            onChange={handleInputChange}
                                                            className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                            placeholder="Enter ID"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Toggle */}
                                            <div>
                                                <label className="block text-sm font-semibold text-foreground mb-3">
                                                    Product Status
                                                </label>
                                                <div className="flex gap-3">
                                                    <Button
                                                        type="button"
                                                        variant={formData.active ? "default" : "outline"}
                                                        onClick={() => handleStatusChange(true)}
                                                        className="flex-1 py-6 rounded-xl transition-all duration-200"
                                                    >
                                                        <CheckCircle className="h-5 w-5 mr-2" />
                                                        Active
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={!formData.active ? "default" : "outline"}
                                                        onClick={() => handleStatusChange(false)}
                                                        className="flex-1 py-6 rounded-xl transition-all duration-200"
                                                    >
                                                        <XCircle className="h-5 w-5 mr-2" />
                                                        Inactive
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Pricing Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-background to-green-50/30">
                                        <CardHeader className="bg-gradient-to-br from-background to-green-50/50">
                                            <CardTitle className="flex items-center gap-3 text-xl">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                </div>
                                                Pricing Configuration
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Set base price and customize pricing for your clinic
                                            </p>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                {/* Base Price */}
                                                <div>
                                                    <label htmlFor="price" className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                        Base Price *
                                                    </label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <input
                                                            type="number"
                                                            id="price"
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleInputChange}
                                                            step="0.01"
                                                            min="0"
                                                            required
                                                            className="w-full pl-12 pr-4 py-4 border-2 border-input bg-background text-foreground text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">Default price for all clinics</p>
                                                </div>

                                                {/* Clinic Price */}
                                                <div>
                                                    <label htmlFor="tenantPrice" className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                        Your Clinic Price *
                                                    </label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                                                        <input
                                                            type="number"
                                                            id="tenantPrice"
                                                            name="tenantPrice"
                                                            value={formData.tenantPrice}
                                                            onChange={handleInputChange}
                                                            step="0.01"
                                                            min="0"
                                                            className="w-full pl-12 pr-4 py-4 border-2 border-primary/30 bg-primary/5 text-foreground text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-xs text-muted-foreground">Final price for patients</p>
                                                        {parseFloat(priceMarkup) > 0 && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                                +{priceMarkup}% markup
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price Difference Visual */}
                                            {formData.tenantPrice !== formData.price && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="p-4 bg-primary/5 rounded-xl border border-primary/20"
                                                >
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground font-medium">Your Profit per Sale:</span>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            ${(formData.tenantPrice - formData.price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Update Price Button */}
                                            {product?.tenantProductId && (
                                                <Button
                                                    type="button"
                                                    onClick={handleUpdateTenantPrice}
                                                    disabled={updatingPrice || formData.tenantPrice === product.tenantPrice}
                                                    className="w-full py-6 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                                                >
                                                    {updatingPrice ? (
                                                        <>
                                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                            Updating Price...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-5 w-5 mr-2" />
                                                            Update Clinic Price
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Active Ingredients */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3 text-xl">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-purple-600" />
                                                </div>
                                                Active Ingredients
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-3">
                                            <AnimatePresence>
                                                {formData.activeIngredients.map((ingredient, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <input
                                                            type="text"
                                                            value={ingredient}
                                                            onChange={(e) => {
                                                                const newIngredients = [...formData.activeIngredients]
                                                                newIngredients[index] = e.target.value
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    activeIngredients: newIngredients
                                                                }))
                                                            }}
                                                            className="flex-1 px-4 py-3 border border-input bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                                            placeholder="e.g., Acetaminophen"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newIngredients = formData.activeIngredients.filter((_, i) => i !== index)
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    activeIngredients: newIngredients
                                                                }))
                                                            }}
                                                            className="h-12 w-12 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        activeIngredients: [...prev.activeIngredients, '']
                                                    }))
                                                }}
                                                className="w-full py-6 rounded-xl border-dashed hover:bg-primary/5 transition-all"
                                            >
                                                <Plus className="h-5 w-5 mr-2" />
                                                Add Ingredient
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Form Templates */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-background to-blue-50/20">
                                        <CardHeader className="bg-gradient-to-br from-background to-blue-50/50">
                                            <CardTitle className="flex items-center gap-3 text-lg">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                Form Templates
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Enable forms for your vanity domain
                                            </p>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            {templates.length === 0 ? (
                                                <div className="text-center py-8 px-4">
                                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                                    <p className="text-sm text-muted-foreground">No form templates available for this product.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {templates.map((template) => {
                                                        const isEnabled = enabledForms.some(f => f.questionnaireId === template.id)
                                                        const isEnabling = enablingTemplateId === template.id
                                                        
                                                        return (
                                                            <motion.div
                                                                key={template.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                                    isEnabled 
                                                                        ? 'bg-primary/10 border-primary shadow-sm' 
                                                                        : 'bg-background border-border hover:border-primary/30'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-semibold text-sm text-foreground truncate">
                                                                            {template.title}
                                                                        </h4>
                                                                        {template.formTemplateType && (
                                                                            <Badge variant="outline" className="mt-1 text-xs">
                                                                                {template.formTemplateType}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {isEnabled && (
                                                                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                                
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant={isEnabled ? "outline" : "default"}
                                                                    onClick={() => handleToggleTemplate(template.id)}
                                                                    disabled={isEnabling}
                                                                    className="w-full rounded-lg transition-all duration-200"
                                                                >
                                                                    {isEnabling ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                            Enabling...
                                                                        </>
                                                                    ) : isEnabled ? (
                                                                        <>
                                                                            <Check className="h-4 w-4 mr-2" />
                                                                            Enabled
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Enable
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Product Image */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3 text-lg">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <ImageIcon className="h-5 w-5 text-orange-600" />
                                                </div>
                                                Product Image
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            {/* Current or Preview Image */}
                                            {(product?.imageUrl || imagePreview) && (
                                                <div className="relative group">
                                                    <img
                                                        src={imagePreview || product?.imageUrl || ''}
                                                        alt={product?.name || 'Product'}
                                                        className="w-full h-48 object-cover rounded-xl border-2 border-border"
                                                    />
                                                    {imagePreview && (
                                                        <Badge className="absolute top-3 right-3 bg-primary text-white">
                                                            New Image
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* File Input */}
                                            <div className="space-y-3">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label htmlFor="image-upload">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full py-6 rounded-xl cursor-pointer hover:bg-primary/5 transition-all"
                                                        asChild
                                                    >
                                                        <span>
                                                            <Upload className="h-5 w-5 mr-2" />
                                                            {imageFile ? 'Change Image' : 'Upload Image'}
                                                        </span>
                                                    </Button>
                                                </label>

                                                {imageFile && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={handleImageUpload}
                                                            disabled={uploadingImage}
                                                            className="flex-1 py-6 rounded-xl"
                                                        >
                                                            {uploadingImage ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Uploading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="h-4 w-4 mr-2" />
                                                                    Upload
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setImageFile(null)
                                                                setImagePreview(null)
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = ''
                                                                }
                                                            }}
                                                            className="px-6 py-6 rounded-xl"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}

                                                {product?.imageUrl && !imagePreview && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleRemoveImage}
                                                        disabled={uploadingImage}
                                                        className="w-full py-6 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all"
                                                    >
                                                        {uploadingImage ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Removing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove Image
                                                            </>
                                                        )}
                                                    </Button>
                                                )}

                                                <p className="text-xs text-muted-foreground text-center">
                                                    JPEG, PNG, WebP (max 5MB)
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Quick Stats */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card className="border-border/50 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-muted-foreground">Treatments:</span>
                                                <Badge variant="outline">{(product?.treatments || []).length}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-muted-foreground">Ingredients:</span>
                                                <Badge variant="outline">{formData.activeIngredients.length}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-muted-foreground">Forms Enabled:</span>
                                                <Badge variant="outline">{enabledForms.length}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-muted-foreground">Has Image:</span>
                                                <Badge variant={product?.imageUrl ? "default" : "outline"}>
                                                    {product?.imageUrl ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-end gap-4 mt-8 pb-8"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/products/${product?.id}`)}
                                disabled={saving}
                                size="lg"
                                className="px-8 py-6 rounded-xl text-base"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                size="lg"
                                className="px-8 py-6 rounded-xl text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Product
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </div>
            </div>
        </Layout>
    )
}
