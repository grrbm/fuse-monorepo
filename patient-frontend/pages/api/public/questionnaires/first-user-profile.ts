import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        const url = `${API_BASE}/public/questionnaires/first-user-profile`
        const response = await fetch(url)
        const data = await response.json()
        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/public/questionnaires/first-user-profile:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}


