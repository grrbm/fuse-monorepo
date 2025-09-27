import type { NextApiRequest, NextApiResponse } from 'next'

// Mock JWT token generation - consistent with other auth endpoints
function generateMockToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

interface BrandSignupRequest {
  companyName: string
  contactName: string
  email: string
  phone: string
  website?: string
  password: string
  role: string
}

interface BrandSignupResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      email: string
      name: string
      role: string
      companyName: string
      phone: string
      website?: string
    }
  }
  message?: string
}

let mockUsers = [
  {
    id: '1',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Demo Admin',
    role: 'admin'
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BrandSignupResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { companyName, contactName, email, phone, website, password, role }: BrandSignupRequest = req.body

  if (!companyName || !contactName || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Company name, contact name, email, phone, and password are required'
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
    name: contactName,
    role: role || 'brand',
    companyName,
    phone,
    website
  }

  mockUsers.push(newUser)

  const token = generateMockToken(newUser.id)

  const { password: _, ...userWithoutPassword } = newUser

  res.status(201).json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    }
  })
}