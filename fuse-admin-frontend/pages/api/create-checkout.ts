import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { planType, onboardingType, totalAmount, items } = req.body
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    // Forward to backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-subscriptions/create-combined-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planType,
        onboardingType,
        totalAmount,
        items,
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/onboarding?canceled=true`
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      res.status(200).json({ checkoutUrl: data.url })
    } else {
      res.status(response.status).json({ message: data.message || 'Failed to create checkout session' })
    }
  } catch (error) {
    console.error('Checkout API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
