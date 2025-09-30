import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: 'Questionnaire ID is required' })
        }

        const token = req.headers.authorization || req.headers['x-auth-token'] || req.query.token

        if (!token || typeof token !== 'string') {
            return res.status(401).json({ success: false, message: 'Missing authentication token' })
        }

        const url = `${API_BASE}/questionnaires/${id}`

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}`,
            },
        })

        const data = await response.json()

        res.status(response.status).json(data)
    } catch (error) {
        console.error('Proxy error /api/questionnaires/[id]:', error)
        res.status(500).json({ success: false, message: 'Internal proxy error' })
    }
}
