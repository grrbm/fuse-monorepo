import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function OfferingsPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/treatments')
    }, [router])

    return null
}

