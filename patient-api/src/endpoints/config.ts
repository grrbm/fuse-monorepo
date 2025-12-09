import { Router } from "express";
import { authenticateJWT } from "../config/jwt";
import { GlobalFees } from "../models/GlobalFees";
import User from "../models/User";
import UserRoles from "../models/UserRoles";

const router = Router();

/**
 * GET /config/fees
 * Returns the platform fee configuration from the database
 * @auth Required (admin only)
 */
router.get("/fees", authenticateJWT, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id, {
      include: [{ model: UserRoles, as: "userRoles", required: false }],
    });

    if (!user || !user.hasRoleSync("admin")) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const globalFees = await GlobalFees.findOne();

    if (!globalFees) {
      return res.status(404).json({
        success: false,
        message: "Global fees configuration not found. Please contact support.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        platformFeePercent: Number(globalFees.fuseTransactionFeePercent),
        stripeFeePercent: Number(globalFees.stripeTransactionFeePercent),
        doctorFlatFeeUsd: Number(globalFees.fuseTransactionDoctorFeeUsd),
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee configuration",
    });
  }
});

/**
 * PUT /config/fees
 * Updates the platform fee configuration
 * @auth Required (admin only)
 */
router.put("/fees", authenticateJWT, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id, {
      include: [{ model: UserRoles, as: "userRoles", required: false }],
    });

    if (!user || !user.hasRoleSync("admin")) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { platformFeePercent, stripeFeePercent, doctorFlatFeeUsd } = req.body;

    if (
      (platformFeePercent !== undefined &&
        typeof platformFeePercent !== "number") ||
      (stripeFeePercent !== undefined &&
        typeof stripeFeePercent !== "number") ||
      (doctorFlatFeeUsd !== undefined && typeof doctorFlatFeeUsd !== "number")
    ) {
      return res.status(400).json({
        success: false,
        message: "Fee values must be numeric",
      });
    }

    let globalFees = await GlobalFees.findOne();

    if (!globalFees) {
      globalFees = await GlobalFees.create({
        fuseTransactionFeePercent: platformFeePercent ?? 0,
        stripeTransactionFeePercent: stripeFeePercent ?? 0,
        fuseTransactionDoctorFeeUsd: doctorFlatFeeUsd ?? 0,
      });
    } else {
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
      message: "Fee configuration updated successfully",
      data: {
        platformFeePercent: Number(globalFees.fuseTransactionFeePercent),
        stripeFeePercent: Number(globalFees.stripeTransactionFeePercent),
        doctorFlatFeeUsd: Number(globalFees.fuseTransactionDoctorFeeUsd),
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to update fee configuration",
    });
  }
});

export default router;
