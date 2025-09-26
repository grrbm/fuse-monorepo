import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
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
    Hash
} from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    description?: string
    pharmacyProductId?: string
    dosage?: string
    imageUrl?: string | null
    activeIngredients?: string[]
    active: boolean
    createdAt: string
    updatedAt: string
    treatments?: Array<{
        id: string
        name: string
    }>
}

export default function ProductEdit() {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        description: '',
        pharmacyProductId: '',
        dosage: '',
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
                console.log('🔍 Fetching product for edit:', id)

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
                            description: productData.description || '',
                            pharmacyProductId: productData.pharmacyProductId || '',
                            dosage: productData.dosage || '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product || !token) return

        setSaving(true)
        setError(null)

        try {
            console.log('🔍 Saving product:', product.id)

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
                    dosage: formData.dosage,
                    activeIngredients: formData.activeIngredients,
                    active: formData.active
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    console.log('✅ Product updated successfully')
                    router.push(`/products/${product.id}`)
                } else {
                    setError(data.message || 'Failed to update product')
                }
            } else {
                const errorText = await response.text()
                setError(`Failed to update product: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error updating product:', err)
            setError('Failed to update product')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file')
                return
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB')
                return
            }

            setImageFile(file)

            // Create preview
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
                    // Update the product with the new image URL
                    setProduct(prev => prev ? { ...prev, imageUrl: data.data.imageUrl } : null)
                    setImageFile(null)
                    setImagePreview(null)
                    console.log('✅ Image uploaded successfully')

                    // Clear the file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                } else {
                    setError(data.message || 'Failed to upload image')
                }
            } else {
                const errorText = await response.text()
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
                    // Update the product to remove the image
                    setProduct(prev => prev ? { ...prev, imageUrl: '' } : null)
                    console.log('✅ Image removed successfully')
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
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading product...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !product) {
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

                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <XCircle className="h-12 w-12 text-red-500" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
                                    <p className="text-muted-foreground mb-4">{error || 'The requested product could not be found.'}</p>
                                    <Button onClick={() => router.push('/products')}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Products
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>Edit {product?.name || 'Product'} - Fuse Admin</title>
                <meta name="description" content={`Edit product details for ${product?.name || 'Unknown Product'}`} />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/products/${product.id}`)}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Product
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
                                <p className="text-muted-foreground">Update product information</p>
                            </div>
                        </div>
                        {getStatusBadge(product.active)}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                                    Product Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Enter product name"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Enter product description"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                                                        Price *
                                                    </label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <input
                                                            type="number"
                                                            id="price"
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleInputChange}
                                                            step="0.01"
                                                            min="0"
                                                            required
                                                            className="w-full pl-10 pr-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="pharmacyProductId" className="block text-sm font-medium text-foreground mb-2">
                                                        Pharmacy Product ID
                                                    </label>
                                                    <div className="relative">
                                                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            id="pharmacyProductId"
                                                            name="pharmacyProductId"
                                                            value={formData.pharmacyProductId}
                                                            onChange={handleInputChange}
                                                            className="w-full pl-10 pr-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Enter pharmacy ID"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="dosage" className="block text-sm font-medium text-foreground mb-2">
                                                    Default Dosage
                                                </label>
                                                <input
                                                    type="text"
                                                    id="dosage"
                                                    name="dosage"
                                                    value={formData.dosage}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="e.g., 500mg, 2 tablets daily"
                                                />
                                            </div>

                                            {/* Status Toggle */}
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Status
                                                </label>
                                                <div className="flex gap-4">
                                                    <Button
                                                        type="button"
                                                        variant={formData.active ? "default" : "outline"}
                                                        onClick={() => handleStatusChange(true)}
                                                        className="flex-1"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Active
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={!formData.active ? "default" : "outline"}
                                                        onClick={() => handleStatusChange(false)}
                                                        className="flex-1"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Inactive
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Active Ingredients */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Active Ingredients</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {formData.activeIngredients.map((ingredient, index) => (
                                                <div key={index} className="flex items-center gap-2">
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
                                                        className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                        placeholder="e.g., Acetaminophen"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newIngredients = formData.activeIngredients.filter((_, i) => i !== index)
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                activeIngredients: newIngredients
                                                            }))
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        activeIngredients: [...prev.activeIngredients, '']
                                                    }))
                                                }}
                                                className="w-full"
                                            >
                                                + Add Ingredient
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Current Product Image */}
                                {product.imageUrl && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Current Image</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full max-w-xs mx-auto h-32 object-cover rounded-lg border"
                                                />
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Current product image
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Product Image Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Product Image
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Image Preview */}
                                            {imagePreview && (
                                                <div className="text-center">
                                                    <img
                                                        src={imagePreview}
                                                        alt="New image preview"
                                                        className="w-full max-w-xs mx-auto h-32 object-cover rounded-lg border-2 border-primary"
                                                    />
                                                    <p className="text-sm text-primary mt-2">
                                                        New image preview
                                                    </p>
                                                </div>
                                            )}

                                            {/* File Input */}
                                            <div className="space-y-2">
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
                                                        variant="outline"
                                                        className="w-full cursor-pointer"
                                                        asChild
                                                    >
                                                        <span>
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            {imageFile ? 'Change Image' : 'Upload New Image'}
                                                        </span>
                                                    </Button>
                                                </label>

                                                {imageFile && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={handleImageUpload}
                                                            disabled={uploadingImage}
                                                            className="flex-1"
                                                        >
                                                            {uploadingImage ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Uploading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="h-4 w-4 mr-2" />
                                                                    Upload Image
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setImageFile(null)
                                                                setImagePreview(null)
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = ''
                                                                }
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Remove Image Button */}
                                                {product.imageUrl && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleRemoveImage}
                                                        disabled={uploadingImage}
                                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                Supported formats: JPEG, PNG, WebP (max 5MB)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Product Statistics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Associated Treatments:</span>
                                                <span className="font-semibold">{(product?.treatments || []).length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Active Ingredients:</span>
                                                <span className="font-semibold">{(product?.activeIngredients || []).length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Has Image:</span>
                                                <span className="font-semibold">{product.imageUrl ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Created:</span>
                                                <span className="font-semibold text-xs">{new Date(product.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/products/${product.id}`)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    )
}

function getStatusBadge(active: boolean) {
    return active
        ? <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
        : <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
}
