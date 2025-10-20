import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { slug } = req.query
        const hostname = req.headers['x-forwarded-host'] || req.headers.host

        if (!slug || typeof slug !== 'string') {
            return res.status(400).json({ success: false, message: 'Product slug is required' })
        }

        if (!hostname || typeof hostname !== 'string') {
            return res.status(400).json({ success: false, message: 'Clinic hostname not provided' })
        }

        // Expect hostname like "limitless.health.localhost:3000" in dev
        let clinicSlug: string | null = null

        if (process.env.NODE_ENV === 'production') {
            // Expect host like "{clinicSlug}.fuse.health"
            const parts = hostname.split('.fuse.health')
            clinicSlug = parts.length > 1 ? parts[0] : null
        } else {
            // Expect host like "limitless.health.localhost:3000"
            const parts = hostname.split('.health.localhost')
            clinicSlug = parts.length > 1 ? parts[0] : null
        }

        if (!clinicSlug) {
            console.log("serach for clinic by custom domain Edu")
            try {
                const customDomainResponse = await fetch(`${API_BASE}/clinic/by-custom-domain`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain: process.env.NODE_ENV === 'production' ? hostname : hostname.split(':3000')[0] })
                })

                if (customDomainResponse.ok) {
                    const customDomainData = await customDomainResponse.json()
                    if (customDomainData.success && customDomainData.slug) {
                        clinicSlug = customDomainData.slug
                        console.log(`✅ Found clinic via custom domain: ${clinicSlug}`)
                    }
                }
            } catch (error) {
                console.error('Error fetching clinic by custom domain:', error)
            }

            if (!clinicSlug) {
                return res.status(400).json({ success: false, message: 'Unable to determine clinic from hostname' })
            }
        }

        const url = `${API_BASE}/public/brand-products/${encodeURIComponent(clinicSlug)}/${encodeURIComponent(slug)}`

        const response = await fetch(url)
        const data = await response.json()

        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/public/brand-products/[slug]:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}


