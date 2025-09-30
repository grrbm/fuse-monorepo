import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { planType, amount, currency } = req.body
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    if (!planType || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields: planType, amount' })
    }

    // Forward to backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planType,
        amount,
        currency: currency || 'usd'
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      res.status(200).json({
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      })
    } else {
      res.status(response.status).json({ message: data.message || 'Failed to create payment intent' })
    }
  } catch (error) {
    console.error('Payment Intent API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
