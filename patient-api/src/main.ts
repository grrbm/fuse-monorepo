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
import BrandSubscription, { BrandSubscriptionStatus } from "./models/BrandSubscription";
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
import MDFilesService from "./services/mdIntegration/MDFiles.service";
import PharmacyWebhookService from "./services/pharmacy/webhook";
import BrandSubscriptionService from "./services/brandSubscription.service";
import MessageService from "./services/Message.service";
import BrandTreatment from "./models/BrandTreatment";
import Questionnaire from "./models/Questionnaire";

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
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP images, and PDF files are allowed.'));
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
      // Allow fuse.health root domain and any subdomain (e.g., https://limitless.fuse.health)
      (process.env.NODE_ENV === 'production' && /^https:\/\/([a-zA-Z0-9-]+\.)*fuse\.health$/.test(origin)) ||
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
    const { firstName, lastName, email, password, role, dateOfBirth, phoneNumber, clinicName, clinicId, website, businessType } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate clinic name for providers/brands (both require clinics)
    if ((role === 'provider' || role === 'brand') && !clinicName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Clinic name is required for providers and brand users"
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
    if ((role === 'provider' || role === 'brand') && clinicName && !clinicId) {
      console.log('🏥 Creating clinic with name:', clinicName);

      // Generate unique slug
      const slug = await generateUniqueSlug(clinicName.trim());

      clinic = await Clinic.create({
        name: clinicName.trim(),
        slug: slug,
        logo: '', // Default empty logo, can be updated later
        businessType: businessType || null,
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
    console.log('🚀 Creating new user with data:', { firstName, lastName, email, role: mappedRole, dob: dateOfBirth, phoneNumber, website, finalClinicId });
    const user = await User.createUser({
      firstName,
      lastName,
      email,
      password,
      role: mappedRole,
      dob: dateOfBirth,
      phoneNumber,
      website,
      businessType,
    });

    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.log('🧪 Development mode detected: auto-activating new user');
      await user.update({
        activated: true,
        activationToken: null,
        activationTokenExpiresAt: null,
      });
    }

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

    const { firstName, lastName, phoneNumber, dob, address, city, state, zipCode, selectedPlanCategory, selectedPlanType, selectedPlanName, selectedPlanPrice, selectedDownpaymentType, selectedDownpaymentName, selectedDownpaymentPrice, planSelectionTimestamp } = req.body;

    // Check if this is a plan selection request (doesn't require firstName/lastName)
    const isPlanSelection = selectedPlanCategory && selectedPlanType;

    // HIPAA Compliance: Validate required fields for profile updates
    if (!isPlanSelection && (!firstName || !lastName)) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required for profile updates"
      });
    }

    // Find user in database
    const user = await User.findByPk(currentUser.id, {
      include: [Clinic],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prepare update data based on what's being updated
    const updateData: any = {};

    // Update profile fields if provided
    if (firstName && lastName) {
      updateData.firstName = firstName.trim();
      updateData.lastName = lastName.trim();
    }

    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber?.trim() || null;
    if (dob !== undefined) updateData.dob = dob?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (state !== undefined) updateData.state = state?.trim() || null;
    if (zipCode !== undefined) updateData.zipCode = zipCode?.trim() || null;

    // Update plan selection fields if provided
    if (selectedPlanCategory !== undefined) updateData.selectedPlanCategory = selectedPlanCategory?.trim() || null;
    if (selectedPlanType !== undefined) updateData.selectedPlanType = selectedPlanType?.trim() || null;
    if (selectedPlanName !== undefined) updateData.selectedPlanName = selectedPlanName?.trim() || null;
    if (selectedPlanPrice !== undefined) updateData.selectedPlanPrice = selectedPlanPrice || null;
    if (selectedDownpaymentType !== undefined) updateData.selectedDownpaymentType = selectedDownpaymentType?.trim() || null;
    if (selectedDownpaymentName !== undefined) updateData.selectedDownpaymentName = selectedDownpaymentName?.trim() || null;
    if (selectedDownpaymentPrice !== undefined) updateData.selectedDownpaymentPrice = selectedDownpaymentPrice || null;
    if (planSelectionTimestamp !== undefined) updateData.planSelectionTimestamp = planSelectionTimestamp ? new Date(planSelectionTimestamp) : null;

    // Update user with the prepared data
    await user.update(updateData);

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

    // Support special virtual id "new" so the admin UI can preload defaults without hitting the DB
    if (id === "new") {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

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
app.post("/orders/create-payment-intent", authenticateJWT, async (req, res) => {
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

    console.log('🚀 BACKEND CREATE: Looking up plan type:', planType)
    const selectedPlan = await BrandSubscriptionPlans.getPlanByType(planType as any);
    console.log('🚀 BACKEND CREATE: Plan found:', selectedPlan?.id, selectedPlan?.planType)

    // Debug: List all available plans
    const allPlans = await BrandSubscriptionPlans.findAll({ attributes: ['planType', 'name'] })
    console.log('🚀 BACKEND CREATE: All available plans:', allPlans.map(p => ({ type: p.planType, name: p.name })))

    if (!selectedPlan) {
      console.error('❌ BACKEND CREATE: Invalid plan type:', planType)
      console.error('❌ BACKEND CREATE: Available types:', allPlans.map(p => p.planType))
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

// Create payment intent for direct card processing
app.post("/create-payment-intent", authenticateJWT, async (req, res) => {
  try {
    console.log('🚀 BACKEND CREATE: Payment intent creation called')
    console.log('🚀 BACKEND CREATE: Request body:', JSON.stringify(req.body, null, 2))

    const currentUser = getCurrentUser(req);
    const { planType, amount, currency, upgrade } = req.body;

    console.log('🚀 BACKEND CREATE: Plan type received:', planType)
    console.log('🚀 BACKEND CREATE: Current user:', currentUser?.id, currentUser?.role)

    if (currentUser?.role !== 'brand') {
      console.error('❌ BACKEND CREATE: Access denied - not brand role')
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    // If this is a new subscription (not an upgrade), block when already active
    if (!upgrade) {
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
    }

    console.log('🚀 BACKEND CREATE: Looking up plan type:', planType)
    const selectedPlan = await BrandSubscriptionPlans.getPlanByType(planType as any);
    console.log('🚀 BACKEND CREATE: Plan found:', selectedPlan?.id, selectedPlan?.planType)

    // Debug: List all available plans
    const allPlans = await BrandSubscriptionPlans.findAll({ attributes: ['planType', 'name'] })
    console.log('🚀 BACKEND CREATE: All available plans:', allPlans.map(p => ({ type: p.planType, name: p.name })))

    if (!selectedPlan) {
      console.error('❌ BACKEND CREATE: Invalid plan type:', planType)
      console.error('❌ BACKEND CREATE: Available types:', allPlans.map(p => p.planType))
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
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
          role: user.role,
          planType: planType
        }
      });
      await user.update({
        stripeCustomerId: stripeCustomer.id
      })
      stripeCustomerId = stripeCustomer.id
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      customer: stripeCustomerId,
      metadata: {
        userId: currentUser.id,
        planType: planType,
        amount: amount.toString()
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      setup_future_usage: 'off_session',
      receipt_email: user.email || undefined,
      description: `${selectedPlan.name} down payment`
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent"
    });
  }
});

// Confirm payment intent with payment method
app.post("/confirm-payment-intent", authenticateJWT, async (req, res) => {
  try {
    console.log('🚀 BACKEND: Confirm payment intent called')
    console.log('🚀 BACKEND: Request headers:', JSON.stringify(req.headers, null, 2))
    console.log('🚀 BACKEND: Request body:', JSON.stringify(req.body, null, 2))

    const currentUser = getCurrentUser(req);
    const { paymentMethodId, planType, planCategory, downpaymentPlanType, amount, currency } = req.body;

    console.log('🚀 BACKEND: Extracted data:', { paymentMethodId, planType, planCategory, downpaymentPlanType, amount, currency })
    console.log('🚀 BACKEND: Current user:', currentUser?.id, currentUser?.role)

    if (currentUser?.role !== 'brand') {
      console.error('❌ BACKEND: Access denied - not brand role')
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    console.log('🚀 BACKEND: Getting plan and user data...')
    console.log('🚀 BACKEND: Plan type received:', planType)
    // Get the payment intent that was created earlier
    // In a real implementation, you'd store the payment intent ID in the session
    // For now, we'll create a new payment intent for confirmation
    const selectedPlan = await BrandSubscriptionPlans.getPlanByType(planType as any);
    console.log('🚀 BACKEND: Selected plan:', selectedPlan?.id)
    console.log('🚀 BACKEND: Available plan types:', await BrandSubscriptionPlans.findAll({ attributes: ['planType'] }))

    if (!selectedPlan) {
      console.error('❌ BACKEND: Invalid plan type:', planType)
      return res.status(400).json({
        success: false,
        message: "Invalid plan type"
      });
    }

    // Get full user data from database
    const user = await User.findByPk(currentUser.id);
    console.log('🚀 BACKEND: User found:', user?.id, user?.email)

    if (!user) {
      console.error('❌ BACKEND: User not found:', currentUser.id)
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create or retrieve Stripe customer
    console.log('🚀 BACKEND: Creating/retrieving Stripe customer...')
    let stripeCustomer;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });
      console.log('🚀 BACKEND: Customers found:', customers.data.length)

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
        console.log('🚀 BACKEND: Using existing customer:', stripeCustomer.id)
      } else {
        console.log('🚀 BACKEND: Creating new customer...')
        stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
            role: user.role,
            planType: planType
          }
        });
        console.log('🚀 BACKEND: Created customer:', stripeCustomer.id)
      }
    } catch (stripeError) {
      console.error('❌ BACKEND: Error with Stripe customer:', stripeError);
      return res.status(500).json({
        success: false,
        message: "Failed to create Stripe customer"
      });
    }

    // Create Stripe subscription instead of one-time payment
    console.log('🚀 BACKEND: Creating Stripe subscription...')
    console.log('🚀 BACKEND: Plan type:', planType)
    console.log('🚀 BACKEND: Customer ID:', stripeCustomer.id)
    console.log('🚀 BACKEND: Payment method ID:', paymentMethodId)

    // Get the price ID for the selected plan
    const priceId = selectedPlan.stripePriceId
    console.log('🚀 BACKEND: Using price ID:', priceId)

    // Create Stripe subscription schedule to handle introductory pricing
    console.log('🚀 BACKEND: Preparing subscription schedule with introductory pricing...')

    const introductoryPlanType = downpaymentPlanType || (planCategory === 'professional' ? 'downpayment_professional' : 'downpayment_standard')
    const introductoryPlan = await BrandSubscriptionPlans.getPlanByType(introductoryPlanType as any)

    if (!introductoryPlan) {
      console.error('❌ BACKEND: Introductory plan not found:', introductoryPlanType)
      return res.status(500).json({
        success: false,
        message: "Introductory pricing plan is not configured"
      });
    }

    console.log('🚀 BACKEND: Introductory plan price ID:', introductoryPlan.stripePriceId)

    // Attach payment method to customer first
    console.log('🚀 BACKEND: Attaching payment method to customer...')
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer.id,
    });
    console.log('🚀 BACKEND: Payment method attached successfully')

    // Ensure customer has default payment method set for future invoices
    await stripe.customers.update(stripeCustomer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    console.log('🚀 BACKEND: Creating Stripe subscription schedule...')
    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: stripeCustomer.id,
      start_date: 'now',
      metadata: {
        userId: currentUser.id,
        planType,
        planCategory: planCategory || 'standard',
        introductoryPlanType: introductoryPlan.planType
      },
      default_settings: {
        default_payment_method: paymentMethodId,
        collection_method: 'charge_automatically'
      },
      phases: [
        {
          items: [{ price: introductoryPlan.stripePriceId, quantity: 1 }],
          iterations: 1
        },
        {
          items: [{ price: priceId, quantity: 1 }]
        }
      ],
      expand: ['subscription', 'subscription.latest_invoice', 'subscription.latest_invoice.payment_intent']
    });

    console.log('🚀 BACKEND: Subscription schedule created:', subscriptionSchedule.id, 'Status:', subscriptionSchedule.status)

    let subscription: any = (subscriptionSchedule as any).subscription;
    if (!subscription) {
      console.log('⚠️ BACKEND: Subscription not present on schedule response, retrieving separately...')
      if (subscriptionSchedule.subscription) {
        subscription = await stripe.subscriptions.retrieve(subscriptionSchedule.subscription as string, {
          expand: ['latest_invoice.payment_intent']
        });
      } else {
        const refreshedSchedule = await stripe.subscriptionSchedules.retrieve(subscriptionSchedule.id, {
          expand: ['subscription']
        });
        const scheduleSubscription = (refreshedSchedule as any).subscription;
        if (scheduleSubscription?.id) {
          subscription = await stripe.subscriptions.retrieve(scheduleSubscription.id, {
            expand: ['latest_invoice.payment_intent']
          });
        }
      }
    }

    if (!subscription) {
      console.error('❌ BACKEND: Unable to retrieve subscription created by schedule');
      return res.status(500).json({
        success: false,
        message: "Failed to create subscription"
      });
    }

    console.log('🚀 BACKEND: Subscription created:', subscription.id, 'Status:', subscription.status)

    // Derive current period timestamps if available
    const currentPeriodStartUnix = (subscription as any)?.current_period_start
    const currentPeriodEndUnix = (subscription as any)?.current_period_end
    const currentPeriodStartDate = currentPeriodStartUnix ? new Date(currentPeriodStartUnix * 1000) : null
    const currentPeriodEndDate = currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null

    const planFeatures = selectedPlan.getFeatures()
    const combinedFeatures = {
      ...planFeatures,
      subscriptionSchedule: {
        id: subscriptionSchedule.id,
        introductoryPlanType: introductoryPlan.planType,
        introductoryStripePriceId: introductoryPlan.stripePriceId,
        introductoryMonthlyPrice: introductoryPlan.monthlyPrice,
      }
    }

    // Create BrandSubscription record
    try {
      const brandSub = await BrandSubscription.create({
        userId: currentUser.id,
        planType: planType as any,
        planCategory: planCategory || null,
        status: BrandSubscriptionStatus.ACTIVE,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: stripeCustomer.id,
        stripePriceId: priceId,
        monthlyPrice: selectedPlan.monthlyPrice,
        downpaymentAmount: introductoryPlan.monthlyPrice,
        currentPeriodStart: currentPeriodStartDate ?? undefined,
        currentPeriodEnd: currentPeriodEndDate ?? undefined,
        features: combinedFeatures
      });
      console.log('✅ BrandSubscription record created:', brandSub.id)
    } catch (dbError) {
      console.error('❌ Error creating BrandSubscription record:', dbError)
      // Don't fail the whole request if DB creation fails
    }

    res.status(200).json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: (subscription as any).latest_invoice?.payment_intent?.client_secret,
      requiresAction: subscription.status === 'incomplete',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: (subscription as any).current_period_start,
        current_period_end: (subscription as any).current_period_end,
        stripePriceId: priceId
      }
    });

  } catch (error) {
    console.error('❌ BACKEND: Error confirming payment intent:', error);
    console.error('❌ BACKEND: Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ BACKEND: Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment intent"
    });
  }
});

// Onboarding add-ons are handled separately, no combined checkout needed
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

// Change brand subscription plan
app.post("/brand-subscriptions/change", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { newPlanId } = req.body;

    if (!newPlanId) {
      return res.status(400).json({
        success: false,
        message: "New plan ID is required"
      });
    }

    // Instantiate service
    const brandSubscriptionService = new BrandSubscriptionService();

    // Upgrade the subscription
    const result = await brandSubscriptionService.upgradeSubscription(currentUser.id, newPlanId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Error changing brand subscription:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
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

    // Validate webhook signature using HMAC SHA256
    const providedSignature = req.headers['signature'];

    if (!providedSignature) {
      return res.status(401).json({
        success: false,
        message: "Webhook signature required"
      });
    }

    if (!process.env.APP_WEBHOOK_SECRET) {
      console.error('APP_WEBHOOK_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    // Verify signature using MDWebhookService
    const isValidSignature = MDWebhookService.verifyWebhookSignature(
      providedSignature as string,
      req.body,
      process.env.APP_WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      return res.status(403).json({
        success: false,
        message: "Invalid webhook signature"
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

// Pharmacy webhook endpoint
app.post("/webhook/pharmacy", async (req, res) => {
  try {
    // Validate Authorization header with Bearer token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header required"
      });
    }

    if (!process.env.APP_WEBHOOK_SECRET) {
      console.error('APP_WEBHOOK_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    // Extract Bearer token
    const expectedAuth = `Bearer ${process.env.APP_WEBHOOK_SECRET}`;

    if (authHeader !== expectedAuth) {
      return res.status(403).json({
        success: false,
        message: "Invalid authorization token"
      });
    }

    // Process pharmacy webhook
    await PharmacyWebhookService.processPharmacyWebhook(req.body);

    res.json({
      success: true,
      message: "Pharmacy webhook processed successfully"
    });
  } catch (error) {
    console.error('❌ Error processing pharmacy webhook:', error);
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

// Message endpoints
app.get("/messages", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    const { page = 1, per_page = 15 } = req.query;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const params = {
      page: parseInt(page as string),
      per_page: parseInt(per_page as string),
    };

    const messages = await MessageService.getMessagesByUserId(currentUser.id, params);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch messages"
    });
  }
});

app.post("/messages", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    const { text, reference_message_id, files } = req.body;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const payload = {
      channel: 'patient',
      text,
      reference_message_id,
      files
    };

    const message = await MessageService.createMessageForUser(currentUser.id, payload);

    res.json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send message"
    });
  }
});

app.post("/messages/:messageId/read", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required"
      });
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }



    await MessageService.markMessageAsReadForUser(currentUser.id, messageId);

    res.json({
      success: true,
      message: "Message marked as read"
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark message as read"
    });
  }
});

app.delete("/messages/:messageId/read", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required"
      });
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }



    await MessageService.markMessageAsUnreadForUser(currentUser.id, messageId);

    res.json({
      success: true,
      message: "Message marked as unread"
    });
  } catch (error) {
    console.error('Error marking message as unread:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark message as unread"
    });
  }
});

// MD Files endpoints
app.post("/md-files", authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided"
      });
    }

    const file = await MDFilesService.createFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: file
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload file"
    });
  }
});

app.get("/md-files/:fileId", authenticateJWT, async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required"
      });
    }

    const file = await MDFilesService.getFile(fileId);

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch file"
    });
  }
});

app.get("/md-files/:fileId/download", authenticateJWT, async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required"
      });
    }

    // Get file metadata first
    const fileInfo = await MDFilesService.getFile(fileId);

    // Download file content
    const fileBuffer = await MDFilesService.downloadFile(fileId);

    res.set({
      'Content-Type': fileInfo.mime_type,
      'Content-Disposition': `attachment; filename="${fileInfo.name}"`
    });

    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to download file"
    });
  }
});

app.delete("/md-files/:fileId", authenticateJWT, async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required"
      });
    }

    await MDFilesService.deleteFile(fileId);

    res.json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete file"
    });
  }
});

// Settings page endpoints
// Get organization/clinic data
app.get("/organization", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id, {
      include: [{ model: Clinic, as: 'clinic' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const clinic = user.clinic;

    res.json({
      clinicName: clinic?.name || '',
      businessName: clinic?.name || '',
      businessType: user.businessType || clinic?.businessType || '',
      website: user.website || '',
      phone: user.phoneNumber || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      logo: clinic?.logo || ''
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update organization/clinic data
app.put("/organization/update", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { businessName, phone, address, city, state, zipCode, website } = req.body;

    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update user fields (User model has phoneNumber, address, city, state, zipCode, website)
    await user.update({
      phoneNumber: phone || user.phoneNumber,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      website: website !== undefined ? website : user.website
    });

    // Update clinic name if exists (Clinic only has name, slug, logo, active, status)
    if (user.clinicId && businessName) {
      const clinic = await Clinic.findByPk(user.clinicId);
      if (clinic) {
        await clinic.update({
          name: businessName
        });
      }
    }

    res.json({ success: true, message: "Organization updated successfully" });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Upload logo endpoint
app.post("/upload/logo", authenticateJWT, upload.single('logo'), async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Upload to S3
    const s3Url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'clinic-logos',
      'logo'
    );

    // Update clinic logo
    const user = await User.findByPk(currentUser.id);
    if (user && user.clinicId) {
      const clinic = await Clinic.findByPk(user.clinicId);
      if (clinic) {
        // Delete old logo if exists
        if (clinic.logo) {
          try {
            await deleteFromS3(clinic.logo);
          } catch (error) {
            console.error('Error deleting old logo:', error);
          }
        }

        await clinic.update({ logo: s3Url });
      }
    }

    res.json({ success: true, url: s3Url, message: "Logo uploaded successfully" });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ success: false, message: "Failed to upload logo" });
  }
});

// Get current subscription
app.get("/subscriptions/current", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const subscription = await BrandSubscription.findOne({
      where: { userId: currentUser.id },
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return res.json(null);
    }

    // Get plan details separately
    const plan = await BrandSubscriptionPlans.findOne({
      where: { planType: subscription.planType }
    });

    res.json({
      id: subscription.id,
      planId: plan?.id || null,
      status: subscription.status,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      plan: plan ? {
        name: plan.name,
        price: Number(plan.monthlyPrice),
        type: plan.planType
      } : subscription.stripePriceId ? {
        name: subscription.planType,
        price: subscription.monthlyPrice ? Number(subscription.monthlyPrice) : 0,
        type: subscription.planType,
        priceId: subscription.stripePriceId
      } : null,
      nextBillingDate: subscription.currentPeriodEnd || null
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get available plans
app.get("/plans", authenticateJWT, async (req, res) => {
  try {
    const plans = await BrandSubscriptionPlans.findAll({
      where: { isActive: true },
      order: [["sortOrder", "ASC"]]
    });

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: Number(plan.monthlyPrice),
      planType: plan.planType,
      stripePriceId: plan.stripePriceId,
      features: plan.getFeatures()
    }));

    res.json({ success: true, plans: formattedPlans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update user profile
app.put("/users/profile", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { firstName, lastName, phone, currentPassword, newPassword } = req.body;

    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If password change requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }

      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ passwordHash: hashedPassword });
    }

    // Update other fields
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phoneNumber: phone || user.phoneNumber
    });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

app.post("/brand-subscriptions/test-upgrade-high-definition", async (req, res) => {
  try {
    const { stripeSubscriptionId, nextPriceId } = req.body;

    if (!stripeSubscriptionId || typeof stripeSubscriptionId !== 'string') {
      return res.status(400).json({ success: false, message: "stripeSubscriptionId is required" });
    }

    const brandSub = await BrandSubscription.findOne({
      where: {
        stripeSubscriptionId
      }
    });

    if (!brandSub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const scheduleMetadata = (brandSub.features as any)?.subscriptionSchedule;
    const scheduleId: string | undefined = scheduleMetadata?.id;

    if (!scheduleId) {
      return res.status(400).json({ success: false, message: "Subscription schedule not found for this subscription" });
    }

    const highDefinitionPlan = await BrandSubscriptionPlans.getPlanByType('high-definition');
    if (!highDefinitionPlan) {
      return res.status(500).json({ success: false, message: "High Definition plan is not configured" });
    }

    const overridePriceId = typeof nextPriceId === 'string' && nextPriceId.trim().length > 0
      ? nextPriceId.trim()
      : undefined;
    const targetPriceId = overridePriceId || highDefinitionPlan.stripePriceId;

    const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);

    const phases: Stripe.SubscriptionScheduleUpdateParams.Phase[] = (schedule.phases || []).map((phase, index, arr) => {
      const phaseAny = phase as any;
      const items = (phase.items || []).map(item => {
        const itemAny = item as any;
        const desiredPriceId = index === arr.length - 1
          ? targetPriceId
          : (typeof itemAny.price === 'string' ? itemAny.price : itemAny.price?.id);

        if (!desiredPriceId) {
          throw new Error('Unable to determine price for subscription schedule phase');
        }

        return {
          price: desiredPriceId,
          quantity: itemAny.quantity ?? 1
        };
      });

      const phaseUpdate: Stripe.SubscriptionScheduleUpdateParams.Phase = {
        items
      };

      if (typeof phaseAny.iterations === 'number') {
        phaseUpdate.iterations = phaseAny.iterations;
      } else if (phaseAny.end_date) {
        phaseUpdate.end_date = phaseAny.end_date;
      }

      if (index < arr.length - 1 && !phaseUpdate.iterations && !phaseUpdate.end_date) {
        phaseUpdate.iterations = 1;
      }

      if (phaseAny.start_date && !phaseUpdate.start_date) {
        phaseUpdate.start_date = phaseAny.start_date;
      }

      if (phaseAny.proration_behavior) {
        phaseUpdate.proration_behavior = phaseAny.proration_behavior;
      }

      if (phaseAny.collection_method) {
        phaseUpdate.collection_method = phaseAny.collection_method;
      }

      if (phaseAny.billing_thresholds) {
        phaseUpdate.billing_thresholds = phaseAny.billing_thresholds;
      }

      if (phaseAny.invoice_settings) {
        phaseUpdate.invoice_settings = phaseAny.invoice_settings;
      }

      if (phaseAny.trial) {
        phaseUpdate.trial = phaseAny.trial;
      }

      if (phaseAny.currency) {
        phaseUpdate.currency = phaseAny.currency;
      }

      return phaseUpdate;
    });

    if (phases.length === 0) {
      return res.status(400).json({ success: false, message: "Subscription schedule has no phases to update" });
    }

    await stripe.subscriptionSchedules.update(scheduleId, {
      phases,
      proration_behavior: 'none'
    });

    const updatedSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const updatedSubData = updatedSubscription as any;

    const updatedPeriodStart = updatedSubData?.current_period_start ? new Date(updatedSubData.current_period_start * 1000) : brandSub.currentPeriodStart;
    const updatedPeriodEnd = updatedSubData?.current_period_end ? new Date(updatedSubData.current_period_end * 1000) : brandSub.currentPeriodEnd;

    const existingFeatures = (brandSub.features as any) || {};
    const subscriptionScheduleFeature = existingFeatures.subscriptionSchedule || {};
    const planFeatures = highDefinitionPlan.getFeatures();

    const updatedFeatures = {
      ...existingFeatures,
      ...planFeatures,
      subscriptionSchedule: {
        ...subscriptionScheduleFeature,
        id: scheduleId,
        introductoryPlanType: subscriptionScheduleFeature.introductoryPlanType,
        introductoryStripePriceId: subscriptionScheduleFeature.introductoryStripePriceId,
        introductoryMonthlyPrice: subscriptionScheduleFeature.introductoryMonthlyPrice,
        nextPlanType: 'high-definition',
        nextStripePriceId: targetPriceId
      }
    };

    await brandSub.update({
      planType: 'high-definition',
      stripePriceId: targetPriceId,
      monthlyPrice: highDefinitionPlan.monthlyPrice,
      currentPeriodStart: updatedPeriodStart ?? null,
      currentPeriodEnd: updatedPeriodEnd ?? null,
      features: updatedFeatures
    });

    const user = await User.findByPk(brandSub.userId);
    if (user?.email) {
      const plainMessage = `Hello ${user.firstName || ''},\n\nThis is a confirmation that your Fuse subscription will move to the High Definition plan starting with your next billing cycle. You will be billed $${Number(highDefinitionPlan.monthlyPrice).toFixed(2)} per month going forward.\n\nIf you have any questions, please reach out to our support team.\n\nBest regards,\nThe Fuse Team`;

      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Upcoming Plan Upgrade</h1>
          </div>
          <div style="padding: 32px; background-color: #f9fafb;">
            <p style="color: #111827; font-size: 16px; line-height: 1.6;">Hello ${user.firstName || ''},</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We're letting you know that your Fuse subscription will upgrade to the <strong>High Definition</strong> plan at the start of your next billing cycle.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              The new plan will be billed at <strong>$${Number(highDefinitionPlan.monthlyPrice).toFixed(2)} per month</strong> and unlocks the following benefits:
            </p>
            <ul style="color: #374151; font-size: 16px; line-height: 1.6; margin-left: 20px;">
              <li>Priority customer support</li>
              <li>Up to 200 products and 20 campaigns</li>
              <li>Advanced analytics access</li>
            </ul>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              If you have any questions or would like help optimizing the new features, please contact our support team any time.
            </p>
          </div>
          <div style="background-color: #111827; padding: 20px; text-align: center;">
            <p style="color: #e5e7eb; margin: 0; font-size: 14px;">Best regards,<br />The Fuse Team</p>
          </div>
        </div>
      `;

      await MailsSender.sendEmail({
        to: user.email,
        subject: 'Your Fuse plan will upgrade to High Definition next month',
        text: plainMessage,
        html: htmlMessage
      });
    }

    res.status(200).json({
      success: true,
      scheduleId,
      updatedPlanType: 'high-definition'
    });
  } catch (error) {
    console.error('❌ Error scheduling High Definition upgrade:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule High Definition upgrade' });
  }
});

app.get("/brand-treatments", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id, {
      include: [Clinic],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "brand") {
      return res.status(403).json({ success: false, message: "Access denied. Brand role required." });
    }

    const clinicSlug = user.clinic?.slug || null;

    const [treatments, selections] = await Promise.all([
      Treatment.findAll({
        order: [["name", "ASC"]],
      }),
      BrandTreatment.findAll({
        where: { userId: user.id },
      }),
    ]);

    const selectionMap = new Map(
      selections.map((bt) => [bt.treatmentId, bt])
    );

    const data = treatments.map((treatment) => {
      const selection = selectionMap.get(treatment.id);
      return {
        id: treatment.id,
        name: treatment.name,
        treatmentLogo: treatment.treatmentLogo,
        active: treatment.active,
        selected: Boolean(selection),
        brandLogo: selection?.brandLogo || null,
        brandColor: selection?.brandColor || null,
        clinicSlug,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error fetching brand treatments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brand treatments" });
  }
});

app.post("/brand-treatments", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "brand") {
      return res.status(403).json({ success: false, message: "Access denied. Brand role required." });
    }

    const { treatmentId, brandLogo, brandColor } = req.body;

    if (!treatmentId) {
      return res.status(400).json({ success: false, message: "treatmentId is required" });
    }

    const treatment = await Treatment.findByPk(treatmentId);

    if (!treatment) {
      return res.status(404).json({ success: false, message: "Treatment not found" });
    }

    const [record, created] = await BrandTreatment.findOrCreate({
      where: { userId: user.id, treatmentId },
      defaults: {
        userId: user.id,
        treatmentId,
        brandLogo: brandLogo || null,
        brandColor: brandColor || null,
      },
    });

    if (!created) {
      record.brandLogo = brandLogo ?? record.brandLogo;
      record.brandColor = brandColor ?? record.brandColor;
      await record.save();
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("❌ Error saving brand treatment:", error);
    res.status(500).json({ success: false, message: "Failed to save brand treatment" });
  }
});

app.delete("/brand-treatments", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "brand") {
      return res.status(403).json({ success: false, message: "Access denied. Brand role required." });
    }

    const { treatmentId } = req.body;

    if (!treatmentId) {
      return res.status(400).json({ success: false, message: "treatmentId is required" });
    }

    const deleted = await BrandTreatment.destroy({
      where: { userId: user.id, treatmentId },
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Brand treatment not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error removing brand treatment:", error);
    res.status(500).json({ success: false, message: "Failed to remove brand treatment" });
  }
});

app.get("/brand-treatments/published", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id, {
      include: [Clinic],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== 'brand') {
      return res.status(403).json({ success: false, message: "Access denied. Brand role required." });
    }

    const selections = await BrandTreatment.findAll({
      where: { userId: user.id },
      include: [
        {
          model: Treatment,
          include: [
            {
              model: Questionnaire,
              attributes: ['id', 'title', 'description'],
            },
          ],
        },
      ],
    });

    const data = selections
      .filter((selection) => Boolean(selection.treatment))
      .map((selection) => {
        const treatment = selection.treatment!;
        const slug = treatment.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        return {
          id: treatment.id,
          name: treatment.name,
          slug,
          treatmentLogo: selection.brandLogo || treatment.treatmentLogo || null,
          brandColor: selection.brandColor || null,
          questionnaireId: treatment.questionnaires?.[0]?.id || null,
          questionnaireTitle: treatment.questionnaires?.[0]?.title || null,
          questionnaireDescription: treatment.questionnaires?.[0]?.description || null,
          clinicSlug: user.clinic?.slug || null,
        };
      });

    const { slug } = req.query;

    if (typeof slug === 'string') {
      const match = data.find((item) => item.slug === slug);
      if (!match) {
        return res.status(404).json({ success: false, message: 'Offering not found' });
      }
      return res.status(200).json({ success: true, data: match });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Error fetching published brand treatments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch published treatments' });
  }
});

app.get("/public/brand-treatments/:clinicSlug/:slug", async (req, res) => {
  try {
    const { clinicSlug, slug } = req.params;

    const clinic = await Clinic.findOne({ where: { slug: clinicSlug } });

    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }

    const brandUser = await User.findOne({
      where: {
        clinicId: clinic.id,
        role: 'brand',
      },
    });

    if (!brandUser) {
      return res.status(404).json({ success: false, message: "Brand user not found for clinic" });
    }

    const selection = await BrandTreatment.findOne({
      where: {
        userId: brandUser.id,
      },
      include: [
        {
          model: Treatment,
          include: [
            {
              model: Questionnaire,
              attributes: ['id', 'title', 'description'],
            },
          ],
        },
      ],
    });

    if (!selection || !selection.treatment) {
      return res.status(404).json({ success: false, message: "Treatment not enabled for this brand" });
    }

    const treatment = selection.treatment;
    const computedSlug = (treatment.slug || treatment.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (computedSlug !== slug) {
      return res.status(404).json({ success: false, message: "Offering slug not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: treatment.id,
        name: treatment.name,
        slug: computedSlug,
        treatmentLogo: selection.brandLogo || treatment.treatmentLogo || null,
        brandColor: selection.brandColor || null,
        questionnaireId: treatment.questionnaires?.[0]?.id || null,
        questionnaireTitle: treatment.questionnaires?.[0]?.title || null,
        questionnaireDescription: treatment.questionnaires?.[0]?.description || null,
        clinicSlug: clinic.slug,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching public brand treatment:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch treatment' });
  }
});
