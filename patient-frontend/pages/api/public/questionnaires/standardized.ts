import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { category } = req.query
        const params = new URLSearchParams()
        if (typeof category === 'string' && category.trim().length > 0) {
            params.set('category', category)
        }

        const url = `${API_BASE}/public/questionnaires/standardized${params.toString() ? `?${params.toString()}` : ''}`
        const response = await fetch(url)
        const data = await response.json()
        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/public/questionnaires/standardized:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}


