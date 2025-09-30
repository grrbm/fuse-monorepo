import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const token = req.headers.authorization || req.headers['x-auth-token'] || req.query.token

        if (!token || typeof token !== 'string') {
            return res.status(401).json({ success: false, message: 'Missing authentication token' })
        }

        const subPath = req.url?.replace(/^\/api\/brand-treatments/, '') || ''
        const url = `${API_BASE}/brand-treatments${subPath}`

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}`,
            },
            body: req.method && req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        })

        const data = await response.json()

        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/brand-treatments:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}
