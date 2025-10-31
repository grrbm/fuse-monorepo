import { Express } from 'express';
import Pharmacy from '../models/Pharmacy';
import PharmacyProduct from '../models/PharmacyProduct';
import Product from '../models/Product';
import { PharmacyIntegrationService } from '../services/pharmacyIntegration';

export function registerPharmacyEndpoints(app: Express, authenticateJWT: any, getCurrentUser: any) {

    // ============= PHARMACY MANAGEMENT ENDPOINTS =============

    // Get products from a pharmacy's external API
    app.get("/pharmacies/:pharmacySlug/products", authenticateJWT, async (req, res) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const { pharmacySlug } = req.params;
            const { state, states } = req.query;

            const pharmacyService = new PharmacyIntegrationService();

            // If multiple states are provided, fetch for all of them
            if (states && typeof states === 'string') {
                const stateArray = states.split(',').map(s => s.trim());
                const products = await pharmacyService.getProductsByPharmacyAndStates(pharmacySlug, stateArray);
                return res.json({ success: true, data: products });
            }

            // Single state
            if (state && typeof state === 'string') {
                const products = await pharmacyService.getProductsByPharmacy(pharmacySlug, state);
                return res.json({ success: true, data: products });
            }

            return res.status(400).json({
                success: false,
                message: "Either 'state' or 'states' query parameter is required"
            });
        } catch (error: any) {
            console.error('Error fetching pharmacy products:', error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch pharmacy products"
            });
        }
    });

    // List all pharmacies
    app.get("/pharmacies", authenticateJWT, async (req, res) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const pharmacies = await Pharmacy.findAll({
                where: { isActive: true },
                order: [['name', 'ASC']]
            });

            res.json({ success: true, data: pharmacies });
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
            res.status(500).json({ success: false, message: "Failed to fetch pharmacies" });
        }
    });

    // Get pharmacy assignments for a product
    app.get("/products/:productId/pharmacy-assignments", authenticateJWT, async (req, res) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const { productId } = req.params;

            const assignments = await PharmacyProduct.findAll({
                where: { productId },
                include: [{ model: Pharmacy, as: 'pharmacy' }],
                order: [['state', 'ASC']]
            });

            res.json({ success: true, data: assignments });
        } catch (error) {
            console.error('Error fetching pharmacy assignments:', error);
            res.status(500).json({ success: false, message: "Failed to fetch pharmacy assignments" });
        }
    });

    // Assign pharmacy to states for a product
    app.post("/products/:productId/pharmacy-assignments", authenticateJWT, async (req, res) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const { productId } = req.params;
            const { pharmacyId, states, pharmacyProductId, pharmacyProductName, pharmacyWholesaleCost } = req.body;

            if (!pharmacyId || !states || !Array.isArray(states) || states.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "pharmacyId and states array are required"
                });
            }

            // Check for existing assignments in these states
            const existingAssignments = await PharmacyProduct.findAll({
                where: {
                    productId,
                    state: states
                }
            });

            if (existingAssignments.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Some states are already assigned to a pharmacy`,
                    conflicts: existingAssignments.map(a => a.state)
                });
            }

            // HACK: For AbsoluteRX, try to find the price from existing Product model
            let wholesaleCost = pharmacyWholesaleCost;
            if (pharmacyProductId && !wholesaleCost) {
                const pharmacy = await Pharmacy.findByPk(pharmacyId);
                if (pharmacy && pharmacy.slug === 'absoluterx') {
                    console.log('🔍 AbsoluteRX detected - looking up price for SKU:', pharmacyProductId);
                    const existingProduct = await Product.findOne({
                        where: { pharmacyProductId: pharmacyProductId.toString() }
                    });
                    if (existingProduct) {
                        wholesaleCost = existingProduct.price;
                        console.log('✅ Found price from existing product:', wholesaleCost);
                    } else {
                        console.log('⚠️ No existing product found with SKU:', pharmacyProductId);
                    }
                }
            }

            // Create assignments for each state
            const assignments = await Promise.all(
                states.map(state =>
                    PharmacyProduct.create({
                        productId,
                        pharmacyId,
                        state,
                        pharmacyProductId,
                        pharmacyProductName,
                        pharmacyWholesaleCost: wholesaleCost
                    })
                )
            );

            res.status(201).json({ success: true, data: assignments });
        } catch (error: any) {
            console.error('Error creating pharmacy assignments:', error);
            res.status(500).json({ success: false, message: error.message || "Failed to create pharmacy assignments" });
        }
    });

    // Update pharmacy assignment
    app.put("/pharmacy-assignments/:id", authenticateJWT, async (req, res) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const { id } = req.params;
            const { pharmacyProductId, pharmacyProductName, pharmacyWholesaleCost } = req.body;

            const assignment = await PharmacyProduct.findByPk(id);

            if (!assignment) {
                return res.status(404).json({ success: false, message: "Assignment not found" });
            }

            await assignment.update({
                pharmacyProductId,
                pharmacyProductName,
                pharmacyWholesaleCost
            });

            res.json({ success: true, data: assignment });
        } catch (error) {
            console.error('Error updating pharmacy assignment:', error);
            res.status(500).json({ success: false, message: "Failed to update pharmacy assignment" });
        }
    });

    // Delete pharmacy assignment
    app.delete("/pharmacy-assignments/:id", authenticateJWT, async (req, res) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const { id } = req.params;

            const assignment = await PharmacyProduct.findByPk(id);
            if (!assignment) {
                return res.status(404).json({ success: false, message: "Assignment not found" });
            }

            await assignment.destroy();
            res.json({ success: true, message: "Pharmacy assignment deleted" });
        } catch (error) {
            console.error('Error deleting pharmacy assignment:', error);
            res.status(500).json({ success: false, message: "Failed to delete pharmacy assignment" });
        }
    });

}

