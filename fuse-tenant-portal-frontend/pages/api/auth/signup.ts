import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'tenant-portal-jwt-secret-key'

interface SignupRequest {
  email: string
  password: string
  name: string
  organization: string
}

interface SignupResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      email: string
      name: string
      role: string
      organization: string
    }
  }
  message?: string
}

let mockUsers = [
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
  res: NextApiResponse<SignupResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, password, name, organization }: SignupRequest = req.body

  if (!email || !password || !name || !organization) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, password, name, and organization are required' 
    })
  }

  const existingUser = mockUsers.find(u => u.email === email)
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User already exists' })
  }

  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    password,
    name,
    role: 'tenant',
    organization
  }

  mockUsers.push(newUser)

  const token = jwt.sign(
    { 
      userId: newUser.id, 
      email: newUser.email,
      role: newUser.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  const { password: _, ...userWithoutPassword } = newUser

  res.status(201).json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    }
  })
}