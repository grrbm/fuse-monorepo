import { NextApiRequest, NextApiResponse } from 'next'

// @deprecated This can be removed
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        console.log('❌ Wrong method:', req.method)
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        console.log('🔍 Confirm payment API called')
        const { paymentMethodId, planType, planCategory, downpaymentPlanType, amount, currency } = req.body
        const token = req.headers.authorization?.replace('Bearer ', '')

        console.log('🔍 Request body:', { paymentMethodId, planType, planCategory, downpaymentPlanType, amount, currency })
        console.log('🔍 Authorization header present:', !!req.headers.authorization)
        console.log('🔍 Token extracted:', !!token)

        if (!token) {
            console.error('❌ No authorization token provided')
            return res.status(401).json({ message: 'No authorization token provided' })
        }


        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/confirm-payment-intent`
        console.log('🔍 Backend URL:', backendUrl)

        // Forward to backend API
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                paymentMethodId,
                planType,
                amount,
                planCategory,
                downpaymentPlanType,
                currency: currency || 'usd'
            })
        })

        console.log('🔍 Backend response status:', response.status)
        console.log('🔍 Backend response ok:', response.ok)

        const data = await response.json()
        console.log('🔍 Backend response data:', data)

        if (response.ok && data.success) {
            console.log('✅ Subscription created successfully')
            res.status(200).json({
                clientSecret: data.clientSecret,
                requiresAction: data.requiresAction,
                subscription: data.subscription,
                subscriptionId: data.subscriptionId
            })
        } else {
            console.error('❌ Backend error:', data)
            res.status(response.status).json({ message: data.message || 'Failed to confirm payment' })
        }
    } catch (error) {
        console.error('❌ Confirm Payment API error:', error)
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
        res.status(500).json({ message: 'Internal server error' })
    }
}
