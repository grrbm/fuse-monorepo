import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { slug } = req.query

        if (!slug || typeof slug !== 'string') {
            return res.status(400).json({ success: false, message: 'Clinic slug is required' })
        }

        const url = `${API_BASE}/clinic/by-slug/${encodeURIComponent(slug)}`

        const response = await fetch(url)
        const data = await response.json()

        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/public/clinic/[slug]:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}

