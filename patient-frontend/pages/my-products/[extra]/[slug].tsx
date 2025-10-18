import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { QuestionnaireModal } from '../../../components/QuestionnaireModal'

type Status = 'idle' | 'loading'

interface PublicProduct {
    id: string
    name: string
    slug: string
    questionnaireId: string | null
    category?: string | null
    currentFormVariant?: string | null
}

export default function PublicProductPage() {
    const router = useRouter()
    const { extra, slug } = router.query

    const [status, setStatus] = useState<Status>('loading')
    const [error, setError] = useState<string | null>(null)
    const [product, setProduct] = useState<PublicProduct | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        if (typeof slug === 'string') {
            const expectedVariant = typeof extra === 'string' ? extra : null
            console.log('[PublicProduct] route params', { extra, slug, expectedVariant })
            loadProduct(slug, expectedVariant)
        }
    }, [slug, extra])

    const loadProduct = async (productSlug: string, expectedVariant: string | null) => {
        setStatus('loading')
        setError(null)

        try {
            const res = await fetch(`/api/public/brand-products/${encodeURIComponent(productSlug)}`)
            const data = await res.json().catch(() => null)
            console.log('[PublicProduct] api response', data)

            if (!res.ok || !data?.success || !data?.data) {
                setError(data?.message || 'This product is not currently available. Please contact the brand for assistance.')
                setStatus('idle')
                return
            }

            // Optional: API may include currentFormVariant
            const currentFormVariant: string | null = data.data.currentFormVariant ?? null

            // If a specific variant is requested, ensure it matches the enabled one
            if (expectedVariant && currentFormVariant && currentFormVariant !== expectedVariant) {
                console.warn('[PublicProduct] variant mismatch', { expectedVariant, currentFormVariant })
                setError('Form variant not enabled')
                setStatus('idle')
                return
            }

            setProduct({
                id: data.data.id,
                name: data.data.name,
                slug: data.data.slug,
                questionnaireId: data.data.questionnaireId,
                category: data.data.category || null,
                currentFormVariant,
            })
            setIsModalOpen(true)
        } catch (err) {
            console.error('❌ Public product load error:', err)
            setError('We could not load this product form. Please refresh the page or contact support.')
        } finally {
            setStatus('idle')
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        router.push('/treatments')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>{product ? `${product.name} - Fuse` : 'Product Intake'}</title>
                <meta name="description" content="Complete your clinical intake" />
            </Head>

            {status === 'loading' && !error && (
                <div className="flex items-center justify-center h-screen text-muted-foreground">
                    Loading product details...
                </div>
            )}

            {error && (
                <div className="flex items-center justify-center h-screen px-6">
                    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-700">
                        <p className="font-semibold mb-2">We hit a snag</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {product && isModalOpen && product.questionnaireId && (
                <QuestionnaireModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    questionnaireId={product.questionnaireId}
                    productName={product.name}
                    productCategory={product.category || undefined}
                    productFormVariant={typeof extra === 'string' ? extra : undefined}
                />
            )}
        </div>
    )
}


