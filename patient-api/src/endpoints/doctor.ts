import { Express, Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Order from '../models/Order';
import Clinic from '../models/Clinic';
import TenantProduct from '../models/TenantProduct';
import Product from '../models/Product';
import Treatment from '../models/Treatment';
import ShippingAddress from '../models/ShippingAddress';
import OrderService from '../services/order.service';
import PharmacyProduct from '../models/PharmacyProduct';
import Pharmacy from '../models/Pharmacy';

export function registerDoctorEndpoints(app: Express, authenticateJWT: any, getCurrentUser: any) {

    // ============= DOCTOR PORTAL ENDPOINTS =============

    // Get all clinics for filters
    app.get("/doctor/clinics", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Fetch all clinics
            const clinics = await Clinic.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']],
            });

            res.json({
                success: true,
                data: clinics
            });

        } catch (error) {
            console.error('❌ Error fetching clinics:', error);
            res.status(500).json({ success: false, message: "Failed to fetch clinics" });
        }
    });

    // Get tenant products for filters
    app.get("/doctor/tenant-products", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findByPk(currentUser.id);
            if (!user) {
                return res.status(403).json({ success: false, message: "User not found" });
            }

            // Build where clause
            const whereClause: any = {};

            // If user has a clinicId, filter by that clinic
            if (user.clinicId) {
                whereClause.clinicId = user.clinicId;
            }

            // Fetch tenant products
            const tenantProducts = await TenantProduct.findAll({
                where: whereClause,
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'description', 'placeholderSig', 'categories'],
                    }
                ],
                order: [['createdAt', 'DESC']],
            });

            res.json({
                success: true,
                data: tenantProducts.map(tp => ({
                    id: tp.id,
                    name: tp.product?.name || 'Product',
                    description: tp.product?.description,
                    placeholderSig: tp.product?.placeholderSig,
                    category: Array.isArray((tp.product as any)?.categories) ? (tp.product as any).categories[0] ?? null : null,
                    categories: Array.isArray((tp.product as any)?.categories) ? (tp.product as any).categories : [],
                    isActive: tp.isActive,
                }))
            });

        } catch (error) {
            console.error('❌ Error fetching tenant products:', error);
            res.status(500).json({ success: false, message: "Failed to fetch tenant products" });
        }
    });

    // Get pending orders for doctor's clinic
    app.get("/doctor/orders/pending", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Fetch full user data to get clinicId
            const user = await User.findByPk(currentUser.id);
            if (!user) {
                return res.status(403).json({ success: false, message: "User not found" });
            }

            // Allow doctors and admins to access all orders
            // If user has a clinicId, filter by that clinic
            // Otherwise (admin), show all orders

            // Parse filters from query params
            const {
                status,
                tenantProductId,
                clinicId,
                patientId,
                patientSearch,
                dateFrom,
                dateTo,
                patientAge,
                patientGender,
                limit = '50',
                offset = '0'
            } = req.query as any;

            // Build where clause - show ALL orders by default
            const whereClause: any = {
                // Only show orders with tenantProductId (orders for tenant products)
                tenantProductId: { [Op.ne]: null }
            };

            // Optional status filter (if not provided, show all statuses)
            if (status) {
                whereClause.status = status;
            }

            // Optional clinic filter
            if (clinicId) {
                whereClause.clinicId = clinicId;
            }

            if (tenantProductId) {
                whereClause.tenantProductId = tenantProductId;
            }

            // Optional patient filter
            if (patientId) {
                whereClause.userId = patientId;
            }

            if (dateFrom || dateTo) {
                whereClause.createdAt = {};
                if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
                if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
            }

            // Build user include with optional search filter
            const userInclude: any = {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'dob', 'gender', 'address', 'city', 'state', 'zipCode'],
            };

            // Add patient search filter if provided
            if (patientSearch) {
                userInclude.where = {
                    [Op.or]: [
                        { firstName: { [Op.iLike]: `%${patientSearch}%` } },
                        { lastName: { [Op.iLike]: `%${patientSearch}%` } },
                        { email: { [Op.iLike]: `%${patientSearch}%` } }
                    ]
                };
            }

            // Fetch orders with TenantProduct
            const orders = await Order.findAll({
                where: whereClause,
                include: [
                    userInclude,
                    {
                        model: Treatment,
                        as: 'treatment',
                        attributes: ['id', 'name', 'category'],
                    },
                    {
                        model: ShippingAddress,
                        as: 'shippingAddress',
                    },
                    {
                        model: TenantProduct,
                        as: 'tenantProduct',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'placeholderSig', 'categories'],
                            }
                        ]
                    },
                    {
                        model: Clinic,
                        as: 'clinic',
                        attributes: ['id', 'name'],
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: Math.min(parseInt(limit), 200),
                offset: parseInt(offset),
            });

            // Note: Demographics filtering removed as fields don't exist on User model
            // Age and gender can be added when User model is updated
            const filteredOrders = orders;

            res.json({
                success: true,
                data: filteredOrders.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    totalAmount: order.totalAmount,
                    approvedByDoctor: order.approvedByDoctor,
                    autoApprovedByDoctor: order.autoApprovedByDoctor,
                    autoApprovalReason: order.autoApprovalReason,
                    doctorNotes: order.doctorNotes,
                    patient: order.user ? {
                        id: order.user.id,
                        firstName: order.user.firstName,
                        lastName: order.user.lastName,
                        email: order.user.email,
                        phoneNumber: order.user.phoneNumber,
                        dateOfBirth: order.user.dob,
                        gender: order.user.gender,
                        address: order.user.address,
                        city: order.user.city,
                        state: order.user.state,
                        zipCode: order.user.zipCode,
                    } : null,
                    treatment: order.treatment,
                    tenantProduct: order.tenantProduct ? {
                        id: order.tenantProduct.id,
                        name: order.tenantProduct.product?.name || 'Product',
                        description: order.tenantProduct.product?.description,
                        placeholderSig: order.tenantProduct.product?.placeholderSig,
                        category: Array.isArray((order.tenantProduct.product as any)?.categories)
                            ? (order.tenantProduct.product as any).categories[0] ?? null
                            : null,
                        categories: Array.isArray((order.tenantProduct.product as any)?.categories)
                            ? (order.tenantProduct.product as any).categories
                            : [],
                    } : null,
                    clinic: order.clinic ? {
                        id: order.clinic.id,
                        name: order.clinic.name,
                    } : null,
                    shippingAddress: order.shippingAddress,
                    questionnaireAnswers: order.questionnaireAnswers,
                    mdCaseId: order.mdCaseId,
                    mdPrescriptions: order.mdPrescriptions,
                    mdOfferings: order.mdOfferings,
                })),
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: filteredOrders.length,
                }
            });

        } catch (error) {
            console.error('❌ Error fetching pending orders for doctor:', error);
            res.status(500).json({ success: false, message: "Failed to fetch pending orders" });
        }
    });

    // Bulk approve orders
    app.post("/doctor/orders/bulk-approve", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findByPk(currentUser.id);
            if (!user) {
                return res.status(401).json({ success: false, message: "User not found" });
            }

            const { orderIds } = req.body;
            if (!Array.isArray(orderIds) || orderIds.length === 0) {
                return res.status(400).json({ success: false, message: "orderIds array is required" });
            }

            console.log('✅ Bulk approve request:', { userId: user.id, userRole: user.role, orderCount: orderIds.length });

            // Fetch all orders - doctors and admins can approve any order
            const orders = await Order.findAll({
                where: {
                    id: { [Op.in]: orderIds }
                }
            });

            if (orders.length !== orderIds.length) {
                console.log('⚠️ Some orders not found:', { requested: orderIds.length, found: orders.length });
                return res.status(404).json({
                    success: false,
                    message: "Some orders do not exist."
                });
            }

            // Approve each order
            const orderService = new OrderService();
            const results: any[] = [];

            for (const order of orders) {
                try {
                    const result = await orderService.approveOrder(order.id);
                    results.push({
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        ...result
                    });
                } catch (error) {
                    results.push({
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        success: false,
                        message: "Failed to approve order",
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            const successCount = results.filter((r: any) => r.success).length;
            const failCount = results.length - successCount;

            res.json({
                success: true,
                message: `Bulk approval completed: ${successCount} succeeded, ${failCount} failed`,
                data: {
                    results,
                    summary: {
                        total: results.length,
                        succeeded: successCount,
                        failed: failCount,
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error bulk approving orders:', error);
            res.status(500).json({ success: false, message: "Failed to bulk approve orders" });
        }
    });

    // Get pharmacy coverage for an order
    app.get("/doctor/orders/:orderId/pharmacy-coverage", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { orderId } = req.params;

            // Fetch order with product and patient state
            const order = await Order.findOne({
                where: { id: orderId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'state']
                    },
                    {
                        model: ShippingAddress,
                        as: 'shippingAddress',
                        attributes: ['state']
                    },
                    {
                        model: TenantProduct,
                        as: 'tenantProduct',
                        required: false,
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            // Determine patient's state (prefer shipping address)
            const patientState = order.shippingAddress?.state || order.user?.state;
            const productId = order.tenantProduct?.product?.id;

            if (!patientState) {
                return res.json({
                    success: false,
                    hasCoverage: false,
                    error: "Patient state not found"
                });
            }

            if (!productId) {
                return res.json({
                    success: false,
                    hasCoverage: false,
                    error: "Product not found for order"
                });
            }

            // Find pharmacy coverage for this product and state
            const coverage = await PharmacyProduct.findOne({
                where: {
                    productId,
                    state: patientState
                },
                include: [
                    {
                        model: Pharmacy,
                        as: 'pharmacy',
                        attributes: ['id', 'name', 'slug', 'isActive']
                    }
                ]
            });

            if (!coverage || !coverage.pharmacy?.isActive) {
                return res.json({
                    success: false,
                    hasCoverage: false,
                    error: `No active pharmacy coverage for ${order.tenantProduct?.product?.name || 'this product'} in ${patientState}`,
                    data: {
                        productId,
                        productName: order.tenantProduct?.product?.name,
                        state: patientState
                    }
                });
            }

            res.json({
                success: true,
                hasCoverage: true,
                data: {
                    pharmacy: {
                        id: coverage.pharmacy.id,
                        name: coverage.pharmacy.name,
                        slug: coverage.pharmacy.slug
                    },
                    coverage: {
                        state: patientState,
                        pharmacyProductId: coverage.pharmacyProductId,
                        pharmacyProductName: coverage.pharmacyProductName,
                        pharmacyWholesaleCost: coverage.pharmacyWholesaleCost,
                        sig: coverage.sig
                    },
                    product: {
                        id: productId,
                        name: order.tenantProduct?.product?.name
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error checking pharmacy coverage:', error);
            res.status(500).json({ success: false, message: "Failed to check pharmacy coverage" });
        }
    });

    // Add doctor notes to order
    app.post("/doctor/orders/:orderId/notes", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findByPk(currentUser.id);
            if (!user) {
                return res.status(401).json({ success: false, message: "User not found" });
            }

            const { orderId } = req.params;
            const { note } = req.body;

            if (!note || typeof note !== 'string') {
                return res.status(400).json({ success: false, message: "note is required" });
            }

            // Validate order exists (any authenticated user can add notes)
            const order = await Order.findByPk(orderId);

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            // Add notes using order service
            const orderService = new OrderService();
            const result = await orderService.addDoctorNotes(orderId, user.id, note);

            res.json(result);

        } catch (error) {
            console.error('❌ Error adding doctor notes:', error);
            res.status(500).json({ success: false, message: "Failed to add doctor notes" });
        }
    });

    // Get order statistics for doctor's clinic
    app.get("/doctor/orders/stats", authenticateJWT, async (req: any, res: any) => {
        try {
            const currentUser = getCurrentUser(req);
            if (!currentUser) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findByPk(currentUser.id);
            if (!user || user.role !== 'doctor') {
                return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
            }

            if (!user.clinicId) {
                return res.status(400).json({ success: false, message: "No clinic associated with this doctor" });
            }

            // Get counts for different statuses
            const totalPending = await Order.count({
                where: {
                    clinicId: user.clinicId,
                    status: 'paid',
                }
            });

            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const approvedToday = await Order.count({
                where: {
                    clinicId: user.clinicId,
                    status: 'processing',
                    updatedAt: {
                        [Op.gte]: startOfToday
                    }
                }
            });

            const autoApprovedCount = await Order.count({
                where: {
                    clinicId: user.clinicId,
                    autoApprovedByDoctor: true,
                }
            });

            res.json({
                success: true,
                data: {
                    totalPending,
                    approvedToday,
                    autoApprovedCount,
                    requiresAction: totalPending,
                }
            });

        } catch (error) {
            console.error('❌ Error fetching doctor order stats:', error);
            res.status(500).json({ success: false, message: "Failed to fetch order statistics" });
        }
    });

}

