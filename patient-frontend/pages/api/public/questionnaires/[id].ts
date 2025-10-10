import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query
        const hostname = req.headers['x-forwarded-host'] || req.headers.host

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: 'Questionnaire id is required' })
        }

        if (!hostname || typeof hostname !== 'string') {
            return res.status(400).json({ success: false, message: 'Clinic hostname not provided' })
        }

        const url = `${API_BASE}/public/questionnaires/${encodeURIComponent(id)}`
        const response = await fetch(url)
        const data = await response.json()
        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/public/questionnaires/[id]:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}


