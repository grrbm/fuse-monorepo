import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { QuestionnaireModal } from '../../../components/QuestionnaireModal'

export default function QuestionnairePreviewPage() {
    const router = useRouter()
    const { id } = router.query
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id || typeof id !== 'string') {
            setLoading(false)
            return
        }

        // Verify questionnaire exists
        const verifyQuestionnaire = async () => {
            try {
                const res = await fetch(`/api/public/questionnaires/${encodeURIComponent(id)}`)
                const data = await res.json()

                if (!res.ok || !data?.success) {
                    setError(data?.message || 'Questionnaire not found')
                    setLoading(false)
                    return
                }

                // Open modal
                setIsModalOpen(true)
                setLoading(false)
            } catch (err: any) {
                console.error('Error loading questionnaire:', err)
                setError(err.message || 'Failed to load questionnaire')
                setLoading(false)
            }
        }

        verifyQuestionnaire()
    }, [id])

    const handleModalClose = () => {
        setIsModalOpen(false)
        // Optionally redirect or show a message
        setTimeout(() => {
            setError('Preview closed. Refresh to view again.')
        }, 300)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Questionnaire Preview - Fuse</title>
                <meta name="description" content="Preview questionnaire flow" />
            </Head>

            {loading && (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        <p className="mt-4 text-gray-600">Loading preview...</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="flex items-center justify-center h-screen px-6">
                    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-700">
                        <p className="font-semibold mb-2">Preview Error</p>
                        <p>{error}</p>
                        <button
                            onClick={() => router.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Reload Preview
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && id && typeof id === 'string' && (
                <QuestionnaireModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    questionnaireId={id}
                    productName="Preview Mode"
                />
            )}
        </div>
    )
}

