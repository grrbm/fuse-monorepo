import { Router } from 'express';
import { authenticateJWT } from '../config/jwt';
import { GlobalFees } from '../models/GlobalFees';

const router = Router();

/**
 * GET /config/fees
 * Returns the platform fee configuration from the database
 * @auth Required
 */
router.get('/fees', authenticateJWT, async (req, res) => {
  try {
    // Fetch the first (and should be only) GlobalFees row
    const globalFees = await GlobalFees.findOne();

    if (!globalFees) {
      return res.status(404).json({
        success: false,
        message: 'Global fees configuration not found. Please contact support.'
      });
    }

    const fees = {
      platformFeePercent: Number(globalFees.fuseTransactionFeePercent),
      stripeFeePercent: Number(globalFees.stripeTransactionFeePercent),
      doctorFlatFeeUsd: Number(globalFees.fuseTransactionDoctorFeeUsd),
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

/**
 * PUT /config/fees
 * Updates the platform fee configuration
 * @auth Required (admin only recommended)
 */
router.put('/fees', authenticateJWT, async (req, res) => {
  try {
    const { platformFeePercent, stripeFeePercent, doctorFlatFeeUsd } = req.body;

    // Fetch the first (and should be only) GlobalFees row
    let globalFees = await GlobalFees.findOne();

    if (!globalFees) {
      // Create if doesn't exist
      globalFees = await GlobalFees.create({
        fuseTransactionFeePercent: platformFeePercent ?? 0,
        stripeTransactionFeePercent: stripeFeePercent ?? 0,
        fuseTransactionDoctorFeeUsd: doctorFlatFeeUsd ?? 0,
      });
    } else {
      // Update existing
      if (platformFeePercent !== undefined) {
        globalFees.fuseTransactionFeePercent = platformFeePercent;
      }
      if (stripeFeePercent !== undefined) {
        globalFees.stripeTransactionFeePercent = stripeFeePercent;
      }
      if (doctorFlatFeeUsd !== undefined) {
        globalFees.fuseTransactionDoctorFeeUsd = doctorFlatFeeUsd;
      }
      await globalFees.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Fee configuration updated successfully',
      data: {
        platformFeePercent: Number(globalFees.fuseTransactionFeePercent),
        stripeFeePercent: Number(globalFees.stripeTransactionFeePercent),
        doctorFlatFeeUsd: Number(globalFees.fuseTransactionDoctorFeeUsd),
      }
    });
  } catch (error: any) {
    console.error('Error updating fee configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update fee configuration'
    });
  }
});

export default router;

