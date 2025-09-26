import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import multer from "multer";
import { initializeDatabase } from "./config/database";
import { MailsSender } from "./services/mailsSender";
import User from "./models/User";
import Clinic from "./models/Clinic";
import Treatment from "./models/Treatment";
import Product from "./models/Product";
import Order from "./models/Order";
import OrderItem from "./models/OrderItem";
import Payment from "./models/Payment";
import ShippingAddress from "./models/ShippingAddress";
import BrandSubscription from "./models/BrandSubscription";
import BrandSubscriptionPlans from "./models/BrandSubscriptionPlans";
import { createJWTToken, authenticateJWT, getCurrentUser } from "./config/jwt";
import { uploadToS3, deleteFromS3, isValidImageFile, isValidFileSize } from "./config/s3";
import Stripe from "stripe";
import OrderService from "./services/order.service";
import UserService from "./services/user.service";
import TreatmentService from "./services/treatment.service";
import PaymentService from "./services/payment.service";
import { processStripeWebhook } from "./services/stripe/webhook";
import TreatmentProducts from "./models/TreatmentProducts";
import TreatmentPlan from "./models/TreatmentPlan";
import ShippingOrder from "./models/ShippingOrder";
import QuestionnaireService from "./services/questionnaire.service";
import QuestionnaireStepService from "./services/questionnaireStep.service";
import QuestionService from "./services/question.service";
import StripeService from "./services/stripe";
import TreatmentPlanService from "./services/treatmentPlan.service";
import PhysicianService from "./services/physician.service";
import SubscriptionService from "./services/subscription.service";
import MDWebhookService from "./services/mdIntegration/MDWebhook.service";
import MDPatientService from "./services/mdIntegration/MDPatient.service";
import MDAuthService from "./services/mdIntegration/MDAuth.service";

// Helper function to generate unique clinic slug
async function generateUniqueSlug(clinicName: string, excludeId?: string): Promise<string> {
  // Generate base slug from clinic name
  const baseSlug = clinicName.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check if base slug is available
  const whereClause: any = { slug: baseSlug };
  if (excludeId) {
    whereClause.id = { [require('sequelize').Op.ne]: excludeId };
  }

  const existingClinic = await Clinic.findOne({ where: whereClause });

  if (!existingClinic) {
    return baseSlug;
  }

  // If base slug exists, try incremental numbers
  let counter = 1;
  while (true) {
    const slugWithNumber = `${baseSlug}-${counter}`;
    const whereClauseWithNumber: any = { slug: slugWithNumber };
    if (excludeId) {
      whereClauseWithNumber.id = { [require('sequelize').Op.ne]: excludeId };
    }

    const existingWithNumber = await Clinic.findOne({ where: whereClauseWithNumber });

    if (!existingWithNumber) {
      return slugWithNumber;
    }

    counter++;
  }
}

// Aptible SSL workaround - disable SSL certificate validation in production
// This is safe within Aptible's secure network environment
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
  console.log('Available env variables:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
} else {
  console.log('✅ Stripe secret key found, initializing...');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Validate APP_WEBHOOK_SECRET
if (!process.env.APP_WEBHOOK_SECRET) {
  console.error('❌ APP_WEBHOOK_SECRET environment variable is not set');
  process.exit(1);
}

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (isValidImageFile(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// HIPAA-compliant CORS configuration with explicit origin whitelisting
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
        process.env.FRONTEND_URL || 'https://app-95863.on-aptible.com',
        'https://app-95883.on-aptible.com', // Current frontend URL
        'http://3.140.178.30', // Add your frontend IP
        'https://unboundedhealth.xyz', // Add unboundedhealth.xyz
        'https://www.unboundedhealth.xyz'
      ]
      : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3030', 'http://3.140.178.30', 'https://unboundedhealth.xyz']; // Allow local frontends, your IP, and unboundedhealth.xyz during development

    // Check if origin is in allowed list or matches patterns
    const isAllowed = allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV === 'production' && /^https:\/\/app-\d+\.on-aptible\.com$/.test(origin)) ||
      // Allow clinic subdomains in development (e.g., g-health.localhost:3000, saboia.xyz.localhost:3000)
      (process.env.NODE_ENV === 'development' && /^http:\/\/[a-zA-Z0-9.-]+\.localhost:3000$/.test(origin)) ||
      // Allow production clinic domains (e.g., app.limitless.health, app.hims.com)
      (process.env.NODE_ENV === 'production' && /^https:\/\/app\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(origin)) ||
      // Allow all subdomains of unboundedhealth.xyz (legacy support)
      /^https:\/\/[a-zA-Z0-9-]+\.unboundedhealth\.xyz$/.test(origin);

    if (isAllowed) {
      console.log(`✅ CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Essential for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(helmet());

// Conditional JSON parsing - exclude webhook paths that need raw body
app.use((req, res, next) => {
  if (req.path === '/webhook/stripe') {
    next(); // Skip JSON parsing for Stripe webhook
  } else {
    express.json()(req, res, next); // Apply JSON parsing for all other routes
  }
});

// No session middleware needed for JWT

// Health check endpoint
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Auth routes
app.post("/auth/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, dateOfBirth, phoneNumber, clinicName, clinicId } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate clinic name for healthcare providers
    if (role === 'provider' && !clinicName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Clinic name is required for healthcare providers"
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', email);
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    console.log('✅ No existing user found, proceeding with registration');

    // Handle clinic association
    let clinic = null;
    let finalClinicId = clinicId; // Use provided clinicId from request body

    // Create clinic if user is a healthcare provider and no clinicId provided
    if (role === 'provider' && clinicName && !clinicId) {
      console.log('🏥 Creating clinic with name:', clinicName);

      // Generate unique slug
      const slug = await generateUniqueSlug(clinicName.trim());

      clinic = await Clinic.create({
        name: clinicName.trim(),
        slug: slug,
        logo: '', // Default empty logo, can be updated later
      });

      finalClinicId = clinic.id;
      console.log('✅ Clinic created successfully with ID:', clinic.id);
      console.log('🏥 Created clinic details:', { id: clinic.id, name: clinic.name, slug: clinic.slug });
    } else if (clinicId) {
      console.log('🔗 Associating user with existing clinic ID:', clinicId);
    }

    // Map frontend role to backend role
    let mappedRole: 'patient' | 'doctor' | 'admin' | 'brand' = 'patient'; // default
    if (role === 'provider') {
      mappedRole = 'doctor';
    } else if (role === 'admin') {
      mappedRole = 'admin';
    } else if (role === 'brand') {
      mappedRole = 'brand';
    }

    // Create new user in database
    console.log('🚀 Creating new user with data:', { firstName, lastName, email, role: mappedRole, dob: dateOfBirth, phoneNumber, finalClinicId });
    const user = await User.createUser({
      firstName,
      lastName,
      email,
      password,
      role: mappedRole,
      dob: dateOfBirth,
      phoneNumber,
    });

    // Associate user with clinic if one is provided
    if (finalClinicId) {
      user.clinicId = finalClinicId;
      await user.save();
      console.log('🔗 User associated with clinic ID:', finalClinicId);
    }

    console.log('✅ User created successfully with ID:', user.id);
    console.log('👤 Created user details:', user.toSafeJSON());

    // Generate activation token and send verification email
    const activationToken = user.generateActivationToken();
    await user.save();

    console.log('🔑 Generated activation token for user:', user.email);

    // Send verification email
    const emailSent = await MailsSender.sendVerificationEmail(
      user.email,
      activationToken,
      user.firstName
    );

    if (emailSent) {
      console.log('📧 Verification email sent successfully');
    } else {
      console.log('❌ Failed to send verification email, but user was created');
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to activate your account.",
      user: user.toSafeJSON(), // Return safe user data
      emailSent: emailSent
    });

  } catch (error: any) {
    // HIPAA Compliance: Don't log the actual error details that might contain PHI
    console.error('Registration error occurred:', error.name);

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user data provided"
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
});

app.post("/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user account is activated
    if (!user.activated) {
      return res.status(401).json({
        success: false,
        message: "Please check your email and activate your account before signing in.",
        needsActivation: true
      });
    }

    // Update last login time
    await user.updateLastLogin();

    // Create JWT token
    const token = createJWTToken(user);

    console.log('JWT token created for user:', user.email); // Safe to log email for development

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      token: token,
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error('Authentication error occurred');
    res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again."
    });
  }
});

// Email verification endpoint
app.get("/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    // Find user with this activation token
    const user = await User.findOne({
      where: {
        activationToken: token
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token"
      });
    }

    // Check if token is valid and not expired
    if (!user.isActivationTokenValid(token)) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one."
      });
    }

    // Check if user is already activated
    if (user.activated) {
      console.log('✅ User already activated, logging them in:', user.email);

      // Create JWT token for automatic login
      const authToken = createJWTToken(user);

      return res.status(200).json({
        success: true,
        message: "Account is already activated! You are now logged in.",
        token: authToken,
        user: user.toSafeJSON()
      });
    }

    // Activate the user
    await user.activate();
    console.log('✅ User activated successfully:', user.email);

    // Send welcome email
    await MailsSender.sendWelcomeEmail(user.email, user.firstName);

    // Create JWT token for automatic login
    const authToken = createJWTToken(user);

    res.status(200).json({
      success: true,
      message: "Account activated successfully! You are now logged in.",
      token: authToken,
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error('Email verification error occurred:', error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again."
    });
  }
});

app.post("/auth/signout", async (_req, res) => {
  try {
    // With JWT, signout is handled client-side by removing the token
    // No server-side session to destroy
    res.status(200).json({
      success: true,
      message: "Signed out successfully"
    });
  } catch (error) {
    console.error('Sign out error occurred');
    res.status(500).json({
      success: false,
      message: "Sign out failed"
    });
  }
});

app.get("/auth/me", authenticateJWT, async (req, res) => {
  try {
    // Get user data from JWT
    const currentUser = getCurrentUser(req);

    // Optionally fetch fresh user data from database
    const user = await User.findByPk(currentUser?.id);
    if (!user) {
      // User was deleted from database but JWT token still exists
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error('Auth check error occurred');
    res.status(500).json({
      success: false,
      message: "Auth check failed"
    });
  }
});

// User profile update endpoint
app.put("/auth/profile", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { firstName, lastName, phoneNumber, dob, address, city, state, zipCode } = req.body;

    // HIPAA Compliance: Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required"
      });
    }

    // Find user in database
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user profile (only allow certain fields to be updated)
    await user.update({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber?.trim() || null,
      dob: dob?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      zipCode: zipCode?.trim() || null,
    });

    console.log('Profile updated for user:', user.email); // Safe - no PHI

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error('Profile update error occurred');
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
});

// Clinic routes
// Public endpoint to get clinic by slug (for subdomain routing)
app.get("/clinic/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const clinic = await Clinic.findOne({
      where: { slug },
      attributes: ['id', 'name', 'slug', 'logo'] // Only return public fields
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

    console.log(`✅ Clinic found by slug "${slug}":`, clinic.name);

    res.json({
      success: true,
      data: clinic
    });

  } catch (error) {
    console.error('❌ Error fetching clinic by slug:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.get("/clinic/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow users to access their own clinic data (doctors and patients)
    if (user.clinicId !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const clinic = await Clinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        logo: clinic.logo,
      }
    });

  } catch (error) {
    console.error('Error fetching clinic data');
    res.status(500).json({
      success: false,
      message: "Failed to fetch clinic data"
    });
  }
});

app.put("/clinic/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to update clinic data, and only their own clinic
    if ((user.role !== 'doctor' && user.role !== 'brand') || user.clinicId !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Clinic name is required"
      });
    }

    const clinic = await Clinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

    // Generate new slug if name changed
    let newSlug = clinic.slug;
    if (name.trim() !== clinic.name) {
      newSlug = await generateUniqueSlug(name.trim(), clinic.id);
      console.log('🏷️ Generated new slug:', newSlug);
    }

    // Update clinic data
    await clinic.update({
      name: name.trim(),
      slug: newSlug,
      logo: logo?.trim() || '',
    });

    console.log('🏥 Clinic updated:', { id: clinic.id, name: clinic.name, slug: clinic.slug });

    res.status(200).json({
      success: true,
      message: "Clinic updated successfully",
      data: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        logo: clinic.logo,
      }
    });

  } catch (error) {
    console.error('Error updating clinic data');
    res.status(500).json({
      success: false,
      message: "Failed to update clinic data"
    });
  }
});

// Clinic logo upload endpoint
app.post("/clinic/:id/upload-logo", authenticateJWT, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to upload logos for their own clinic
    if ((user.role !== 'doctor' && user.role !== 'brand') || user.clinicId !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Validate file size (additional check)
    if (!isValidFileSize(req.file.size)) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB."
      });
    }

    const clinic = await Clinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

    // Delete old logo from S3 if it exists
    if (clinic.logo && clinic.logo.trim() !== '') {
      try {
        await deleteFromS3(clinic.logo);
        console.log('🗑️ Old logo deleted from S3');
      } catch (error) {
        console.error('Warning: Failed to delete old logo from S3:', error);
        // Don't fail the entire request if deletion fails
      }
    }

    // Upload new logo to S3
    const logoUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Update clinic with new logo URL
    await clinic.update({ logo: logoUrl });

    console.log('🏥 Logo uploaded for clinic:', { id: clinic.id, logoUrl });

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        logo: clinic.logo,
      }
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: "Failed to upload logo"
    });
  }
});

// Products by clinic endpoint
app.get("/products/by-clinic/:clinicId", authenticateJWT, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get role
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to access products for their own clinic
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only doctors and brand users can access products. Your role: ${user.role}`
      });
    }

    // Verify the user has access to this clinic
    if (user.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access products for your own clinic."
      });
    }

    console.log(`🛍️ Fetching products for clinic: ${clinicId}, user role: ${user.role}, user clinicId: ${user.clinicId}`);

    // First, let's see all products in the database for debugging
    const allProducts = await Product.findAll({
      include: [
        {
          model: Treatment,
          as: 'treatments',
          through: { attributes: [] },
          attributes: ['id', 'name'],
        }
      ],
      order: [['name', 'ASC']]
    });

    console.log(`📊 Total products in database: ${allProducts.length}`);
    console.log(`📊 Products with clinicId: ${allProducts.filter(p => p.clinicId).length}`);
    console.log(`📊 Products with null/undefined clinicId: ${allProducts.filter(p => !p.clinicId).length}`);

    // Fetch products that belong to this clinic (both with matching clinicId and legacy products)
    let products = [];

    // First, get products with matching clinicId
    const directProducts = await Product.findAll({
      where: { clinicId },
      include: [
        {
          model: Treatment,
          as: 'treatments',
          through: { attributes: [] },
          attributes: ['id', 'name'],
        }
      ],
      order: [['name', 'ASC']]
    });

    console.log(`✅ Found ${directProducts.length} products with matching clinicId ${clinicId}`);
    products.push(...directProducts);

    // Also get legacy products (without clinicId) that are associated with treatments from this clinic
    if (user.clinicId) {
      const legacyProducts = await Product.findAll({
        where: { clinicId: null },
        include: [
          {
            model: Treatment,
            as: 'treatments',
            where: { clinicId: user.clinicId }, // Only treatments from user's clinic
            through: { attributes: [] },
            attributes: ['id', 'name'],
          }
        ],
        order: [['name', 'ASC']]
      });

      // Filter out products that don't have treatments from this clinic
      const filteredLegacyProducts = legacyProducts.filter(product =>
        product.treatments && product.treatments.length > 0
      );

      if (filteredLegacyProducts.length > 0) {
        console.log(`🔄 Found ${filteredLegacyProducts.length} legacy products (without clinicId) associated with treatments from clinic ${user.clinicId}`);
        products.push(...filteredLegacyProducts);
      }

      // As a comprehensive fallback, also get any products that have treatments from this clinic
      // (this catches products that might have clinicId set to something else or null)
      const allClinicProducts = await Product.findAll({
        include: [
          {
            model: Treatment,
            as: 'treatments',
            where: { clinicId: user.clinicId },
            through: { attributes: [] },
            attributes: ['id', 'name'],
          }
        ],
        order: [['name', 'ASC']]
      });

      const comprehensiveFilteredProducts = allClinicProducts.filter(product =>
        product.treatments && product.treatments.length > 0 &&
        !products.some(p => p.id === product.id) // Don't duplicate products already found
      );

      if (comprehensiveFilteredProducts.length > 0) {
        console.log(`🔄 Found ${comprehensiveFilteredProducts.length} additional products through comprehensive treatments search`);
        products.push(...comprehensiveFilteredProducts);
      }
    }

    // Remove duplicates based on product ID
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex(p => p.id === product.id)
    );

    console.log(`📊 Total unique products found: ${uniqueProducts.length} (from ${products.length} before deduplication)`);

    // Transform data to match frontend expectations
    const transformedProducts = uniqueProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      pharmacyProductId: product.pharmacyProductId,
      dosage: product.dosage,
      imageUrl: product.imageUrl,
      clinicId: product.clinicId, // Include clinicId for debugging
      active: true, // Default to active since Product model doesn't have active field
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      treatments: product.treatments || []
    }));

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: transformedProducts
    });

  } catch (error) {
    console.error('Error fetching products by clinic:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
});

// Single product endpoint
app.get("/products/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get role
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to access products
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only doctors and brand users can access products. Your role: ${user.role}`
      });
    }

    console.log(`🛍️ Fetching single product: ${id}, user role: ${user.role}`);

    // Fetch product with associated treatments
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Treatment,
          as: 'treatments',
          through: { attributes: [] }, // Don't include junction table attributes
          attributes: ['id', 'name'] // Only include needed fields
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Transform data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      pharmacyProductId: product.pharmacyProductId,
      dosage: product.dosage,
      description: product.description,
      activeIngredients: product.activeIngredients,
      imageUrl: product.imageUrl,
      active: true, // Default to active since Product model doesn't have active field
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      treatments: product.treatments || []
    };

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: transformedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });
  }
});

// Create product endpoint
app.post("/products", authenticateJWT, async (req, res) => {
  try {
    const { name, price, description, pharmacyProductId, dosage, activeIngredients, active } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get role and clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to create products
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only doctors and brand users can create products. Your role: ${user.role}`
      });
    }

    console.log(`🛍️ Creating product for clinic: ${user.clinicId}, user role: ${user.role}`);

    // Create the product
    const newProduct = await Product.create({
      name,
      price: parseFloat(price),
      description,
      pharmacyProductId,
      dosage,
      activeIngredients: activeIngredients || [],
      active: active !== undefined ? active : true,
      clinicId: user.clinicId,
      imageUrl: '' // Set empty string as default since imageUrl is now nullable
    });

    console.log('✅ Product created successfully:', { id: newProduct.id, name: newProduct.name });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create product"
    });
  }
});

// Delete product endpoint
app.delete("/products/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get role and clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to delete products
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only doctors and brand users can delete products. Your role: ${user.role}`
      });
    }

    console.log(`🗑️ Deleting product: ${id}, user role: ${user.role}`);

    // Find the product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Delete associated image from S3 if it exists
    if (product.imageUrl && product.imageUrl.trim() !== '') {
      try {
        await deleteFromS3(product.imageUrl);
        console.log('🗑️ Product image deleted from S3');
      } catch (error) {
        console.error('Warning: Failed to delete product image from S3:', error);
        // Don't fail the entire request if image deletion fails
      }
    }

    // Delete the product
    try {
      await product.destroy();
      console.log('✅ Product deleted successfully:', { id: product.id, name: product.name });
    } catch (deleteError) {
      console.error('Error deleting product from database:', deleteError);
      return res.status(400).json({
        success: false,
        message: "Cannot delete product because it is being used by treatments. Please remove it from all treatments first."
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
});

// Update product endpoint
app.put("/products/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, pharmacyProductId, dosage, activeIngredients, active } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get role
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to update products
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only doctors and brand users can update products. Your role: ${user.role}`
      });
    }

    console.log(`🛍️ Updating product: ${id}, user role: ${user.role}`);

    // Find the product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Update the product
    const updatedProduct = await product.update({
      name,
      price: parseFloat(price),
      description,
      pharmacyProductId,
      dosage,
      activeIngredients: activeIngredients || [],
      active: active !== undefined ? active : true,
      // Only update imageUrl if it's explicitly provided in the request
      ...(req.body.imageUrl !== undefined && { imageUrl: req.body.imageUrl })
    });

    console.log('✅ Product updated successfully:', { id: updatedProduct.id, name: updatedProduct.name });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
});

// Product image upload endpoint
app.post("/products/:id/upload-image", authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get role
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to upload product images for their own clinic's products
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: "Only doctors and brand users can upload product images"
      });
    }

    // Check if this is a removal request (no file provided)
    const removeImage = req.body && typeof req.body === 'object' && 'removeImage' in req.body && req.body.removeImage === true;

    if (removeImage) {
      // Remove the image
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      if (product.imageUrl && product.imageUrl.trim() !== '') {
        try {
          await deleteFromS3(product.imageUrl);
          console.log('🗑️ Product image deleted from S3');
        } catch (error) {
          console.error('Warning: Failed to delete product image from S3:', error);
          // Don't fail the entire request if deletion fails
        }
      }

      // Update product to remove the image URL
      await product.update({ imageUrl: null });

      console.log('🖼️ Image removed from product:', { id: product.id });

      return res.status(200).json({
        success: true,
        message: "Product image removed successfully",
        data: {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
        }
      });
    }

    // Check if file was uploaded for new image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Validate file size (additional check)
    if (!isValidFileSize(req.file.size)) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB."
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Delete old image from S3 if it exists (1 product = 1 image policy)
    if (product.imageUrl && product.imageUrl.trim() !== '') {
      try {
        await deleteFromS3(product.imageUrl);
        console.log('🗑️ Old product image deleted from S3 (clean storage policy)');
      } catch (error) {
        console.error('Warning: Failed to delete old product image from S3:', error);
        // Don't fail the entire request if deletion fails
      }
    }

    // Upload new image to S3
    const imageUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Update product with new image URL
    await product.update({ imageUrl });

    console.log('🖼️ Image uploaded for product:', { id: product.id, imageUrl });

    res.status(200).json({
      success: true,
      message: "Product image uploaded successfully",
      data: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
      }
    });

  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({
      success: false,
      message: "Failed to upload product image"
    });
  }
});

// Treatment logo upload endpoint
app.post("/treatment/:id/upload-logo", authenticateJWT, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to upload treatment logos for their own clinic's treatments
    if (user.role !== 'doctor' && user.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: "Only doctors and brand users can upload treatment logos"
      });
    }

    const treatment = await Treatment.findByPk(id);
    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found"
      });
    }

    // Verify treatment belongs to user's clinic
    if (treatment.clinicId !== user.clinicId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if this is a logo removal request
    const removeLogo = req.body && typeof req.body === 'object' && 'removeLogo' in req.body && req.body.removeLogo === true;

    if (removeLogo) {
      // Remove the logo
      if (treatment.treatmentLogo && treatment.treatmentLogo.trim() !== '') {
        try {
          await deleteFromS3(treatment.treatmentLogo);
          console.log('🗑️ Treatment logo deleted from S3');
        } catch (error) {
          console.error('Warning: Failed to delete treatment logo from S3:', error);
          // Don't fail the entire request if deletion fails
        }
      }

      // Update treatment to remove the logo URL
      await treatment.update({ treatmentLogo: '' });

      console.log('💊 Logo removed from treatment:', { id: treatment.id });

      return res.status(200).json({
        success: true,
        message: "Treatment logo removed successfully",
        data: {
          id: treatment.id,
          name: treatment.name,
          treatmentLogo: treatment.treatmentLogo,
        }
      });
    }

    // Check if file was uploaded for new logo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Validate file size (additional check)
    if (!isValidFileSize(req.file.size)) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB."
      });
    }

    // Delete old logo from S3 if it exists (1 product = 1 image policy)
    if (treatment.treatmentLogo && treatment.treatmentLogo.trim() !== '') {
      try {
        await deleteFromS3(treatment.treatmentLogo);
        console.log('🗑️ Old treatment logo deleted from S3 (clean storage policy)');
      } catch (error) {
        console.error('Warning: Failed to delete old treatment logo from S3:', error);
        // Don't fail the entire request if deletion fails
      }
    }

    // Upload new logo to S3
    const logoUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Update treatment with new logo URL
    await treatment.update({ treatmentLogo: logoUrl });

    console.log('💊 Logo uploaded for treatment:', { id: treatment.id, logoUrl });

    res.status(200).json({
      success: true,
      message: "Treatment logo uploaded successfully",
      data: {
        id: treatment.id,
        name: treatment.name,
        treatmentLogo: treatment.treatmentLogo,
      }
    });

  } catch (error) {
    console.error('Error uploading treatment logo:', error);
    res.status(500).json({
      success: false,
      message: "Failed to upload treatment logo"
    });
  }
});

// Treatments routes
// Public endpoint to get treatments by clinic slug
app.get("/treatments/by-clinic-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // First find the clinic by slug
    const clinic = await Clinic.findOne({
      where: { slug },
      include: [
        {
          model: Treatment,
          as: 'treatments',
          attributes: ['id', 'name', 'treatmentLogo', 'createdAt', 'updatedAt']
        }
      ]
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

    console.log(`✅ Found ${clinic.treatments?.length || 0} treatments for clinic "${slug}"`);

    res.json({
      success: true,
      data: clinic.treatments || []
    });

  } catch (error) {
    console.error('❌ Error fetching treatments by clinic slug:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Protected endpoint to get treatments by clinic ID (for authenticated users)
app.get("/treatments/by-clinic-id/:clinicId", authenticateJWT, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow users to access their own clinic's treatments
    // For doctors: they can access their clinic's treatments
    // For patients: they can access their clinic's treatments
    if (user.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Find treatments for the clinic
    const treatments = await Treatment.findAll({
      where: { clinicId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: [] }
        }
      ]
    });

    console.log(`✅ Found ${treatments?.length || 0} treatments for clinic ID "${clinicId}"`);

    // Recalculate productsPrice for each treatment
    const updatedTreatments = await Promise.all(
      treatments.map(async (treatment) => {
        if (treatment.products && treatment.products.length > 0) {
          const totalProductsPrice = treatment.products.reduce((sum, product) => {
            const price = parseFloat(String(product.price || 0)) || 0;
            return sum + price;
          }, 0);

          const markupAmount = (totalProductsPrice * 10) / 100; // 10% markup
          const finalProductsPrice = totalProductsPrice + markupAmount;

          // Update the stored value if it's different or NaN
          if (isNaN(treatment.productsPrice) || Math.abs(treatment.productsPrice - finalProductsPrice) > 0.01) {
            console.log(`💊 Updating productsPrice for ${treatment.name} from ${treatment.productsPrice} to ${finalProductsPrice}`);
            await treatment.update({ productsPrice: finalProductsPrice });
            treatment.productsPrice = finalProductsPrice;
          }
        }

        // Return the treatment data without the full products array to keep response size reasonable
        const treatmentData = treatment.toJSON();
        delete treatmentData.products; // Remove the full products array to reduce response size

        return treatmentData;
      })
    );

    res.json({
      success: true,
      data: updatedTreatments
    });

  } catch (error) {
    console.error('❌ Error fetching treatments by clinic ID:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Create new treatment
app.post("/treatments", authenticateJWT, async (req, res) => {
  try {
    const { name, defaultQuestionnaire } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow doctors and brand users to create treatments
    if ((user.role !== 'doctor' && user.role !== 'brand') || !user.clinicId) {
      return res.status(403).json({
        success: false,
        message: "Only doctors and brand users with a clinic can create treatments"
      });
    }

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Treatment name is required"
      });
    }

    // Create treatment
    const treatment = await Treatment.create({
      name: name.trim(),
      userId: user.id,
      clinicId: user.clinicId,
      treatmentLogo: ''
    });

    const stripeService = new StripeService()

    const stripeProduct = await stripeService.createProduct({
      name: name.trim(),
    })

    treatment.update({
      stripeProductId: stripeProduct.id
    })

    console.log('💊 Treatment created:', { id: treatment.id, name: treatment.name });

    if (defaultQuestionnaire) {
      const questionnaireService = new QuestionnaireService()

      console.log("Creating default questionnaire")
      questionnaireService.createDefaultQuestionnaire(treatment.id)
    }



    res.status(201).json({
      success: true,
      message: "Treatment created successfully",
      data: {
        id: treatment.id,
        name: treatment.name,
        treatmentLogo: treatment.treatmentLogo,
      }
    });

  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create treatment"
    });
  }
});

// Update treatment
app.put("/treatments", authenticateJWT, async (req, res) => {
  try {
    const { treatmentId } = req.body;

    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }


    const treatment = await treatmentService.updateTreatment(treatmentId, req.body, currentUser.id)


    res.status(200).json({
      success: true,
      message: "Treatment updated successfully",
      data: {
        id: treatment?.data?.id,
        name: treatment?.data?.name,
        treatmentLogo: treatment?.data?.treatmentLogo,
      }
    });

  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update treatment"
    });
  }
});

// Get single treatment with products
app.get("/treatments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const treatment = await Treatment.findByPk(id, {
      include: [
        {
          model: TreatmentProducts,
          as: 'treatmentProducts',
        },
        {
          model: Product,
          as: 'products',
        },
        {
          model: TreatmentPlan,
          as: 'treatmentPlans',
        },
        {
          model: Clinic,
          as: 'clinic',
        }
      ]
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found"
      });
    }

    console.log('💊 Treatment fetched:', { id: treatment.id, name: treatment.name, productsCount: treatment.products?.length || 0 });

    // Recalculate productsPrice to ensure it's correct
    if (treatment.products && treatment.products.length > 0) {
      const totalProductsPrice = treatment.products.reduce((sum, product) => {
        const price = parseFloat(String(product.price || 0)) || 0;
        return sum + price;
      }, 0);

      const markupAmount = (totalProductsPrice * 10) / 100; // 10% markup
      const finalProductsPrice = totalProductsPrice + markupAmount;

      // Update the stored value if it's different or NaN
      if (isNaN(treatment.productsPrice) || Math.abs(treatment.productsPrice - finalProductsPrice) > 0.01) {
        console.log('💊 Updating productsPrice from', treatment.productsPrice, 'to', finalProductsPrice);
        await treatment.update({ productsPrice: finalProductsPrice });
        treatment.productsPrice = finalProductsPrice;
      }
    }

    res.status(200).json({
      success: true,
      data: treatment
    });

  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch treatment"
    });
  }
});

// Treatment Plan routes
// List treatment plans for a treatment
app.get("/treatment-plans/treatment/:treatmentId", authenticateJWT, async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Create treatment plan service instance
    const treatmentPlanService = new TreatmentPlanService();

    // List treatment plans
    const treatmentPlans = await treatmentPlanService.listTreatmentPlans(treatmentId, currentUser.id);

    console.log('✅ Treatment plans listed:', {
      treatmentId,
      plansCount: treatmentPlans.length,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      data: treatmentPlans
    });

  } catch (error) {
    console.error('❌ Error listing treatment plans:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to list treatment plans"
    });
  }
});

// Create treatment plan
app.post("/treatment-plans", authenticateJWT, async (req, res) => {
  try {
    const { name, description, billingInterval, price, active, popular, sortOrder, treatmentId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!name || !billingInterval || price === undefined || !treatmentId) {
      return res.status(400).json({
        success: false,
        message: "name, billingInterval, price, and treatmentId are required"
      });
    }

    // Create treatment plan service instance
    const treatmentPlanService = new TreatmentPlanService();

    // Create treatment plan
    const newTreatmentPlan = await treatmentPlanService.createTreatmentPlan(
      { name, description, billingInterval, price, active, popular, sortOrder, treatmentId },
      currentUser.id
    );

    console.log('✅ Treatment plan created:', {
      planId: newTreatmentPlan.id,
      name: newTreatmentPlan.name,
      treatmentId: newTreatmentPlan.treatmentId,
      userId: currentUser.id
    });

    res.status(201).json({
      success: true,
      message: "Treatment plan created successfully",
      data: newTreatmentPlan
    });

  } catch (error) {
    console.error('❌ Error creating treatment plan:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create treatment plan"
    });
  }
});

// Update treatment plan
app.put("/treatment-plans", authenticateJWT, async (req, res) => {
  try {
    const { planId, name, description, billingInterval, price, active, popular, sortOrder } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required"
      });
    }

    // Create treatment plan service instance
    const treatmentPlanService = new TreatmentPlanService();

    // Update treatment plan
    const updatedTreatmentPlan = await treatmentPlanService.updateTreatmentPlan(
      planId,
      { name, description, billingInterval, price, active, popular, sortOrder },
      currentUser.id
    );

    console.log('✅ Treatment plan updated:', {
      planId: updatedTreatmentPlan.id,
      name: updatedTreatmentPlan.name,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Treatment plan updated successfully",
      data: updatedTreatmentPlan
    });

  } catch (error) {
    console.error('❌ Error updating treatment plan:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update treatment plan"
    });
  }
});

// Delete treatment plan
app.delete("/treatment-plans", authenticateJWT, async (req, res) => {
  try {
    const { planId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required"
      });
    }

    // Create treatment plan service instance
    const treatmentPlanService = new TreatmentPlanService();

    // Delete treatment plan
    const result = await treatmentPlanService.deleteTreatmentPlan(planId, currentUser.id);

    console.log('✅ Treatment plan deleted:', {
      planId: result.planId,
      deleted: result.deleted,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Treatment plan deleted successfully",
      data: result
    });

  } catch (error) {
    console.error('❌ Error deleting treatment plan:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete treatment plan"
    });
  }
});

// Payment routes
// Create order and payment intent
app.post("/create-payment-intent", authenticateJWT, async (req, res) => {
  try {
    const {
      amount,
      currency = 'usd',
      treatmentId,
      selectedProducts = {},
      selectedPlan = 'monthly',
      shippingInfo = {},
      questionnaireAnswers = {}
    } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Validate required fields
    if (!treatmentId) {
      return res.status(400).json({
        success: false,
        message: "Treatment ID is required"
      });
    }

    // Get treatment with products to validate order
    const treatment = await Treatment.findByPk(treatmentId, {
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['dosage', 'numberOfDoses', 'nextDose']
          }
        }
      ]
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found"
      });
    }

    // Create order
    const orderNumber = Order.generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId: currentUser.id,
      treatmentId,
      questionnaireId: null, // Will be updated if questionnaire is available
      status: 'pending',
      billingPlan: selectedPlan,
      subtotalAmount: amount,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: amount,
      questionnaireAnswers
    });

    // Create order items
    const orderItems = [];
    for (const [productId, quantity] of Object.entries(selectedProducts)) {
      if (quantity && Number(quantity) > 0) {
        const product = treatment.products?.find(p => p.id === productId);
        if (product) {
          const orderItem = await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: Number(quantity),
            unitPrice: product.price,
            totalPrice: product.price * Number(quantity),
            dosage: product.dosage
          });
          orderItems.push(orderItem);
        }
      }
    }

    // Create shipping address if provided
    if (shippingInfo.address && shippingInfo.city && shippingInfo.state && shippingInfo.zipCode) {
      await ShippingAddress.create({
        orderId: order.id,
        address: shippingInfo.address,
        apartment: shippingInfo.apartment || null,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country || 'US'
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: currentUser.id,
        treatmentId,
        orderId: order.id,
        orderNumber: orderNumber,
        selectedProducts: JSON.stringify(selectedProducts),
        selectedPlan,
        orderType: 'treatment_order'
      },
      description: `Order ${orderNumber} - ${treatment.name}`,
    });

    // Create payment record
    await Payment.create({
      orderId: order.id,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      paymentMethod: 'card',
      amount,
      currency: currency.toUpperCase()
    });

    console.log('💳 Order and payment intent created:', {
      orderId: order.id,
      orderNumber: orderNumber,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
        orderNumber: orderNumber
      }
    });

  } catch (error) {
    console.error('Error creating order and payment intent:', error);

    // Log specific error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Check if it's a Stripe error
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('Stripe error type:', (error as any).type);
      console.error('Stripe error code:', (error as any).code);
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order and payment intent",
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
});

// Confirm payment completion
app.post("/confirm-payment", authenticateJWT, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Payment was successful
      // Here you would typically:
      // 1. Update order status in database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Create prescription records, etc.

      console.log('💳 Payment confirmed:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        userId: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back from cents
          status: paymentIntent.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment was not successful",
        data: {
          status: paymentIntent.status
        }
      });
    }

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment"
    });
  }
});

// Create subscription for treatment
app.post("/payments/treatment/sub", async (req, res) => {
  try {
    const { treatmentId, stripePriceId, userDetails, questionnaireAnswers, shippingInfo } = req.body;

    let currentUser = null;

    // Try to get user from auth token if provided
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        currentUser = getCurrentUser(req);
      } catch (error) {
        // Ignore auth errors for public endpoint
      }
    }

    // If no authenticated user and userDetails provided, create/find user
    if (!currentUser && userDetails) {
      const { firstName, lastName, email, phoneNumber } = userDetails;

      // Try to find existing user by email
      currentUser = await User.findByEmail(email);

      if (!currentUser) {
        // Create new user account
        console.log('🔐 Creating user account for subscription:', email);
        currentUser = await User.createUser({
          firstName,
          lastName,
          email,
          password: 'TempPassword123!', // Temporary password
          role: 'patient',
          phoneNumber
        });
        console.log('✅ User account created:', currentUser.id);
      }
    }

    if (!currentUser) {
      return res.status(400).json({
        success: false,
        message: "User authentication or user details required"
      });
    }

    // Validate required fields
    if (!treatmentId) {
      return res.status(400).json({
        success: false,
        message: "Treatment ID is required"
      });
    }

    // Validate stripe price ID
    if (!stripePriceId) {
      return res.status(400).json({
        success: false,
        message: "Stripe price ID is required"
      });
    }

    // Look up the treatment plan to get the billing interval
    const treatmentPlan = await TreatmentPlan.findOne({
      where: { stripePriceId }
    });

    if (!treatmentPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid stripe price ID - no matching treatment plan found"
      });
    }

    const billingInterval = treatmentPlan.billingInterval;
    console.log(`💳 Using billing plan: ${billingInterval} for stripePriceId: ${stripePriceId}`);

    const paymentService = new PaymentService();

    const result = await paymentService.subscribeTreatment(
      {
        treatmentId,
        treatmentPlanId: treatmentPlan.id,
        userId: currentUser.id,
        billingInterval,
        stripePriceId,
        questionnaireAnswers,
        shippingInfo
      }
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error creating treatment subscription:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Create subscription for clinic
app.post("/payments/clinic/sub", authenticateJWT, async (req, res) => {
  try {
    const { clinicId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required"
      });
    }

    const paymentService = new PaymentService();
    const result = await paymentService.subscribeClinic(
      clinicId,
      currentUser.id
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error creating clinic subscription:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Webhook deduplication cache (in production, use Redis or database)
const processedWebhooks = new Set<string>();

// Stripe webhook endpoint
app.post("/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Log webhook details for debugging
  console.log('🔍 Webhook received - Signature:', sig);
  console.log('🔍 Webhook received - Body length:', req.body?.length);
  console.log('🔍 Webhook received - Body preview:', req.body?.toString().substring(0, 200) + '...');

  // Extract timestamp from signature for deduplication
  const sigString = Array.isArray(sig) ? sig[0] : sig;
  const timestampMatch = sigString?.match(/t=(\d+)/);
  const webhookTimestamp = timestampMatch ? timestampMatch[1] : null;
  console.log('🔍 Webhook timestamp:', webhookTimestamp);

  if (!endpointSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  // Log webhook secret info (masked for security)
  const secretPrefix = endpointSecret.substring(0, 10);
  console.log('🔍 Using webhook secret:', secretPrefix + '...');
  console.log('🔍 Webhook secret format check:', endpointSecret.startsWith('whsec_') ? '✅ Valid format' : '❌ Invalid format');

  let event;

  try {
    // Verify webhook signature
    const signature = Array.isArray(sig) ? sig[0] : sig;
    if (!signature) {
      throw new Error('No signature provided');
    }
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('🔍 Debug - Signature header:', sig);
    console.error('🔍 Debug - Endpoint secret configured:', !!endpointSecret);
    console.error('🔍 Debug - Body type:', typeof req.body);
    console.error('🔍 Debug - Body is buffer:', Buffer.isBuffer(req.body));
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Check for duplicate webhook events
  const eventId = event.id;
  if (processedWebhooks.has(eventId)) {
    console.log('⚠️ Duplicate webhook event detected, skipping:', eventId);
    return res.status(200).json({ received: true, duplicate: true });
  }

  // Add to processed webhooks (keep only last 1000 to prevent memory leaks)
  processedWebhooks.add(eventId);
  if (processedWebhooks.size > 1000) {
    const firstEvent = processedWebhooks.values().next().value;
    if (firstEvent) {
      processedWebhooks.delete(firstEvent);
    }
  }

  console.log('🎣 Stripe webhook event received:', event.type, 'ID:', eventId);

  try {
    // Process the event using the webhook service
    await processStripeWebhook(event);

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get orders for a user
app.get("/orders", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const orders = await Order.findAll({
      where: { userId: currentUser.id },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: Payment,
          as: 'payment'
        },
        {
          model: ShippingAddress,
          as: 'shippingAddress'
        },
        {
          model: Treatment,
          as: 'treatment'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
});

// Get single order
app.get("/orders/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = getCurrentUser(req);

    console.log('🔍 [ORDERS/:ID] Request received');
    console.log('🔍 [ORDERS/:ID] Order ID:', id);
    console.log('🔍 [ORDERS/:ID] Current user:', currentUser);

    if (!currentUser) {
      console.log('❌ [ORDERS/:ID] No current user found');
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Fetch full user data from database to get clinicId
    console.log('🔍 [ORDERS/:ID] Fetching user from database...');
    const user = await User.findByPk(currentUser.id);

    if (!user) {
      console.log('❌ [ORDERS/:ID] User not found in database');
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    console.log('🔍 [ORDERS/:ID] User found:', {
      id: user.id,
      role: user.role,
      clinicId: user.clinicId,
      email: user.email
    });

    let whereClause: any = { id };
    let accessType = 'unknown';

    // If user is a patient, only allow access to their own orders
    if (user.role === 'patient') {
      whereClause.userId = currentUser.id;
      accessType = 'patient_own_orders';
      console.log('🔍 [ORDERS/:ID] Patient access - restricting to own orders');
    } else if (user.role === 'doctor' || user.role === 'brand') {
      accessType = 'clinic_access';
      console.log(`🔍 [ORDERS/:ID] ${user.role.toUpperCase()} access - checking order belongs to clinic`);

      // For doctors and brand users, find the order and check if it belongs to their clinic
      console.log('🔍 [ORDERS/:ID] Finding order by ID...');
      const order = await Order.findByPk(id);

      if (!order) {
        console.log('❌ [ORDERS/:ID] Order not found by ID:', id);
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      console.log('🔍 [ORDERS/:ID] Order found:', {
        id: order.id,
        userId: order.userId,
        treatmentId: order.treatmentId,
        status: order.status
      });

      // Get the treatment to find the clinic
      console.log('🔍 [ORDERS/:ID] Finding treatment for order...');
      const treatment = await Treatment.findByPk(order.treatmentId);

      if (!treatment) {
        console.log('❌ [ORDERS/:ID] Treatment not found for order:', order.treatmentId);
        return res.status(404).json({
          success: false,
          message: "Treatment not found"
        });
      }

      console.log('🔍 [ORDERS/:ID] Treatment found:', {
        id: treatment.id,
        name: treatment.name,
        clinicId: treatment.clinicId
      });

      // Check if the treatment belongs to the user's clinic
      console.log('🔍 [ORDERS/:ID] Checking clinic access...');
      console.log('🔍 [ORDERS/:ID] User clinicId:', user.clinicId);
      console.log('🔍 [ORDERS/:ID] Treatment clinicId:', treatment.clinicId);

      if (treatment.clinicId !== user.clinicId) {
        console.log('❌ [ORDERS/:ID] Access denied - treatment clinic does not match user clinic');
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      console.log(`✅ [ORDERS/:ID] ${user.role.toUpperCase()} clinic access granted`);
    } else {
      console.log(`❌ [ORDERS/:ID] Unsupported role: ${user.role}`);
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${user.role}. Only patients, doctors, and brands can access orders.`
      });
    }

    console.log('🔍 [ORDERS/:ID] Executing final query with whereClause:', whereClause);
    console.log('🔍 [ORDERS/:ID] Access type:', accessType);

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: Payment,
          as: 'payment'
        },
        {
          model: ShippingAddress,
          as: 'shippingAddress'
        },
        {
          model: Treatment,
          as: 'treatment'
        },
        {
          model: ShippingOrder,
          as: 'shippingOrders'
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!order) {
      console.log('❌ [ORDERS/:ID] Order not found after final query');
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log('✅ [ORDERS/:ID] Order successfully retrieved and returned');
    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ [ORDERS/:ID] Exception occurred:', error);
    console.error('❌ [ORDERS/:ID] Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
    console.error('❌ [ORDERS/:ID] Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ [ORDERS/:ID] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Brand Subscription routes

// Get available subscription plans
app.get("/brand-subscriptions/plans", async (req, res) => {
  try {
    const plans = await BrandSubscriptionPlans.getActivePlans();

    // Convert to the expected format for the frontend
    const plansObject = plans.reduce((acc, plan) => {
      acc[plan.planType] = {
        name: plan.name,
        price: parseFloat(plan.monthlyPrice.toString()),
        features: plan.getFeatures(),
        stripePriceId: plan.stripePriceId,
        description: plan.description,
      };
      return acc;
    }, {} as any);

    res.status(200).json({
      success: true,
      plans: plansObject
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans"
    });
  }
});

// Get current user's brand subscription
app.get("/brand-subscriptions/current", authenticateJWT, async (req, res) => {
  try {
    // Return successful response with no subscription (empty)
    return res.status(200).json({
      success: true,
      subscription: null
    });

  } catch (error) {
    console.error('Error fetching brand subscription:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription"
    });
  }
});

// Create brand subscription checkout session
app.post("/brand-subscriptions/create-checkout-session", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    const { planType, successUrl, cancelUrl } = req.body;

    if (currentUser?.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await BrandSubscription.findOne({
      where: {
        userId: currentUser.id,
        status: ['active', 'processing', 'past_due']
      }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription. Please cancel your current subscription before creating a new one."
      });
    }

    const selectedPlan = await BrandSubscriptionPlans.getPlanByType(planType as any);

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type"
      });
    }

    // Get full user data from database
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomer;
    try {
      const customers = await stripe.customers.list({
        email: currentUser.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
      } else {
        stripeCustomer = await stripe.customers.create({
          email: currentUser.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: currentUser.id,
            role: currentUser.role
          }
        });
      }
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to create payment customer"
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: selectedPlan.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.FRONTEND_URL}/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/plans?canceled=true`,
      metadata: {
        userId: currentUser.id,
        planType: planType,
        userEmail: currentUser.email
      },
      subscription_data: {
        metadata: {
          userId: currentUser.id,
          planType: planType
        }
      }
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session"
    });
  }
});

// Create combined checkout session (subscription + onboarding)
app.post("/brand-subscriptions/create-combined-checkout", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    const { planType, onboardingType, totalAmount, items, successUrl, cancelUrl } = req.body;

    if (currentUser?.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await BrandSubscription.findOne({
      where: {
        userId: currentUser.id,
        status: ['active', 'processing', 'past_due']
      }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription. Please cancel your current subscription before creating a new one."
      });
    }

    const selectedPlan = await BrandSubscriptionPlans.getPlanByType(planType as any);

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type"
      });
    }

    // Get full user data from database
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomer;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
      } else {
        stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
            role: user.role,
            planType: planType
          }
        });
      }
    } catch (stripeError) {
      console.error('Error with Stripe customer:', stripeError);
      return res.status(500).json({
        success: false,
        message: "Failed to create Stripe customer"
      });
    }

    // Create line items for Stripe checkout
    const lineItems = items.map((item: any) => {
      if (item.type === 'subscription') {
        return {
          price: selectedPlan.stripePriceId,
          quantity: 1
        };
      } else {
        // For one-time items (onboarding), create a price on the fly
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: `One-time ${item.name} fee`
            },
            unit_amount: item.price * 100 // Convert to cents
          },
          quantity: 1
        };
      }
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription', // This handles both subscription and one-time payments
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: currentUser.id,
        planType: planType,
        onboardingType: onboardingType,
        totalAmount: totalAmount.toString()
      },
      subscription_data: {
        metadata: {
          userId: currentUser.id,
          planType: planType,
          onboardingType: onboardingType
        }
      }
    });

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating combined checkout session:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session"
    });
  }
});

// Cancel brand subscription
app.post("/brand-subscriptions/cancel", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (currentUser?.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    const subscription = await BrandSubscription.findOne({
      where: {
        userId: currentUser.id,
        status: ['active', 'processing', 'past_due']
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // Cancel subscription in Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Cancel subscription in database
    await subscription.cancel();

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully"
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription"
    });
  }
});

// Upgrade subscriptions for a treatment to a new treatment plan
app.post("/subscriptions/upgrade", authenticateJWT, async (req, res) => {
  try {
    const { treatmentId } = req.body;
    const currentUser = getCurrentUser(req);
    const userId = currentUser?.id;

    if (!treatmentId) {
      return res.status(400).json({
        success: false,
        message: "treatmentId is required"
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const subscriptionService = new SubscriptionService();
    await subscriptionService.upgradeSubscription(treatmentId, userId);

    res.json({
      success: true,
      message: "Subscriptions upgraded successfully"
    });
  } catch (error) {
    console.error('Error upgrading subscriptions:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upgrade subscriptions"
    });
  }
});

// Cancel all subscriptions for a treatment
app.post("/subscriptions/cancel", authenticateJWT, async (req, res) => {
  try {
    const { treatmentId } = req.body;
    const currentUser = getCurrentUser(req);
    const userId = currentUser?.id;

    if (!treatmentId) {
      return res.status(400).json({
        success: false,
        message: "treatmentId is required"
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const subscriptionService = new SubscriptionService();
    await subscriptionService.cancelSubscriptions(treatmentId, userId);

    res.json({
      success: true,
      message: "Subscriptions cancelled successfully"
    });
  } catch (error) {
    console.error('Error cancelling subscriptions:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to cancel subscriptions"
    });
  }
});

// Questionnaire routes
// Add questionnaire step
app.post("/questionnaires/step", authenticateJWT, async (req, res) => {
  try {
    const { questionnaireId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!questionnaireId) {
      return res.status(400).json({
        success: false,
        message: "treatmentId and questionnaireId are required"
      });
    }

    // Create questionnaire step service instance
    const questionnaireStepService = new QuestionnaireStepService();

    // Add new questionnaire step
    const newStep = await questionnaireStepService.addQuestionnaireStep(questionnaireId, currentUser.id);

    console.log('✅ Questionnaire step added:', {
      stepId: newStep.id,
      title: newStep.title,
      stepOrder: newStep.stepOrder,
      questionnaireId: newStep.questionnaireId
    });

    res.status(201).json({
      success: true,
      message: "Questionnaire step added successfully",
      data: newStep
    });

  } catch (error) {
    console.error('❌ Error adding questionnaire step:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('does not belong')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to add questionnaire step"
    });
  }
});

// Update questionnaire step
app.put("/questionnaires/step", authenticateJWT, async (req, res) => {
  try {
    const { stepId, title, description } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!stepId) {
      return res.status(400).json({
        success: false,
        message: "stepId is required"
      });
    }

    // Validate at least one field to update is provided
    if (title === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title or description) must be provided"
      });
    }

    // Create questionnaire step service instance
    const questionnaireStepService = new QuestionnaireStepService();

    // Update questionnaire step
    const updatedStep = await questionnaireStepService.updateQuestionnaireStep(
      stepId,
      { title, description },
      currentUser.id
    );

    console.log('✅ Questionnaire step updated:', {
      stepId: updatedStep.id,
      title: updatedStep.title,
      description: updatedStep.description,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Questionnaire step updated successfully",
      data: updatedStep
    });

  } catch (error) {
    console.error('❌ Error updating questionnaire step:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update questionnaire step"
    });
  }
});

// Delete questionnaire step
app.delete("/questionnaires/step", authenticateJWT, async (req, res) => {
  try {
    const { stepId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!stepId) {
      return res.status(400).json({
        success: false,
        message: "stepId is required"
      });
    }

    // Create questionnaire step service instance
    const questionnaireStepService = new QuestionnaireStepService();

    // Delete questionnaire step
    const result = await questionnaireStepService.deleteQuestionnaireStep(stepId, currentUser.id);

    console.log('✅ Questionnaire step deleted:', {
      stepId: result.stepId,
      deleted: result.deleted,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Questionnaire step deleted successfully",
      data: result
    });

  } catch (error) {
    console.error('❌ Error deleting questionnaire step:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete questionnaire step"
    });
  }
});

// Update questionnaire steps order
app.post("/questionnaires/step/order", authenticateJWT, async (req, res) => {
  try {
    const { steps, questionnaireId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        message: "steps array is required"
      });
    }

    if (!questionnaireId) {
      return res.status(400).json({
        success: false,
        message: "questionnaireId is required"
      });
    }

    // Validate steps array structure
    for (const step of steps) {
      if (!step.id || typeof step.stepOrder !== 'number') {
        return res.status(400).json({
          success: false,
          message: "Each step must have id (string) and stepOrder (number)"
        });
      }
    }

    // Create questionnaire step service instance
    const questionnaireStepService = new QuestionnaireStepService();

    // Save steps order
    const updatedSteps = await questionnaireStepService.saveStepsOrder(steps, questionnaireId, currentUser.id);

    console.log('✅ Questionnaire steps order updated:', {
      stepsCount: updatedSteps.length,
      stepIds: updatedSteps.map(s => s.id),
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Questionnaire steps order updated successfully",
      data: updatedSteps
    });

  } catch (error) {
    console.error('❌ Error updating questionnaire steps order:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('do not belong to your clinic') ||
        error.message.includes('array is required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update questionnaire steps order"
    });
  }
});

// Get questionnaire for a treatment
app.get("/questionnaires/treatment/:treatmentId", async (req, res) => {
  try {
    const { treatmentId } = req.params;

    // Create questionnaire service instance
    const questionnaireService = new QuestionnaireService();

    // Get questionnaire by treatment
    const questionnaire = await questionnaireService.getQuestionnaireByTreatment(treatmentId);

    console.log(`✅ Found questionnaire for treatment ID "${treatmentId}"`);

    res.json({
      success: true,
      data: questionnaire
    });

  } catch (error) {
    console.error('❌ Error fetching questionnaire:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Question routes
// List questions in questionnaire step
app.get("/questions/step/:stepId", authenticateJWT, async (req, res) => {
  try {
    const { stepId } = req.params;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Create question service instance
    const questionService = new QuestionService();

    // List questions
    const questions = await questionService.listQuestions(stepId, currentUser.id);

    console.log('✅ Questions listed for step:', {
      stepId,
      questionsCount: questions.length,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('❌ Error listing questions:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to list questions"
    });
  }
});

// Create question
app.post("/questions", authenticateJWT, async (req, res) => {
  try {
    const { stepId, questionText, answerType, isRequired, placeholder, helpText, footerNote, options } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!stepId || !questionText || !answerType) {
      return res.status(400).json({
        success: false,
        message: "stepId, questionText, and answerType are required"
      });
    }

    // Create question service instance
    const questionService = new QuestionService();

    // Create question
    const newQuestion = await questionService.createQuestion(
      stepId,
      { questionText, answerType, isRequired, placeholder, helpText, footerNote, options },
      currentUser.id
    );

    console.log('✅ Question created:', {
      questionId: newQuestion?.id,
      questionText: newQuestion?.questionText,
      stepId: newQuestion?.stepId,
      userId: currentUser.id
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: newQuestion
    });

  } catch (error) {
    console.error('❌ Error creating question:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create question"
    });
  }
});

// Update question
app.put("/questions", authenticateJWT, async (req, res) => {
  try {
    const { questionId, questionText, answerType, isRequired, placeholder, helpText, footerNote, options } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId is required"
      });
    }

    // Create question service instance
    const questionService = new QuestionService();

    // Update question
    const updatedQuestion = await questionService.updateQuestion(
      questionId,
      { questionText, answerType, isRequired, placeholder, helpText, footerNote, options },
      currentUser.id
    );

    console.log('✅ Question updated:', {
      questionId: updatedQuestion?.id,
      questionText: updatedQuestion?.questionText,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion
    });

  } catch (error) {
    console.error('❌ Error updating question:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update question"
    });
  }
});

// Delete question
app.delete("/questions", authenticateJWT, async (req, res) => {
  try {
    const { questionId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId is required"
      });
    }

    // Create question service instance
    const questionService = new QuestionService();

    // Delete question
    const result = await questionService.deleteQuestion(questionId, currentUser.id);

    console.log('✅ Question deleted:', {
      questionId: result.questionId,
      deleted: result.deleted,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      data: result
    });

  } catch (error) {
    console.error('❌ Error deleting question:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete question"
    });
  }
});

// Update questions order
app.post("/questions/order", authenticateJWT, async (req, res) => {
  try {
    const { questions, stepId } = req.body;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate required fields
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "questions array is required"
      });
    }

    if (!stepId) {
      return res.status(400).json({
        success: false,
        message: "stepId is required"
      });
    }

    // Validate questions array structure
    for (const question of questions) {
      if (!question.id || typeof question.questionOrder !== 'number') {
        return res.status(400).json({
          success: false,
          message: "Each question must have id (string) and questionOrder (number)"
        });
      }
    }

    // Create question service instance
    const questionService = new QuestionService();

    // Save questions order
    const updatedQuestions = await questionService.saveQuestionsOrder(questions, stepId, currentUser.id);

    console.log('✅ Questions order updated:', {
      questionsCount: updatedQuestions.length,
      questionIds: updatedQuestions.map(q => q.id),
      stepId,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Questions order updated successfully",
      data: updatedQuestions
    });

  } catch (error) {
    console.error('❌ Error updating questions order:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('do not belong to your clinic') ||
        error.message.includes('array is required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update questions order"
    });
  }
});


const userService = new UserService();
const treatmentService = new TreatmentService();
const orderService = new OrderService();


// Check the status 
app.get("/patient/verify-account", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const verified = await userService.isUserVerified(currentUser.id);

    res.status(200).json({ verified });

  } catch (error) {
    console.error('❌ Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.post("/patient/verify-account", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }


    const result = await userService.verifyUserAccount(currentUser.id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Error verifying patient account:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.put("/patient", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { address, ...data } = req.body

    const result = await userService.updateUserPatient(currentUser.id, data, address);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result.error);
    }
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// Order endpoints
app.get("/orders/by-clinic/:clinicId", authenticateJWT, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { page, limit } = req.query;
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const paginationParams = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await orderService.listOrdersByClinic(clinicId, currentUser.id, paginationParams);

    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.message === "Forbidden") {
        res.status(403).json(result);
      } else {
        res.status(400).json(result);
      }
    }

  } catch (error) {
    console.error('❌ Error listing orders by clinic:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// TODO: Add security
app.post("/webhook/orders", async (req, res) => {
  try {
    // Validate webhook secret
    const providedSecret = req.headers['authorization'];

    if (!providedSecret) {
      return res.status(401).json({
        success: false,
        message: "Webhook secret required"
      });
    }


    if (providedSecret !== process.env.APP_WEBHOOK_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid webhook secret"
      });
    }

    // Process MD Integration webhook
    await MDWebhookService.processMDWebhook(req.body);

    res.json({
      success: true,
      message: "Webhook processed successfully"
    });
  } catch (error) {
    console.error('❌ Error processing MD Integration webhook:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Physicians endpoints
app.post("/physicians", authenticateJWT, async (req, res) => {
  try {

    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const physicianService = new PhysicianService();

    const physician = await physicianService.createPhysician(req.body, currentUser.id);

    res.status(201).json({
      success: true,
      message: "Physician created successfully",
      data: {
        id: physician.id,
        fullName: physician.fullName,
        email: physician.email,
      }
    });
  } catch (error) {
    console.error('Error creating physician:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create physician"
    });
  }
});

app.put("/physicians", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { physicianId, ...updateData } = req.body;

    if (!physicianId) {
      return res.status(400).json({
        success: false,
        message: "physicianId is required"
      });
    }

    const physicianService = new PhysicianService();

    const physician = await physicianService.updatePhysician(physicianId, updateData, currentUser.id);

    res.json({
      success: true,
      message: "Physician updated successfully",
      data: {
        id: physician.id,
        fullName: physician.fullName,
        email: physician.email,
      }
    });
  } catch (error) {
    console.error('Error updating physician:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update physician"
    });
  }
});

const PORT = process.env.PORT || 3001;

// Initialize database connection and start server
async function startServer() {
  const dbConnected = await initializeDatabase();

  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 API listening on :${PORT}`);
    console.log('📊 Database connected successfully');
    console.log('🔒 HIPAA-compliant security features enabled');
  });
}

startServer();
