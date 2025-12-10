import { Express } from "express";
import Clinic from "../models/Clinic";
import Product from "../models/Product";
import TenantProduct from "../models/TenantProduct";

/**
 * Public endpoints that don't require authentication
 * These are accessible to anyone and are used by the landing pages
 */
export function registerPublicEndpoints(app: Express) {
    // Helper function to fetch products for a clinic
    const fetchProductsForClinic = async (clinicId: string) => {
        const tenantProducts = await TenantProduct.findAll({
            where: { clinicId },
            include: [{
                model: Product,
                as: "product",
                where: { isActive: true },
                required: true,
                attributes: ['id', 'name', 'description', 'imageUrl', 'categories', 'price']
            }],
            limit: 50,
            order: [['createdAt', 'DESC']]
        });

        return tenantProducts.map((tp: any) => ({
            id: tp.product.id,
            name: tp.product.name,
            description: tp.product.description,
            imageUrl: tp.product.imageUrl,
            categories: tp.product.categories || [],
            price: tp.price || tp.product.price,
            wholesalePrice: tp.product.price,
        }));
    };

    // Public endpoint to get products for landing page (with clinic slug)
    app.get("/public/products/:clinicSlug", async (req, res) => {
        try {
            const { clinicSlug } = req.params;

            const clinic = await Clinic.findOne({
                where: { slug: clinicSlug }
            });

            if (!clinic) {
                return res.status(404).json({
                    success: false,
                    message: "Clinic not found"
                });
            }

            const products = await fetchProductsForClinic(clinic.id);

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error fetching public products:', error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch products"
            });
        }
    });

    // Public endpoint to get products (without clinic slug - for localhost testing)
    app.get("/public/products", async (req, res) => {
        try {
            // For localhost testing: get any clinic
            const anyClinic = await Clinic.findOne();

            if (!anyClinic) {
                return res.status(404).json({
                    success: false,
                    message: "No clinic found"
                });
            }

            const products = await fetchProductsForClinic(anyClinic.id);

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error fetching public products:', error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch products"
            });
        }
    });

    // Public endpoint to get ALL products (for all-products page)
    app.get("/public/all-products", async (req, res) => {
        try {
            const allProducts = await Product.findAll({
                where: { isActive: true },
                attributes: ['id', 'name', 'description', 'imageUrl', 'categories', 'price'],
                limit: 100,
                order: [['createdAt', 'DESC']]
            });

            const products = allProducts.map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                categories: product.categories || [],
                price: product.price,
                wholesalePrice: product.price,
            }));

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error fetching all products:', error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch all products"
            });
        }
    });
}

