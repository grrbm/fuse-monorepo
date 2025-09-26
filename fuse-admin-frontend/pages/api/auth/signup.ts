import type { NextApiRequest, NextApiResponse } from 'next'

// Mock user database - in production, this would be a real database
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Demo Admin',
    role: 'admin'
  }
]

// Mock JWT token generation
function generateMockToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, password, and name are required' 
    })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format' 
    })
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    })
  }

  // Check if user already exists
  const existingUser = MOCK_USERS.find(u => u.email === email)
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      message: 'User with this email already exists' 
    })
  }

  // Create new user
  const newUser = {
    id: (MOCK_USERS.length + 1).toString(),
    email,
    password, // In production, this would be hashed
    name,
    role: 'admin'
  }

  // Add to mock database
  MOCK_USERS.push(newUser)

  // Generate token
  const token = generateMockToken(newUser.id)

  // Return user data (without password) and token
  const { password: _, ...userWithoutPassword } = newUser

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      token,
      user: userWithoutPassword
    }
  })
}