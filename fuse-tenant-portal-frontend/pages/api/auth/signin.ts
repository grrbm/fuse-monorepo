import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'tenant-portal-jwt-secret-key'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      email: string
      name: string
      role: string
      organization?: string
    }
  }
  message?: string
}

const mockUsers = [
  {
    id: '1',
    email: 'tenant@demo.com',
    password: 'demo123',
    name: 'Demo Tenant',
    role: 'tenant',
    organization: 'Demo Healthcare Corp'
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, password }: LoginRequest = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  const user = mockUsers.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  const { password: _, ...userWithoutPassword } = user

  res.status(200).json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    }
  })
}