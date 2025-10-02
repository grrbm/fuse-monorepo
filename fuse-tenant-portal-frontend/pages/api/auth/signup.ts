import type { NextApiRequest, NextApiResponse } from 'next'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, password, name, organization } = req.body as {
    email?: string
    password?: string
    name?: string
    organization?: string
  }

  if (!email || !password || !name || !organization) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, name, and organization are required',
    })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, organization, role: 'brand' }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(201).json(data)
  } catch (error) {
    console.error('Tenant portal signup proxy error:', error)
    return res.status(500).json({ success: false, message: 'Failed to sign up. Please try again.' })
  }
}