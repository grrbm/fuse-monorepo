import { Router } from 'express';
import { authenticateJWT } from '../config/jwt';

const router = Router();

/**
 * GET /config/fees
 * Returns the platform fee configuration
 * @auth Required
 */
router.get('/fees', authenticateJWT, async (req, res) => {
    try {
        const fees = {
            platformFeePercent: Number(process.env.FUSE_TRANSACTION_FEE_PERCENT ?? 1),
            stripeFeePercent: Number(process.env.STRIPE_TRANSACTION_FEE_PERCENT ?? 3.9),
            doctorFlatFeeUsd: Number(process.env.FUSE_TRANSACTION_DOCTOR_FEE_USD ?? 20),
        };

        return res.status(200).json({
            success: true,
            data: fees
        });
    } catch (error: any) {
        console.error('Error fetching fee configuration:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch fee configuration'
        });
    }
});

export default router;

