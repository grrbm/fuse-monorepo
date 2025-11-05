import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import multer from "multer";
import dns from "dns/promises";
import { initializeDatabase } from "./config/database";
import { MailsSender } from "./services/mailsSender";
import Treatment from "./models/Treatment";
import Product from "./models/Product";
import Order from "./models/Order";
import OrderItem from "./models/OrderItem";
import Payment from "./models/Payment";
import ShippingAddress from "./models/ShippingAddress";
import BrandSubscription, { BrandSubscriptionStatus } from "./models/BrandSubscription";
import BrandSubscriptionPlans from "./models/BrandSubscriptionPlans";
import Subscription from "./models/Subscription";
// import TenantProduct from "./models/TenantProduct";
import { createJWTToken, authenticateJWT, getCurrentUser, extractTokenFromHeader, verifyJWTToken } from "./config/jwt";
import { uploadToS3, deleteFromS3, isValidImageFile, isValidFileSize } from "./config/s3";
import Stripe from "stripe";
import OrderService from "./services/order.service";
import UserService from "./services/user.service";
import TreatmentService from "./services/treatment.service";
import PaymentService from "./services/payment.service";
import ClinicService from "./services/clinic.service";
import { processStripeWebhook } from "./services/stripe/webhook";
import TreatmentProducts from "./models/TreatmentProducts";
import TreatmentPlan, { BillingInterval } from "./models/TreatmentPlan";
import ShippingOrder from "./models/ShippingOrder";
import QuestionnaireService from "./services/questionnaire.service";
import formTemplateService from "./services/formTemplate.service";
import User from "./models/User";
import Clinic from "./models/Clinic";
import { Op } from "sequelize";
import QuestionnaireStepService from "./services/questionnaireStep.service";
import QuestionService from "./services/question.service";
import { StripeService } from "@fuse/stripe";
import {
  signInSchema,
  signUpSchema,
  updateProfileSchema,
  clinicUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  treatmentCreateSchema,
  treatmentUpdateSchema,
  treatmentPlanCreateSchema,
  treatmentPlanUpdateSchema,
  createPaymentIntentSchema,
  createProductSubscriptionSchema,
  treatmentSubscriptionSchema,
  clinicSubscriptionSchema,
  brandPaymentIntentSchema,
  upgradeSubscriptionSchema,
  cancelSubscriptionSchema,
  updateBrandSubscriptionFeaturesSchema,
  createQuestionnaireSchema,
  updateQuestionnaireSchema,
  questionnaireStepCreateSchema,
  questionnaireStepUpdateSchema,
  questionnaireStepOrderSchema,
  questionCreateSchema,
  questionUpdateSchema,
  questionOrderSchema,
  messageCreateSchema,
  patientUpdateSchema,
  brandTreatmentSchema,
  organizationUpdateSchema,
  updateSelectionSchema,
  // updateTenantProductPriceSchema,
  listProductsSchema,
} from "@fuse/validators";
import TreatmentPlanService from "./services/treatmentPlan.service";
import SubscriptionService from "./services/subscription.service";
import MDWebhookService from "./services/mdIntegration/MDWebhook.service";
import MDFilesService from "./services/mdIntegration/MDFiles.service";
import PharmacyWebhookService from "./services/pharmacy/webhook";
import BrandSubscriptionService from "./services/brandSubscription.service";
import MessageService from "./services/Message.service";
import ProductService from "./services/product.service";
import TenantProductForm from "./models/TenantProductForm";
import TenantProduct from "./models/TenantProduct";
// import QuestionnaireStep twice causes duplicate identifier; keep single import below
import Question from "./models/Question";
import QuestionOption from "./models/QuestionOption";
import { assignTemplatesSchema } from "./validators/formTemplates";
import BrandTreatment from "./models/BrandTreatment";
import Questionnaire from "./models/Questionnaire";
import QuestionnaireCustomization from "./models/QuestionnaireCustomization";
import TenantProductService from "./services/tenantProduct.service";
import QuestionnaireStep from "./models/QuestionnaireStep";
import DashboardService from "./services/dashboard.service";
import DoctorPatientChats from "./models/DoctorPatientChats";
import WebSocketService from "./services/websocket.service";

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

// Log Stripe env key suffixes for debugging
const lastChars = (val?: string, n = 6) => (val ? val.slice(-n) : 'MISSING');
const publishableSuffix = lastChars(process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const secretSuffix = lastChars(process.env.STRIPE_SECRET_KEY);
const brandSuffix = lastChars(process.env.STRIPE_BRAND_SUBSCRIPTION_PRODUCT_ID);
const stripeWebhookSuffix = lastChars(process.env.STRIPE_WEBHOOK_SECRET);
console.log('🔎 Stripe env suffixes', {
  STRIPE_PUBLISHABLE_KEY: publishableSuffix,
  STRIPE_SECRET_KEY: secretSuffix,
  STRIPE_BRAND_SUBSCRIPTION_PRODUCT_ID: brandSuffix,
  STRIPE_WEBHOOK_SECRET: stripeWebhookSuffix
});

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
      : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3030', 'http://3.140.178.30', 'https://unboundedhealth.xyz']; // Allow local frontends, your IP, and unboundedhealth.xyz during development

    // Check if origin is in allowed list or matches patterns
    const isAllowed = allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV === 'production' && /^https:\/\/app-\d+\.on-aptible\.com$/.test(origin)) ||
      // Allow clinic subdomains in development (e.g., g-health.localhost:3000, saboia.xyz.localhost:3000)
      (process.env.NODE_ENV === 'development' && /^http:\/\/[a-zA-Z0-9.-]+\.localhost:3000$/.test(origin)) ||
      // Allow production clinic domains (e.g., app.limitless.health, app.hims.com)
      (process.env.NODE_ENV === 'production' && /^https:\/\/app\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(origin)) ||
      // Allow fuse.health root domain and any subdomain (e.g., https://limitless.fuse.health)
      (process.env.NODE_ENV === 'production' && /^https:\/\/([a-zA-Z0-9-]+\.)*fuse\.health$/.test(origin)) ||
      // Allow any origin containing fusehealth.com (e.g., https://app.fusehealth.com, https://doctor.fusehealth.com)
      origin.includes('fusehealth.com') ||
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
  if (req.path === '/webhook/stripe' || req.path === '/md/webhooks') {
    next(); // Skip JSON parsing for webhook endpoints that need raw body
  } else {
    express.json()(req, res, next); // Apply JSON parsing for all other routes
  }
});

// Clone 'doctor' steps from master_template into a target questionnaire (preserve order)
app.post("/questionnaires/clone-doctor-from-master", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { questionnaireId } = req.body || {};
    if (!questionnaireId || typeof questionnaireId !== 'string') {
      return res.status(400).json({ success: false, message: "questionnaireId is required" });
    }

    // Find target questionnaire
    const target = await Questionnaire.findByPk(questionnaireId, {
      include: [{ model: QuestionnaireStep, as: 'steps' }],
    });
    if (!target) {
      return res.status(404).json({ success: false, message: "Target questionnaire not found" });
    }

    // If target already has doctor steps, do nothing
    const hasDoctorSteps = (target as any).steps?.some((s: any) => s.category === 'doctor');
    if (hasDoctorSteps) {
      return res.status(200).json({ success: true, message: 'Doctor steps already present' });
    }

    // Find master template (must be exactly one)
    const masters = await Questionnaire.findAll({
      where: { formTemplateType: 'master_template' },
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }]
      }],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
      ] as any,
    });

    if (masters.length !== 1) {
      return res.status(400).json({ success: false, message: 'There should be 1 and only 1 master_template questionnaire' });
    }

    const master = masters[0] as any;
    const doctorSteps = (master.steps || []).filter((s: any) => s.category === 'doctor');
    if (doctorSteps.length === 0) {
      return res.status(200).json({ success: true, message: 'No doctor steps found in master_template' });
    }

    // Determine offset to preserve order without collisions
    const existingMaxOrder = ((target as any).steps || []).reduce((max: number, s: any) => Math.max(max, s.stepOrder ?? 0), -1);
    const baseOffset = isFinite(existingMaxOrder) ? existingMaxOrder + 1 : 0;

    // Clone steps, questions, options
    for (const step of doctorSteps) {
      const clonedStep = await QuestionnaireStep.create({
        title: step.title,
        description: step.description,
        category: step.category,
        stepOrder: (step.stepOrder ?? 0) + baseOffset,
        questionnaireId: target.id,
      });

      for (const question of (step.questions || [])) {
        const clonedQuestion = await Question.create({
          questionText: question.questionText,
          answerType: question.answerType,
          questionSubtype: (question as any).questionSubtype,
          isRequired: question.isRequired,
          questionOrder: question.questionOrder,
          subQuestionOrder: (question as any).subQuestionOrder,
          conditionalLevel: (question as any).conditionalLevel,
          placeholder: question.placeholder,
          helpText: question.helpText,
          footerNote: (question as any).footerNote,
          conditionalLogic: (question as any).conditionalLogic,
          stepId: clonedStep.id,
        });

        if (question.options?.length) {
          await QuestionOption.bulkCreate(
            question.options.map((opt: any) => ({
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              optionOrder: opt.optionOrder,
              questionId: clonedQuestion.id,
            }))
          );
        }
      }
    }

    // Return updated questionnaire
    const updated = await Questionnaire.findByPk(target.id, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }]
      }],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
      ] as any,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Error cloning doctor steps from master_template:', error);
    return res.status(500).json({ success: false, message: 'Failed to clone doctor steps' });
  }
});

// Reset questionnaire steps to doctor steps from master_template (delete all, then clone doctor)
app.post("/questionnaires/reset-doctor-from-master", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { questionnaireId } = req.body || {};
    if (!questionnaireId || typeof questionnaireId !== 'string') {
      return res.status(400).json({ success: false, message: "questionnaireId is required" });
    }

    // Find all steps with questions/options for this questionnaire
    const steps = await QuestionnaireStep.findAll({
      where: { questionnaireId },
      include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }]
    });

    // Delete options, questions, then steps
    for (const step of steps) {
      for (const q of ((step as any).questions || [])) {
        if (q.options?.length) {
          await QuestionOption.destroy({ where: { questionId: q.id } });
        }
        await Question.destroy({ where: { id: q.id } });
      }
      await QuestionnaireStep.destroy({ where: { id: step.id } });
    }

    // Reuse clone logic by calling previous handler logic inline
    // Find master template
    const masters = await Questionnaire.findAll({
      where: { formTemplateType: 'master_template' },
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }]
      }],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
      ] as any,
    });

    if (masters.length !== 1) {
      return res.status(400).json({ success: false, message: 'There should be 1 and only 1 master_template questionnaire' });
    }

    const master = masters[0] as any;
    const doctorSteps = (master.steps || []).filter((s: any) => s.category === 'doctor');

    for (const step of doctorSteps) {
      const clonedStep = await QuestionnaireStep.create({
        title: step.title,
        description: step.description,
        category: step.category,
        stepOrder: step.stepOrder,
        questionnaireId,
      });

      for (const question of (step.questions || [])) {
        const clonedQuestion = await Question.create({
          questionText: question.questionText,
          answerType: question.answerType,
          questionSubtype: (question as any).questionSubtype,
          isRequired: question.isRequired,
          questionOrder: question.questionOrder,
          subQuestionOrder: (question as any).subQuestionOrder,
          conditionalLevel: (question as any).conditionalLevel,
          placeholder: question.placeholder,
          helpText: question.helpText,
          footerNote: (question as any).footerNote,
          conditionalLogic: (question as any).conditionalLogic,
          stepId: clonedStep.id,
        });

        if (question.options?.length) {
          await QuestionOption.bulkCreate(
            question.options.map((opt: any) => ({
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              optionOrder: opt.optionOrder,
              questionId: clonedQuestion.id,
            }))
          );
        }
      }
    }

    const updated = await Questionnaire.findByPk(questionnaireId, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }]
      }],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
      ] as any,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Error resetting and cloning doctor steps:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset and clone doctor steps' });
  }
});
// No session middleware needed for JWT

// Health check endpoint
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Auth routes
app.post("/auth/signup", async (req, res) => {
  try {
    const validation = signUpSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { firstName, lastName, email, password, role, dateOfBirth, phoneNumber, clinicName, clinicId, website, businessType } = validation.data;

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
    let clinic: any = null;
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
    // Validate request body
    const validation = signInSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.format()
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Validate password (permanent or temporary)
    const isValidPassword = await user.validateAnyPassword(password);
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

    // Validate request body using updateProfileSchema
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }


    const { firstName, lastName, phoneNumber, dob, address, city, state, zipCode,
      selectedPlanCategory, selectedPlanType, selectedPlanName, selectedPlanPrice,
      selectedDownpaymentType, selectedDownpaymentName, selectedDownpaymentPrice, planSelectionTimestamp } = validation.data;


    // Check if this is a plan selection request (doesn't require firstName/lastName)
    const isPlanSelection = selectedPlanCategory && selectedPlanType;

    // HIPAA Compliance: Validate required fields for profile updates
    if (!isPlanSelection && (!firstName || !lastName)) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required for profile updates"
      })
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
      attributes: ['id', 'name', 'slug', 'logo', 'defaultFormColor'] // Only return public fields
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

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

// Public: allow custom domain (placed before /clinic/:id to avoid param route capture)
app.get("/clinic/allow-custom-domain", async (req, res) => {
  try {
    // Unconditionally allow on-demand TLS issuance for testing/tools (curl/Postman/Caddy ask)
    // If you need to re-enable validation later, restore the DB lookup here.
    return res.status(200).send("ok");
  } catch {
    return res.status(200).send("ok");
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using clinicUpdateSchema
    const validation = clinicUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { name, logo } = validation.data;

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }


    const clinicId = req.params.clinicId;

    const productService = new ProductService();
    const result = await productService.getProductsByClinic(clinicId, currentUser.id);

    // Fetch full user to check role/clinic access
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!result.success) {
      const statusCode = result.message === "Access denied" ? 403 :
        result.message === "User not found" ? 401 : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.message,
        error: result.error
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

    // Fetch products associated to treatments belonging to this clinic
    const clinicProducts = await Product.findAll({
      include: [
        {
          model: Treatment,
          as: 'treatments',
          where: { clinicId },
          through: { attributes: [] },
          attributes: ['id', 'name'],
        }
      ],
      order: [['name', 'ASC']]
    });

    console.log(`✅ Found ${clinicProducts.length} products linked to treatments for clinic ${clinicId}`);

    // Build base list from clinic-linked products
    const baseProducts = clinicProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price as any) : product.price,
      pharmacyProductId: product.pharmacyProductId,
      dosage: product.dosage,
      imageUrl: product.imageUrl,
      active: (product as any).isActive ?? true,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      treatments: (product as any).treatments || []
    }));

    // Map tenant overrides by productId (price, tenantProductId)
    const overrides = new Map<string, { price?: number; tenantProductId?: string }>();
    for (const item of (result.items || [])) {
      const productId = item.product?.id;
      if (productId) {
        overrides.set(productId, {
          price: typeof item.tenantProductPrice === 'string' ? parseFloat(item.tenantProductPrice as any) : item.tenantProductPrice,
          tenantProductId: item.tenantProductId
        });
      }
    }

    // Apply overrides where available, keep others as base
    const mergedProducts = baseProducts.map(p => {
      const o = overrides.get(p.id);
      if (o) {
        return {
          ...p,
          price: o.price ?? p.price,
          tenantProductId: o.tenantProductId
        } as any;
      }
      return p as any;
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: mergedProducts
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
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Support special virtual id "new" so the admin UI can preload defaults without hitting the DB
    if (id === "new") {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const payload = verifyJWTToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Fetch full user data from database to get role
    const user = await User.findByPk(payload.userId);
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

    // Ensure slug is persisted if missing (with uniqueness fallback)
    if (!product.slug && product.name) {
      const baseSlug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let uniqueSlug = baseSlug;
      let attempt = 0;
      const maxAttempts = 10;

      while (attempt < maxAttempts) {
        try {
          await product.update({ slug: uniqueSlug });
          break; // success
        } catch (e: any) {
          const isUniqueViolation = Boolean(
            e?.name === 'SequelizeUniqueConstraintError' ||
            e?.parent?.code === '23505'
          );
          if (!isUniqueViolation) {
            console.warn('⚠️ Failed to persist computed slug for product (non-unique error)', id, e);
            break;
          }
          attempt += 1;
          uniqueSlug = `${baseSlug}-${attempt}`;
        }
      }
    }

    // Transform data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug || null,
      price: product.price,
      pharmacyProductId: product.pharmacyProductId,
      pharmacyWholesaleCost: (product as any).pharmacyWholesaleCost || null,
      suggestedRetailPrice: (product as any).suggestedRetailPrice || null,
      dosage: product.dosage,
      description: product.description,
      activeIngredients: product.activeIngredients,
      imageUrl: product.imageUrl,
      isActive: product.isActive, // Return actual isActive status from database
      category: (product as any).category || null,
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using productCreateSchema
    const validation = productCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { name, price, description, pharmacyProductId, dosage, activeIngredients, isActive } = validation.data;

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
      price: price,
      description,
      pharmacyProductId,
      dosage,
      activeIngredients: activeIngredients || [],
      active: isActive !== undefined ? isActive : true,
      isActive: isActive !== undefined ? isActive : true,
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using productUpdateSchema
    const validation = productUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { name, price, description, pharmacyProductId, dosage, activeIngredients, isActive } = validation.data;

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
      price: price,
      description,
      pharmacyProductId,
      dosage,
      activeIngredients: activeIngredients || [],
      active: isActive !== undefined ? isActive : true,
      isActive: isActive !== undefined ? isActive : true,
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

// ============================================
// NEW PRODUCT MANAGEMENT ENDPOINTS
// ============================================

// List all products with enhanced pharmacy metadata
app.get("/products-management", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const productService = new ProductService();


    // Validate query parameters using paginationSchema
    const validation = listProductsSchema.safeParse({
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      isActive: req.query.isActive === undefined ? undefined : req.query.isActive === 'true',
      pharmacyProvider: req.query.pharmacyProvider,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { page, limit, category, isActive, pharmacyProvider } = validation.data;



    const result = await productService.listProducts(currentUser.id, { page, limit, category, isActive, pharmacyProvider });
    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error listing products:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to list products" });
  }
});

// Get single product with full details
app.get("/products-management/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const productService = new ProductService();
    const result = await productService.getProduct(req.params.id, currentUser.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch product" });
  }
});

// Create new product with pharmacy metadata
app.post("/products-management", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Validate request body using productCreateSchema
    const validation = productCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const productService = new ProductService();
    const result = await productService.createProduct(validation.data, currentUser.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to create product" });
  }
});

// Update product with pharmacy metadata
app.put("/products-management/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Validate request body using productUpdateSchema
    const validation = productUpdateSchema.safeParse({ ...req.body, id: req.params.id });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const productService = new ProductService();
    const result = await productService.updateProduct(validation.data, currentUser.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to update product" });
  }
});

// Deactivate product (soft delete)
app.delete("/products-management/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const productService = new ProductService();
    const result = await productService.deleteProduct(req.params.id, currentUser.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete product" });
  }
});

// List available product categories
app.get("/products-management/categories/list", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const productService = new ProductService();
    const result = await productService.listCategories(currentUser.id);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error listing categories:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to list categories" });
  }
});

// List available pharmacy vendors
app.get("/products-management/vendors/list", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const productService = new ProductService();
    const result = await productService.listPharmacyVendors(currentUser.id);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error listing pharmacy vendors:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to list pharmacy vendors" });
  }
});

// ============================================
// END NEW PRODUCT MANAGEMENT ENDPOINTS
// ============================================

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
        },
        {
          model: Clinic,
          as: 'clinic',
        }
      ]
    });

    const treatmentIds = treatments.map((treatment) => treatment.id);

    const brandTreatments = treatmentIds.length
      ? await BrandTreatment.findAll({
        where: {
          userId: currentUser.id,
          treatmentId: treatmentIds,
        },
      })
      : [];

    const brandTreatmentByTreatmentId = new Map(
      brandTreatments.map((selection) => [selection.treatmentId, selection])
    );

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

        const treatmentData = treatment.toJSON();
        delete treatmentData.products; // Remove the full products array to reduce response size

        const selection = brandTreatmentByTreatmentId.get(treatment.id);
        const clinicData = treatment.clinic ? treatment.clinic.toJSON ? treatment.clinic.toJSON() : treatment.clinic : null;
        treatmentData.selected = Boolean(selection);
        treatmentData.brandColor = selection?.brandColor ?? null;
        treatmentData.brandLogo = selection?.brandLogo ?? null;
        treatmentData.clinicSlug = clinicData?.slug ?? null;
        treatmentData.slug = treatmentData.slug || treatmentData.name?.toLowerCase?.()?.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using treatmentCreateSchema
    const validation = treatmentCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { name, defaultQuestionnaire } = validation.data;

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
      questionnaireService.createDefaultQuestionnaire(treatment.id, true, null)
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
app.put(["/treatments/:treatmentId", "/treatments"], authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Get treatmentId from URL param or body
    const treatmentId = req.params.treatmentId || req.body.treatmentId;

    if (!treatmentId) {
      return res.status(400).json({
        success: false,
        message: "treatmentId is required in URL or request body"
      });
    }

    // Validate request body using treatmentUpdateSchema
    const validation = treatmentUpdateSchema.safeParse({
      ...req.body,
      treatmentId
    });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const treatment = await treatmentService.updateTreatment(treatmentId, validation.data, currentUser.id)


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
        },
      ]
    });

    if (!treatment) {
      return res.status(404).json({ success: false, message: "Treatment not found" });
    }

    let questionnaires: any[] | undefined;

    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const payload = verifyJWTToken(token);
      if (payload) {
        try {
          const userRecord = await User.findByPk(payload.userId);
          if (userRecord) {
            // Always fetch user's questionnaires for this treatment, regardless of clinic association
            // This allows users to see their cloned questionnaires for any treatment template
            questionnaires = await questionnaireService.listForTreatment(id, userRecord.id);
            console.log('📋 Fetched user questionnaires for treatment:', {
              treatmentId: id,
              userId: userRecord.id,
              questionnaireCount: questionnaires?.length || 0
            });
          }
        } catch (authError) {
          console.warn('⚠️ Optional auth failed for /treatments/:id', authError);
        }
      }
    }

    console.log('💊 Treatment fetched:', { id: treatment.id, name: treatment.name, productsCount: treatment.products?.length || 0 });

    if (treatment.products && treatment.products.length > 0) {
      const totalProductsPrice = treatment.products.reduce((sum, product) => {
        const price = parseFloat(String(product.price || 0)) || 0;
        return sum + price;
      }, 0);

      const markupAmount = (totalProductsPrice * 10) / 100;
      const finalProductsPrice = totalProductsPrice + markupAmount;

      if (isNaN(treatment.productsPrice) || Math.abs(treatment.productsPrice - finalProductsPrice) > 0.01) {
        console.log('💊 Updating productsPrice from', treatment.productsPrice, 'to', finalProductsPrice);
        await treatment.update({ productsPrice: finalProductsPrice });
        treatment.productsPrice = finalProductsPrice;
      }
    }

    const treatmentData = treatment.toJSON ? treatment.toJSON() : treatment;
    if (questionnaires) {
      treatmentData.questionnaires = questionnaires;
    }

    res.status(200).json({
      success: true,
      data: treatmentData
    });
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch treatment"
    });
  }
});

// Get treatments for current authenticated user based on their orders
app.get("/getTreatments", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    console.log('🔍 Fetching treatments for user:', currentUser.id);

    // Find all orders for this user that have a treatmentId
    const orders = await Order.findAll({
      where: {
        userId: currentUser.id,
      },
      include: [
        {
          model: Treatment,
          as: 'treatment',
          required: true, // Only include orders that have a treatment
          include: [
            {
              model: Product,
              as: 'products',
              through: { attributes: ['dosage'] }
            },
            {
              model: Clinic,
              as: 'clinic'
            }
          ]
        },
        {
          model: TreatmentPlan,
          as: 'treatmentPlan'
        },
        {
          model: Subscription,
          as: 'subscription'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${orders.length} orders with treatments for user ${currentUser.id}`);

    // Transform orders to unique treatments with subscription info
    const treatmentMap = new Map();

    for (const order of orders) {
      if (!order.treatment) continue;

      const treatmentId = order.treatment.id;

      // If we already have this treatment, keep the most recent order with active subscription
      if (treatmentMap.has(treatmentId)) {
        const existing = treatmentMap.get(treatmentId);
        // Update if this order has an active subscription
        if (order.subscription &&
          order.subscription.status !== 'cancelled' &&
          order.subscription.status !== 'deleted') {
          existing.subscription = order.subscription;
          existing.order = order;
        }
      } else {
        // Add new treatment entry
        treatmentMap.set(treatmentId, {
          treatment: order.treatment,
          treatmentPlan: order.treatmentPlan,
          subscription: order.subscription,
          order: order
        });
      }
    }

    // Convert map to array and format response
    const treatments = Array.from(treatmentMap.values()).map(({ treatment, treatmentPlan, subscription, order }) => {
      const treatmentData = treatment.toJSON();

      // Determine status from subscription or order
      let status = "active";
      if (subscription) {
        switch (subscription.status.toLowerCase()) {
          case "paid":
          case "processing":
            status = "active";
            break;
          case "pending":
          case "payment_due":
            status = "paused";
            break;
          case "cancelled":
          case "deleted":
            status = "cancelled";
            break;
        }
      } else if (order.status === 'cancelled') {
        status = "cancelled";
      } else if (order.status === 'pending' || order.status === 'payment_due') {
        status = "paused";
      }

      return {
        id: treatment.id,
        name: treatment.name,
        treatmentLogo: treatment.treatmentLogo,
        status: status, // Status derived from subscription/order
        clinicId: treatment.clinicId,
        clinicName: treatment.clinic?.name || null,
        clinicSlug: treatment.clinic?.slug || null,
        // Treatment Plan info
        treatmentPlan: treatmentPlan ? {
          id: treatmentPlan.id,
          name: treatmentPlan.name,
          price: treatmentPlan.price,
          billingInterval: treatmentPlan.billingInterval
        } : null,
        // Subscription info
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          cancelledAt: subscription.cancelledAt,
          paymentDue: subscription.paymentDue,
          paidAt: subscription.paidAt
        } : null,
        // Order info
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        orderCreatedAt: order.createdAt,
        // Products
        products: treatment.products || [],
        productsCount: treatment.products?.length || 0,
      };
    });

    console.log(`✅ Returning ${treatments.length} unique treatments`);

    res.json({
      success: true,
      data: treatments
    });

  } catch (error) {
    console.error('❌ Error fetching user treatments:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user treatments"
    });
  }
});

// Get products from user's active treatments
app.get("/getProductsByTreatment", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    console.log('🔍 Fetching products from treatments for user:', currentUser.id);

    // Find all orders for this user that have a treatmentId
    const orders = await Order.findAll({
      where: {
        userId: currentUser.id,
      },
      include: [
        {
          model: Treatment,
          as: 'treatment',
          required: true,
          include: [
            {
              model: Product,
              as: 'products',
              through: {
                attributes: ['dosage']
              }
            }
          ]
        },
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${orders.length} orders for user ${currentUser.id}`);

    // Collect all products from active treatments
    const productsList: any[] = [];
    const processedProducts = new Set(); // To avoid duplicates

    for (const order of orders) {
      console.log('🔍 Order:', order);
      if (!order.treatment || !order.treatment.products) continue;
      console.log("has treatment and products");
      // Determine if treatment is active
      let isActive = true;
      if (order.subscription) {
        isActive = order.subscription.status === 'paid' || order.subscription.status === 'processing';
      } else if (order.status === 'cancelled') {
        isActive = false;
      }
      console.log("isActive:", isActive);

      // Only include products from active treatments
      // if (!isActive) continue;

      // Map each product
      for (const product of order.treatment.products) {
        const productKey = `${product.id}-${order.treatment.id}`;
        console.log("productKey:", productKey);
        // Skip if already processed
        if (processedProducts.has(productKey)) continue;
        processedProducts.add(productKey);
        console.log("has product and treatment");
        // Get dosage from TreatmentProducts junction table
        const dosage = (product as any).TreatmentProducts?.dosage || product.dosage || "As prescribed";
        console.log("dosage:", dosage);
        // Determine status from subscription or order
        let status = "active";
        if (order.subscription) {
          switch (order.subscription.status.toLowerCase()) {
            case "paid":
            case "processing":
              status = "active";
              break;
            case "pending":
            case "payment_due":
              status = "paused";
              break;
            case "cancelled":
            case "deleted":
              status = "cancelled";
              break;
          }
        } else if (order.status === 'cancelled') {
          status = "cancelled";
        } else if (order.status === 'pending' || order.status === 'payment_due') {
          status = "paused";
        }

        productsList.push({
          id: product.id,
          name: order.treatment.name, // Treatment name
          subtitle: product.name, // Product name as subtitle
          dosage: dosage,
          refills: 0, // TODO: Add refills logic if available
          status: status,
          expiryDate: "N/A", // TODO: Add expiry date logic if available
          image: product.imageUrl || `https://img.heroui.chat/image/medicine?w=100&h=100&u=${product.id.slice(-1)}`
        });
      }
    }

    console.log(`✅ Returning ${productsList.length} products from active treatments`);

    res.json({
      success: true,
      data: productsList
    });

  } catch (error) {
    console.error('❌ Error fetching products by treatment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by treatment"
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using treatmentPlanCreateSchema
    const validation = treatmentPlanCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { name, description, billingInterval, price, active, popular, sortOrder, treatmentId } = validation.data;

    // Create treatment plan service instance
    const treatmentPlanService = new TreatmentPlanService();

    // Create treatment plan
    const newTreatmentPlan = await treatmentPlanService.createTreatmentPlan(
      { name, description, billingInterval: billingInterval as BillingInterval, price, active, popular, sortOrder, treatmentId },
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using treatmentPlanUpdateSchema
    const validation = treatmentPlanUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { planId, name, description, billingInterval, price, active, popular, sortOrder } = validation.data;

    // Create treatment plan service instance
    const treatmentPlanService = new TreatmentPlanService();

    // Update treatment plan
    const updatedTreatmentPlan = await treatmentPlanService.updateTreatmentPlan(
      planId,
      { name, description, billingInterval: billingInterval as BillingInterval, price, active, popular, sortOrder },
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using createPaymentIntentSchema
    const validation = createPaymentIntentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const {
      amount,
      currency,
      treatmentId,
      selectedProducts,
      selectedPlan,
      shippingInfo,
      questionnaireAnswers
    } = validation.data;

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
    const orderNumber = await Order.generateOrderNumber();
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
    const orderItems: any[] = [];
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

    // Calculate distribution: platform fee (% of total), doctor flat, pharmacy wholesale, brand residual
    // If Clinic has a Stripe Connect account, we transfer only the brand residual to the clinic
    const platformFeePercent = Number(process.env.FUSE_TRANSACTION_FEE_PERCENT ?? 1);
    const doctorFlatUsd = Number(process.env.FUSE_TRANSACTION_DOCTOR_FEE_USD ?? 20);

    let brandAmountUsd = 0;
    let pharmacyWholesaleTotal = 0;
    let platformFeeUsd = 0;
    try {
      // Sum wholesale cost from treatment products aligned with selectedProducts
      if (treatment.products && selectedProducts) {
        for (const [productId, qty] of Object.entries(selectedProducts as Record<string, any>)) {
          const product = treatment.products.find((p: any) => p.id === productId);
          if (!product) continue;
          const quantity = Number(qty) || 0;
          const wholesale = Number((product as any).pharmacyWholesaleCost || 0);
          pharmacyWholesaleTotal += wholesale * quantity;
        }
      }
      const totalPaid = Number(amount) || 0;
      platformFeeUsd = Math.max(0, (platformFeePercent / 100) * totalPaid);
      const doctorUsd = Math.max(0, doctorFlatUsd);
      brandAmountUsd = Math.max(0, totalPaid - platformFeeUsd - doctorUsd - pharmacyWholesaleTotal);
    } catch (e) {
      console.warn('⚠️ Failed to compute brandAmountUsd, defaulting to 0:', e);
      brandAmountUsd = 0;
    }

    // Resolve clinic's Stripe account (via treatment.clinicId if present)
    let transferData: any = undefined;
    try {
      const treatmentWithClinic = await Treatment.findByPk(treatmentId, { include: [{ model: Clinic, as: 'clinic' }] as any });
      const clinicStripeAccountId = (treatmentWithClinic as any)?.clinic?.stripeAccountId;
      if (clinicStripeAccountId && brandAmountUsd > 0) {
        transferData = {
          destination: clinicStripeAccountId,
          amount: Math.round(brandAmountUsd * 100), // cents
        };
      }
    } catch (e) {
      console.warn('⚠️ Could not resolve clinic Stripe account for transfer_data:', e);
    }

    // Persist payout breakdown on Order
    try {
      await order.update({
        platformFeeAmount: platformFeeUsd,
        doctorAmount: Number(doctorFlatUsd.toFixed(2)),
        pharmacyWholesaleAmount: Number(pharmacyWholesaleTotal.toFixed(2)),
        brandAmount: Number(brandAmountUsd.toFixed(2)),
      });
    } catch (e) {
      console.warn('⚠️ Failed to persist payout breakdown on Order:', e);
    }

    // Create payment intent with optional transfer_data to send clinic margin
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId: currentUser.id,
          treatmentId,
          orderId: order.id,
          orderNumber: orderNumber,
          selectedProducts: JSON.stringify(selectedProducts),
          selectedPlan,
          orderType: 'treatment_order',
          brandAmountUsd: brandAmountUsd.toFixed(2),
          platformFeePercent: String(platformFeePercent),
          platformFeeUsd: platformFeeUsd.toFixed(2),
          doctorFlatUsd: doctorFlatUsd.toFixed(2),
          pharmacyWholesaleTotalUsd: pharmacyWholesaleTotal.toFixed(2),
        },
        description: `Order ${orderNumber} - ${treatment.name}`,
        ...(transferData ? { transfer_data: transferData } : {}),
      });
    } catch (stripeError: any) {
      console.error('❌ Stripe payment intent creation failed:', stripeError);

      // Mark order as failed
      await order.update({ status: 'failed' });

      return res.status(500).json({
        error: "stripe_payment_intent_failed",
        message: stripeError.message || "Failed to create payment intent with Stripe",
        details: stripeError.type || 'unknown_error'
      });
    }

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment"
    });
  }
});

// Create subscription-based product purchase with payment intent
app.post("/products/create-payment-intent", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using createProductSubscriptionSchema
    const validation = createProductSubscriptionSchema.safeParse(req.body);

    console.log(" validation ", validation)
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const {
      productId,
      shippingInfo,
      questionnaireAnswers
    } = validation.data;



    // Get tenant product configuration (includes clinic pricing and questionnaire)
    const tenantProduct = await TenantProduct.findByPk(productId, {
      include: [
        {
          model: Clinic,
          as: 'clinic',
          required: true
        },
        {
          model: Product,
          as: 'product',
          required: true
        }
      ]
    });


    if (!tenantProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not available for subscription"
      });
    }

    // Use tenant product price if available, otherwise use base product price
    const unitPrice = tenantProduct.price;
    const totalAmount = unitPrice;

    // Get or create Stripe customer
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userService = new UserService();
    const stripeCustomerId = await userService.getOrCreateCustomerId(user, {
      userId: user.id,
      productId
    });



    // Create order
    const orderNumber = await Order.generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId: currentUser.id,
      clinicId: tenantProduct.clinicId, // Product subscription order linked to clinic
      questionnaireId: tenantProduct.questionnaireId || null,
      status: 'pending',
      billingInterval: BillingInterval.MONTHLY,
      subtotalAmount: totalAmount,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: totalAmount,
      questionnaireAnswers,
      stripePriceId: tenantProduct.stripePriceId,
      tenantProductId: tenantProduct.id
    });

    // Create order item
    await OrderItem.create({
      orderId: order.id,
      productId: tenantProduct.product.id,
      quantity: 1,
      unitPrice: unitPrice,
      totalPrice: totalAmount,
      dosage: tenantProduct.product.dosage
    });

    // Create shipping address if provided
    if (shippingInfo.address && shippingInfo.city && shippingInfo.state && shippingInfo.zipCode) {
      await ShippingAddress.create({
        orderId: order.id,
        address: shippingInfo.address,
        apartment: shippingInfo.apartment || null,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country || 'US',
        userId: currentUser.id,
      });
    }

    // Create payment intent with Stripe (manual capture)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      customer: stripeCustomerId,
      capture_method: 'manual',
      metadata: {
        userId: currentUser.id,
        tenantProductId: tenantProduct.id,
        orderId: order.id,
        orderNumber: orderNumber,
        orderType: 'product_subscription_initial_authorization'
      },
      description: `Subscription Authorization ${orderNumber} - ${tenantProduct.product.name}`,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      setup_future_usage: 'off_session',
    });

    // Create payment record
    await Payment.create({
      orderId: order.id,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      paymentMethod: 'card',
      amount: totalAmount,
      currency: 'USD'
    });

    console.log('💳 Product subscription order and payment intent created:', {
      orderId: order.id,
      orderNumber: orderNumber,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      userId: currentUser.id,
      productId,
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
    console.error('Error creating product subscription order and payment intent:', error);

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
      message: "Failed to create product subscription order and payment intent",
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
});

// Public product subscription: creates manual-capture PaymentIntent and Order
app.post("/payments/product/sub", async (req, res) => {
  try {
    const { tenantProductId, stripePriceId, userDetails, questionnaireAnswers, shippingInfo } = req.body || {};

    if (!tenantProductId || typeof tenantProductId !== 'string') {
      return res.status(400).json({ success: false, message: 'tenantProductId is required' });
    }

    // Try authenticated user from JWT; if none, create/find from userDetails
    let currentUser: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        currentUser = getCurrentUser(req);
      } catch { }
    }

    if (!currentUser) {
      const { firstName, lastName, email, phoneNumber } = userDetails || {};
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'userDetails with firstName, lastName, and email is required for public checkout' });
      }
      // Find or create patient user
      currentUser = await User.findByEmail(email);
      if (!currentUser) {
        currentUser = await User.createUser({
          firstName,
          lastName,
          email,
          password: 'TempPassword123!',
          role: 'patient',
          phoneNumber
        });
      }
    }

    // Load tenant product configuration
    const tenantProduct = await TenantProduct.findByPk(tenantProductId, {
      include: [
        { model: Clinic, as: 'clinic', required: false },
        { model: Product, as: 'product', required: true },
      ]
    });

    if (!tenantProduct) {
      return res.status(404).json({ success: false, message: 'Product not available for subscription' });
    }

    const unitPrice = (tenantProduct as any).price;
    const totalAmount = unitPrice;

    // Ensure Stripe customer
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userService = new UserService();
    const stripeCustomerId = await userService.getOrCreateCustomerId(user, { userId: user.id, tenantProductId });

    // Create order
    const orderNumber = await Order.generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId: currentUser.id,
      clinicId: (tenantProduct as any).clinicId || null,
      questionnaireId: (tenantProduct as any).questionnaireId || null,
      status: 'pending',
      billingInterval: BillingInterval.MONTHLY,
      subtotalAmount: totalAmount,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: totalAmount,
      questionnaireAnswers,
      stripePriceId: stripePriceId || (tenantProduct as any).stripePriceId || null,
      tenantProductId: (tenantProduct as any).id,
    });

    // Order item
    await OrderItem.create({
      orderId: order.id,
      productId: (tenantProduct as any).product.id,
      quantity: 1,
      unitPrice: unitPrice,
      totalPrice: totalAmount,
      dosage: (tenantProduct as any).product.dosage
    });

    // Shipping address
    if (shippingInfo?.address && shippingInfo?.city && shippingInfo?.state && shippingInfo?.zipCode) {
      const createdAddress = await ShippingAddress.create({
        orderId: order.id,
        address: shippingInfo.address,
        apartment: shippingInfo.apartment || null,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country || 'US',
        userId: currentUser.id,
      });
      await order.update({ shippingAddressId: createdAddress.id });
    }

    // Update user with DOB and gender from questionnaire if present
    try {
      if (questionnaireAnswers) {
        const updateData: any = {};

        // Check if questionnaireAnswers has structured format
        const answers = questionnaireAnswers.answers || [];

        // Extract DOB from questionnaire answers
        const dobAnswer = answers.find((a: any) =>
          a.questionText?.toLowerCase().includes('date of birth') ||
          a.questionText?.toLowerCase().includes('birthday') ||
          a.questionText?.toLowerCase().includes('dob')
        );

        // Extract gender from questionnaire answers
        const genderAnswer = answers.find((a: any) =>
          a.questionText?.toLowerCase().includes('gender') ||
          a.questionText?.toLowerCase().includes('sex')
        );

        // Only update if user doesn't have these values already
        if (dobAnswer?.answer && !user.dob) {
          // Normalize DOB to YYYY-MM-DD format
          let normalized = String(dobAnswer.answer);
          const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
          const usMatch = mmddyyyy.exec(normalized);
          if (usMatch) {
            const mm = usMatch[1].padStart(2, '0');
            const dd = usMatch[2].padStart(2, '0');
            const yyyy = usMatch[3];
            normalized = `${yyyy}-${mm}-${dd}`;
          }
          updateData.dob = normalized;
          console.log(`📋 Extracted DOB from questionnaire: ${normalized}`);
        }

        if (genderAnswer?.answer && !user.gender) {
          // Extract gender value (could be from selectedOptions or direct answer)
          let genderValue = genderAnswer.answer;
          if (genderAnswer.selectedOptions && genderAnswer.selectedOptions.length > 0) {
            genderValue = genderAnswer.selectedOptions[0].optionText;
          }
          updateData.gender = String(genderValue).toLowerCase();
          console.log(`📋 Extracted gender from questionnaire: ${genderValue}`);
        }

        // Update user if we have new data
        if (Object.keys(updateData).length > 0) {
          await user.update(updateData);
          console.log(`✅ Updated user ${user.id} with questionnaire data:`, updateData);
        }
      }
    } catch (error) {
      console.error('⚠️ Error updating user from questionnaire answers:', error);
      // Don't fail the order creation if user update fails
    }

    // Manual-capture PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      customer: stripeCustomerId,
      capture_method: 'manual',
      metadata: {
        userId: currentUser.id,
        tenantProductId: (tenantProduct as any).id,
        orderId: order.id,
        orderNumber: orderNumber,
        orderType: 'product_subscription_initial_authorization'
      },
      description: `Subscription Authorization ${orderNumber} - ${(tenantProduct as any).product.name}`,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      setup_future_usage: 'off_session',
    });

    // Store stripePriceId on order for subscription creation after capture
    await order.update({
      stripePriceId: stripePriceId || (tenantProduct as any).stripePriceId || null
    });

    // Create Payment record - this is the single source of truth for payment intent ID
    await Payment.create({
      orderId: order.id,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      paymentMethod: 'card',
      amount: totalAmount,
      currency: 'USD'
    });

    return res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
        orderNumber,
      }
    });
  } catch (error) {
    console.error('Error in /payments/product/sub:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product subscription' });
  }
});

// Create subscription for treatment
app.post("/payments/treatment/sub", async (req, res) => {
  try {
    // Validate request body using treatmentSubscriptionSchema
    const validation = treatmentSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { treatmentId, stripePriceId, userDetails, questionnaireAnswers, shippingInfo } = validation.data;

    let currentUser: any = null;

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using clinicSubscriptionSchema
    const validation = clinicSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { clinicId } = validation.data;

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

// ========== Stripe Connect Endpoints ==========

// Import Stripe Connect Service
import StripeConnectService from "./services/stripe/connect.service";

// Create Account Session for Stripe Connect embedded components
app.post("/stripe/connect/session", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const userWithClinic: any = currentUser;
    const clinicId = userWithClinic?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "No clinic associated with user"
      });
    }

    console.log(`🔄 Creating Stripe Connect session for clinic: ${clinicId}`);

    // Create account session
    const clientSecret = await StripeConnectService.createAccountSession(clinicId);

    res.status(200).json({
      success: true,
      data: {
        client_secret: clientSecret
      }
    });

  } catch (error: any) {
    console.error('❌ Error creating Stripe Connect session:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Connect session"
    });
  }
});

// Get Stripe Connect account status
app.get("/stripe/connect/status", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const userWithClinic: any = currentUser;
    const clinicId = userWithClinic?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "No clinic associated with user"
      });
    }

    console.log(`🔍 Fetching Stripe Connect status for clinic: ${clinicId}`);

    // Get account status
    const status = await StripeConnectService.getAccountStatus(clinicId);

    res.status(200).json({
      success: true,
      data: status
    });

  } catch (error: any) {
    console.error('❌ Error fetching Stripe Connect status:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Connect status"
    });
  }
});

// Create account link for onboarding (alternative to embedded components)
app.post("/stripe/connect/account-link", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const userWithClinic: any = currentUser;
    const clinicId = userWithClinic?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "No clinic associated with user"
      });
    }

    const { refreshUrl, returnUrl } = req.body;

    if (!refreshUrl || !returnUrl) {
      return res.status(400).json({
        success: false,
        message: "refreshUrl and returnUrl are required"
      });
    }

    console.log(`🔄 Creating Stripe account link for clinic: ${clinicId}`);

    const accountLinkUrl = await StripeConnectService.createAccountLink(
      clinicId,
      refreshUrl,
      returnUrl
    );

    res.status(200).json({
      success: true,
      data: {
        url: accountLinkUrl
      }
    });

  } catch (error: any) {
    console.error('❌ Error creating account link:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create account link"
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

// Get customers/users for a clinic
app.get("/users/by-clinic/:clinicId", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { clinicId } = req.params;

    // Verify user has access to this clinic
    const user = await User.findByPk(currentUser.id);
    if (!user || user.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this clinic"
      });
    }

    // Fetch all users who have placed orders with this clinic
    const orders = await Order.findAll({
      where: { clinicId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'createdAt', 'updatedAt']
      }],
      attributes: ['userId'],
      group: ['userId', 'user.id']
    });

    // Get unique users and count their orders
    const userIds = new Set<string>();
    orders.forEach(order => userIds.add(order.userId));

    const customers = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const customer = await User.findByPk(userId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'createdAt', 'updatedAt']
        });

        if (!customer) return null;

        // Get all orders for this customer with products
        const customerOrders = await Order.findAll({
          where: { userId, clinicId, status: 'paid' },
          include: [{
            model: OrderItem,
            as: 'orderItems',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'category']
            }]
          }]
        });

        // Calculate total revenue
        const totalRevenue = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Get unique product categories this customer has ordered
        const categories = new Set<string>();
        customerOrders.forEach(order => {
          order.orderItems?.forEach(item => {
            if (item.product?.category) {
              categories.add(item.product.category);
            }
          });
        });

        // Check for active subscription
        const subscription = await Subscription.findOne({
          where: {
            userId,
            status: 'active'
          }
        });

        return {
          ...customer.toJSON(),
          orderCount: customerOrders.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          categories: Array.from(categories),
          hasActiveSubscription: !!subscription
        };
      })
    );

    const validCustomers = customers.filter(c => c !== null);

    res.status(200).json({
      success: true,
      data: validCustomers
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers"
    });
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
        },
        {
          model: ShippingOrder,
          as: 'shippingOrders',
          required: false // Left join - orders may not have shipping orders yet
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

// Get basic subscription info (status, tutorialFinished, stripeCustomerId)
app.get("/brand-subscriptions/basic-info", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const brandSubscriptionService = new BrandSubscriptionService();
    const subscriptionInfo = await brandSubscriptionService.getBasicSubscriptionInfo(currentUser.id);

    if (!subscriptionInfo) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subscriptionInfo,
    });
  } catch (error) {
    console.error("❌ Error getting basic subscription info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Mark tutorial as finished
app.post("/brand-subscriptions/mark-tutorial-finished", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const brandSubscriptionService = new BrandSubscriptionService();
    const success = await brandSubscriptionService.markTutorialFinished(currentUser.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tutorial marked as finished",
    });
  } catch (error) {
    console.error("❌ Error marking tutorial as finished:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update brand subscription features (admin only)
app.put("/brand-subscriptions/features", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using updateBrandSubscriptionFeaturesSchema
    const validation = updateBrandSubscriptionFeaturesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }


    const brandSubscriptionService = new BrandSubscriptionService();
    const result = await brandSubscriptionService.updateFeatures(
      currentUser.id,
      validation.data
    );

    if (!result.success) {
      const statusCode = result.message === 'Access denied' ? 403 :
        result.message === 'Subscription not found' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error updating subscription features:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subscription features'
    });
  }
});


// Create payment intent for direct card processing
app.post("/brand-subscriptions/create-payment-intent", authenticateJWT, async (req, res) => {
  try {

    const currentUser = getCurrentUser(req);

    if (currentUser?.role !== 'brand') {
      console.error('❌ BACKEND CREATE: Access denied - not brand role')
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    // Validate request body using brandPaymentIntentSchema
    const validation = brandPaymentIntentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { brandSubscriptionPlanId } = validation.data;

    const selectedPlan = await BrandSubscriptionPlans.findByPk(brandSubscriptionPlanId);


    if (!selectedPlan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
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
    let stripeCustomerId = await userService.getOrCreateCustomerId(user, {
      userId: user.id,
      role: user.role,
      brandSubscriptionPlanId
    });

    const amount = selectedPlan.monthlyPrice

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        userId: currentUser.id,
        brandSubscriptionPlanId,
        amount: amount.toString()
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      setup_future_usage: 'off_session',
      receipt_email: user.email || undefined,
      description: `${selectedPlan.name}`
    });



    const brandSubscription = await BrandSubscription.create({
      userId: user.id,
      status: BrandSubscriptionStatus.PENDING,
      stripeCustomerId: user.stripeCustomerId,
      stripePriceId: selectedPlan.stripePriceId,
      monthlyPrice: selectedPlan.monthlyPrice,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      planType: selectedPlan.planType
    });

    // Create payment record
    await Payment.create({
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      paymentMethod: 'card',
      amount: amount,
      currency: 'usd',
      stripeMetadata: {
        userId: currentUser.id,
        stripePriceId: selectedPlan.stripePriceId,
        amount: amount.toString()
      },
      brandSubscriptionId: brandSubscription.id
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
    const currentUser = getCurrentUser(req);

    if (!currentUser || currentUser.role !== 'brand') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Brand role required."
      });
    }

    // Return success - webhook will handle subscription creation
    res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error('❌ Error confirming payment intent:', error);
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Validate request body using upgradeSubscriptionSchema
    const validation = upgradeSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { treatmentId } = validation.data;

    const subscriptionService = new SubscriptionService();
    await subscriptionService.upgradeSubscription(treatmentId, currentUser.id);

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Validate request body using cancelSubscriptionSchema
    const validation = cancelSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { treatmentId } = validation.data;

    const subscriptionService = new SubscriptionService();
    await subscriptionService.cancelSubscriptions(treatmentId, currentUser.id);

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
const questionnaireService = new QuestionnaireService();

// Get tenants (clinics) with their owners
app.get("/tenants", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await clinicService.listTenants({ page, limit });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get single tenant by ID
app.get("/tenants/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;
    const result = await clinicService.getTenantById(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Admin routes: list tenants (users with clinic) and questionnaires by tenant
app.get("/admin/tenants", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Only admins can list tenants
    const user = await User.findByPk(currentUser.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const tenants = await User.findAll({
      where: {
        clinicId: { [Op.ne]: null }
      },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'clinicId'
      ],
      include: [{
        model: Clinic,
        attributes: ['id', 'name', 'slug']
      }],
      order: [[Clinic, 'name', 'ASC'], ['lastName', 'ASC']]
    });

    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    console.error('❌ Error listing tenants:', error);
    res.status(500).json({ success: false, message: 'Failed to list tenants' });
  }
});

app.get("/admin/tenants/:userId/questionnaires", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Only admins can view questionnaires for a tenant
    const user = await User.findByPk(currentUser.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { userId } = req.params;
    const questionnaires = await questionnaireService.listForUser(userId);
    res.status(200).json({ success: true, data: questionnaires });
  } catch (error) {
    console.error('❌ Error fetching questionnaires for tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaires for tenant' });
  }
});

app.get("/questionnaires/templates", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const templates = await questionnaireService.listTemplates();

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('❌ Error fetching questionnaire templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaire templates' });
  }
});

app.get("/questionnaires/templates/product-forms", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const forms = await questionnaireService.listAllProductForms();

    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    console.error('❌ Error fetching product forms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product forms' });
  }
});

app.get("/questionnaires/templates/assigned", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const treatmentId = typeof req.query.treatmentId === 'string' ? req.query.treatmentId : undefined

    if (!treatmentId) {
      return res.status(400).json({ success: false, message: 'treatmentId is required' })
    }

    const assignment = await formTemplateService.getTenantProductForm(currentUser.id, treatmentId)

    res.status(200).json({ success: true, data: assignment })
  } catch (error: any) {
    console.error('❌ Error fetching tenant product form assignment:', error)
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch assignment' })
  }
})

app.get("/questionnaires/templates/assignments", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const assignments = await formTemplateService.listTenantProductForms(currentUser.id)

    res.status(200).json({ success: true, data: assignments })
  } catch (error: any) {
    console.error('❌ Error listing tenant product form assignments:', error)
    res.status(500).json({ success: false, message: error.message || 'Failed to list assignments' })
  }
})

app.post("/questionnaires/templates", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { title, description, treatmentId, productId, category, formTemplateType } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const template = await questionnaireService.createTemplate({
      title,
      description,
      treatmentId: typeof treatmentId === 'string' ? treatmentId : null,
      productId,
      category,
      formTemplateType: (
        formTemplateType === 'normal' ||
        formTemplateType === 'user_profile' ||
        formTemplateType === 'doctor' ||
        formTemplateType === 'master_template' ||
        formTemplateType === 'standardized_template'
      ) ? formTemplateType : null,
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('❌ Error creating questionnaire template:', error);
    res.status(500).json({ success: false, message: 'Failed to create questionnaire template' });
  }
});

// Create Account Template by cloning user_profile steps from master_template
app.post("/questionnaires/templates/account-from-master", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Find master template
    const masters = await Questionnaire.findAll({ where: { formTemplateType: 'master_template' }, include: [{ model: QuestionnaireStep, as: 'steps', include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }] }] });
    if (masters.length !== 1) {
      return res.status(400).json({ success: false, message: 'There should be 1 and only 1 master_template questionnaire' });
    }

    const master = masters[0] as any;

    // Create the new questionnaire (account template clone; not a template itself)
    const newQ = await Questionnaire.create({
      title: `Account Template - ${new Date().toISOString()}`,
      description: 'Cloned from master_template (user_profile steps)',
      checkoutStepPosition: -1,
      treatmentId: null,
      isTemplate: false,
      userId: currentUser.id,
      productId: null,
      formTemplateType: 'user_profile',
      personalizationQuestionsSetup: false,
      createAccountQuestionsSetup: true,
      doctorQuestionsSetup: false,
      color: null,
    });

    // Clone only user_profile steps and descendants
    const steps: any[] = (master.steps || []).filter((s: any) => s.category === 'user_profile');
    for (const step of steps) {
      const clonedStep = await QuestionnaireStep.create({
        title: step.title,
        description: step.description,
        category: step.category,
        stepOrder: step.stepOrder,
        questionnaireId: newQ.id,
      });

      for (const question of (step.questions || [])) {
        const clonedQuestion = await Question.create({
          questionText: question.questionText,
          answerType: question.answerType,
          questionSubtype: question.questionSubtype,
          isRequired: question.isRequired,
          questionOrder: question.questionOrder,
          subQuestionOrder: question.subQuestionOrder,
          conditionalLevel: question.conditionalLevel,
          placeholder: question.placeholder,
          helpText: question.helpText,
          footerNote: question.footerNote,
          conditionalLogic: question.conditionalLogic,
          stepId: clonedStep.id,
        });

        if (question.options?.length) {
          await QuestionOption.bulkCreate(
            question.options.map((opt: any) => ({
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              optionOrder: opt.optionOrder,
              questionId: clonedQuestion.id,
            }))
          );
        }
      }
    }

    const full = await Questionnaire.findByPk(newQ.id, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }]
      }]
    });

    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    console.error('❌ Error cloning account template:', error);
    return res.status(500).json({ success: false, message: 'Failed to clone account template' });
  }
});

// Save a product-specific questionnaire as a reusable template
app.post("/questionnaires/:id/save-as-template", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id: questionnaireId } = req.params;
    const { templateName } = req.body;

    if (!questionnaireId || !templateName) {
      return res.status(400).json({ success: false, message: "questionnaireId and templateName are required" });
    }

    // Fetch the questionnaire to convert to template
    const questionnaire = await Questionnaire.findByPk(questionnaireId, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ 
          model: Question, 
          as: 'questions', 
          include: [{ model: QuestionOption, as: 'options' }] 
        }]
      }]
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: 'Questionnaire not found' });
    }

    // Create the new template (clone of the questionnaire)
    const newTemplate = await Questionnaire.create({
      title: templateName,
      description: questionnaire.description,
      checkoutStepPosition: questionnaire.checkoutStepPosition,
      treatmentId: questionnaire.treatmentId,
      productId: null, // Templates don't belong to specific products
      category: questionnaire.category,
      formTemplateType: 'normal',
      isTemplate: true, // Mark as template for reuse
      userId: currentUser.id,
      personalizationQuestionsSetup: questionnaire.personalizationQuestionsSetup,
      createAccountQuestionsSetup: questionnaire.createAccountQuestionsSetup,
      doctorQuestionsSetup: questionnaire.doctorQuestionsSetup,
      color: questionnaire.color,
    });

    // Clone all steps with their questions and options
    const steps: any[] = (questionnaire as any).steps || [];
    for (const step of steps) {
      const clonedStep = await QuestionnaireStep.create({
        title: step.title,
        description: step.description,
        category: step.category,
        stepOrder: step.stepOrder,
        isDeadEnd: step.isDeadEnd,
        conditionalLogic: step.conditionalLogic,
        questionnaireId: newTemplate.id,
      });

      // Clone all questions in this step
      for (const question of (step.questions || [])) {
        const clonedQuestion = await Question.create({
          questionText: question.questionText,
          answerType: question.answerType,
          questionSubtype: question.questionSubtype,
          isRequired: question.isRequired,
          questionOrder: question.questionOrder,
          subQuestionOrder: question.subQuestionOrder,
          conditionalLevel: question.conditionalLevel,
          placeholder: question.placeholder,
          helpText: question.helpText,
          footerNote: question.footerNote,
          conditionalLogic: question.conditionalLogic,
          stepId: clonedStep.id,
        });

        // Clone all options for this question
        if (question.options?.length) {
          await QuestionOption.bulkCreate(
            question.options.map((opt: any) => ({
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              optionOrder: opt.optionOrder,
              riskLevel: opt.riskLevel,
              questionId: clonedQuestion.id,
            }))
          );
        }
      }
    }

    console.log('✅ Saved questionnaire as template:', {
      originalQuestionnaireId: questionnaireId,
      newTemplateId: newTemplate.id,
      templateName: templateName
    });

    return res.status(201).json({ 
      success: true, 
      data: { id: newTemplate.id, title: templateName },
      message: `Template "${templateName}" created successfully!`
    });
  } catch (error) {
    console.error('❌ Error saving as template:', error);
    return res.status(500).json({ success: false, message: 'Failed to save as template' });
  }
});

// Update an existing template with structure from a product form
app.put("/questionnaires/templates/:id/update-from-product-form", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id: templateId } = req.params;
    const { sourceQuestionnaireId } = req.body;

    if (!templateId || !sourceQuestionnaireId) {
      return res.status(400).json({ success: false, message: "templateId and sourceQuestionnaireId are required" });
    }

    // Fetch the source questionnaire (product form)
    const sourceQuestionnaire = await Questionnaire.findByPk(sourceQuestionnaireId, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ 
          model: Question, 
          as: 'questions', 
          include: [{ model: QuestionOption, as: 'options' }] 
        }]
      }]
    });

    if (!sourceQuestionnaire) {
      return res.status(404).json({ success: false, message: 'Source questionnaire not found' });
    }

    // Fetch the template to update
    const template = await Questionnaire.findByPk(templateId, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ 
          model: Question, 
          as: 'questions', 
          include: [{ model: QuestionOption, as: 'options' }] 
        }]
      }]
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Delete existing steps, questions, and options from the template
    const existingSteps: any[] = (template as any).steps || [];
    for (const step of existingSteps) {
      for (const question of (step.questions || [])) {
        await QuestionOption.destroy({ where: { questionId: question.id } });
        await Question.destroy({ where: { id: question.id } });
      }
      await QuestionnaireStep.destroy({ where: { id: step.id } });
    }

    // Clone all steps from source to template
    const sourceSteps: any[] = (sourceQuestionnaire as any).steps || [];
    for (const step of sourceSteps) {
      const clonedStep = await QuestionnaireStep.create({
        title: step.title,
        description: step.description,
        category: step.category,
        stepOrder: step.stepOrder,
        isDeadEnd: step.isDeadEnd,
        conditionalLogic: step.conditionalLogic,
        questionnaireId: template.id,
      });

      // Clone all questions in this step
      for (const question of (step.questions || [])) {
        const clonedQuestion = await Question.create({
          questionText: question.questionText,
          answerType: question.answerType,
          questionSubtype: question.questionSubtype,
          isRequired: question.isRequired,
          questionOrder: question.questionOrder,
          subQuestionOrder: question.subQuestionOrder,
          conditionalLevel: question.conditionalLevel,
          placeholder: question.placeholder,
          helpText: question.helpText,
          footerNote: question.footerNote,
          conditionalLogic: question.conditionalLogic,
          stepId: clonedStep.id,
        });

        // Clone all options for this question
        if (question.options?.length) {
          await QuestionOption.bulkCreate(
            question.options.map((opt: any) => ({
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              optionOrder: opt.optionOrder,
              riskLevel: opt.riskLevel,
              questionId: clonedQuestion.id,
            }))
          );
        }
      }
    }

    console.log('✅ Updated template from product form:', {
      templateId: templateId,
      sourceQuestionnaireId: sourceQuestionnaireId
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Template updated successfully!' 
    });
  } catch (error) {
    console.error('❌ Error updating template from product form:', error);
    return res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

// Clone a template for a specific product (creates independent copy)
app.post("/questionnaires/templates/:id/clone-for-product", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id: templateId } = req.params;
    const { productId } = req.body;

    if (!templateId || !productId) {
      return res.status(400).json({ success: false, message: "templateId and productId are required" });
    }

    // Fetch the template to clone
    const template = await Questionnaire.findByPk(templateId, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ 
          model: Question, 
          as: 'questions', 
          include: [{ model: QuestionOption, as: 'options' }] 
        }]
      }]
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Create the cloned questionnaire for this specific product
    const clonedQuestionnaire = await Questionnaire.create({
      title: template.title,
      description: template.description || '',
      checkoutStepPosition: template.checkoutStepPosition || null,
      treatmentId: template.treatmentId || null,
      productId: productId, // Link to specific product
      category: template.category || null,
      formTemplateType: 'normal', // Clones are not templates themselves
      isTemplate: false, // This is a product-specific instance, not a template
      userId: currentUser.id,
      personalizationQuestionsSetup: template.personalizationQuestionsSetup || null,
      createAccountQuestionsSetup: template.createAccountQuestionsSetup || null,
      doctorQuestionsSetup: template.doctorQuestionsSetup || null,
      color: template.color || null,
    }).catch((err) => {
      console.error('❌ Error creating cloned questionnaire:', err);
      throw new Error(`Failed to create questionnaire: ${err.message}`);
    });

    // Clone all steps with their questions and options
    const steps: any[] = (template as any).steps || [];
    for (const step of steps) {
      const clonedStep = await QuestionnaireStep.create({
        title: step.title || '',
        description: step.description || '',
        category: step.category || 'normal',
        stepOrder: step.stepOrder || 0,
        isDeadEnd: step.isDeadEnd || false,
        conditionalLogic: step.conditionalLogic || null,
        questionnaireId: clonedQuestionnaire.id,
      }).catch((err) => {
        console.error('❌ Error creating cloned step:', err);
        throw new Error(`Failed to create step: ${err.message}`);
      });

      // Clone all questions in this step
      for (const question of (step.questions || [])) {
        const clonedQuestion = await Question.create({
          questionText: question.questionText || '',
          answerType: question.answerType || 'radio',
          questionSubtype: question.questionSubtype || null,
          isRequired: question.isRequired !== undefined ? question.isRequired : true,
          questionOrder: question.questionOrder || 0,
          subQuestionOrder: question.subQuestionOrder || null,
          conditionalLevel: question.conditionalLevel || null,
          placeholder: question.placeholder || null,
          helpText: question.helpText || null,
          footerNote: question.footerNote || null,
          conditionalLogic: question.conditionalLogic || null,
          stepId: clonedStep.id,
        }).catch((err) => {
          console.error('❌ Error creating cloned question:', err);
          throw new Error(`Failed to create question: ${err.message}`);
        });

        // Clone all options for this question
        if (question.options?.length) {
          await QuestionOption.bulkCreate(
            question.options.map((opt: any) => ({
              optionText: opt.optionText || '',
              optionValue: opt.optionValue || opt.optionText || '',
              optionOrder: opt.optionOrder || 0,
              riskLevel: opt.riskLevel || null,
              questionId: clonedQuestion.id,
            }))
          ).catch((err) => {
            console.error('❌ Error creating cloned options:', err);
            throw new Error(`Failed to create options: ${err.message}`);
          });
        }
      }
    }

    console.log('✅ Successfully cloned template for product:', {
      templateId,
      productId,
      clonedQuestionnaireId: clonedQuestionnaire.id,
      stepsCloned: steps.length
    });

    // Return the full cloned questionnaire
    const fullClone = await Questionnaire.findByPk(clonedQuestionnaire.id, {
      include: [{
        model: QuestionnaireStep,
        as: 'steps',
        include: [{ 
          model: Question, 
          as: 'questions', 
          include: [{ model: QuestionOption, as: 'options' }] 
        }]
      }]
    });

    console.log('✅ Cloned template for product:', {
      originalTemplateId: templateId,
      clonedQuestionnaireId: clonedQuestionnaire.id,
      productId: productId
    });

    return res.status(201).json({ success: true, data: fullClone });
  } catch (error: any) {
    console.error('❌ Error cloning template for product:', error);
    const errorMessage = error?.message || 'Failed to clone template for product';
    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// IMPORTANT: This route must come AFTER all specific /questionnaires/templates/* routes
app.get("/questionnaires/templates/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Template ID is required' });
    }

    const template = await questionnaireService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error('❌ Error fetching questionnaire template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaire template' });
  }
});

app.put("/questionnaires/templates/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;
    const { name, description, schema, status, productId } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Template ID is required' });
    }

    const template = await questionnaireService.updateTemplate(id, {
      title: name,
      description,
      status,
      productId,
    });

    res.status(200).json({ success: true, data: template });
  } catch (error: any) {
    console.error('❌ Error updating questionnaire template:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update questionnaire template' });
  }
});

app.get("/questionnaires", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const questionnaires = await questionnaireService.listForUser(currentUser.id);
    res.status(200).json({ success: true, data: questionnaires });
  } catch (error) {
    console.error('❌ Error fetching questionnaires for user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaires' });
  }
});

app.get("/questionnaires/product/:productId", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const templates = await questionnaireService.listTemplatesByProduct(productId);

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('❌ Error fetching questionnaires for product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaires for product' });
  }
});

// Enable a questionnaire for current user's clinic and product
app.post("/admin/tenant-product-forms", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id);
    if (!user || !user.clinicId) {
      return res.status(400).json({ success: false, message: "User clinic not found" });
    }

    const { productId, questionnaireId, currentFormVariant } = req.body || {};
    if (!productId || !questionnaireId) {
      return res.status(400).json({ success: false, message: "productId and questionnaireId are required" });
    }

    // Enforce product slots and ensure a TenantProduct exists
    const tenantProductService = new TenantProductService();
    try {
      await tenantProductService.updateSelection({ products: [{ productId, questionnaireId }] } as any, currentUser.id);
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'Failed to enable product for clinic';
      return res.status(400).json({ success: false, message: msg });
    }

    const record = await TenantProductForm.create({
      tenantId: currentUser.id,
      treatmentId: null,
      productId,
      questionnaireId,
      clinicId: user.clinicId,
      layoutTemplate: 'layout_a',
      themeId: null,
      lockedUntil: null,
      currentFormVariant: currentFormVariant ?? null,
    });

    // Handle QuestionnaireCustomization
    try {
      // STEP 1: Deactivate ALL active records for this user (except the one we're activating)
      const deactivatedCount = await QuestionnaireCustomization.update(
        { isActive: false },
        {
          where: {
            userId: currentUser.id,
            questionnaireId: { [Op.ne]: questionnaireId }, // All except current
            isActive: true // Only active ones
          }
        }
      );

      if (deactivatedCount[0] > 0) {
        console.log(`🔄 Deactivated ${deactivatedCount[0]} previous QuestionnaireCustomization(s) for user ${currentUser.id}`);
      }

      // STEP 2: Check if customization already exists for this questionnaire
      let customization = await QuestionnaireCustomization.findOne({
        where: { userId: currentUser.id, questionnaireId }
      });

      if (customization) {
        // STEP 3A: Already exists, just activate it (keep existing color, even if null)
        await customization.update({
          isActive: true
        });
        console.log(`✅ Reactivated QuestionnaireCustomization for user ${currentUser.id}, questionnaire ${questionnaireId}, color: ${customization.customColor || 'none (will use defaults)'}`);
      } else {
        // STEP 3B: Doesn't exist, create it with no color (null) - admin can set it later
        customization = await QuestionnaireCustomization.create({
          userId: currentUser.id,
          questionnaireId,
          customColor: null, // Start with no custom color
          isActive: true,
        });
        console.log(`✅ Created NEW QuestionnaireCustomization for user ${currentUser.id}, questionnaire ${questionnaireId}, color: none (will use clinic default)`);
      }
    } catch (customizationError) {
      console.error('⚠️ Error managing QuestionnaireCustomization:', customizationError);
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('❌ Error enabling tenant product form:', error);
    res.status(500).json({ success: false, message: 'Failed to enable product form' });
  }
});

// List enabled forms for current user's clinic and a product
app.get("/admin/tenant-product-forms", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id);
    if (!user || !user.clinicId) {
      return res.status(400).json({ success: false, message: "User clinic not found" });
    }

    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const records = await TenantProductForm.findAll({
      where: { tenantId: currentUser.id, clinicId: user.clinicId, productId },
    });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error('❌ Error listing tenant product forms:', error);
    res.status(500).json({ success: false, message: 'Failed to list enabled forms' });
  }
});

// Disable an enabled form for the current user's clinic/product
app.delete("/admin/tenant-product-forms", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id);
    if (!user || !user.clinicId) {
      return res.status(400).json({ success: false, message: "User clinic not found" });
    }

    const { productId, questionnaireId } = req.body || {};
    if (!productId || !questionnaireId) {
      return res.status(400).json({ success: false, message: "productId and questionnaireId are required" });
    }

    const record = await TenantProductForm.findOne({
      where: { tenantId: currentUser.id, clinicId: user.clinicId, productId, questionnaireId },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Enabled form not found' });
    }

    await record.destroy({ force: true } as any);

    // Deactivate the corresponding QuestionnaireCustomization
    try {
      const updated = await QuestionnaireCustomization.update(
        { isActive: false },
        {
          where: {
            userId: currentUser.id,
            questionnaireId
          }
        }
      );
      if (updated[0] > 0) {
        console.log(`✅ Deactivated QuestionnaireCustomization for user ${currentUser.id}, questionnaire ${questionnaireId}`);
      }
    } catch (customizationError) {
      console.error('⚠️ Error deactivating QuestionnaireCustomization:', customizationError);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error disabling tenant product form:', error);
    res.status(500).json({ success: false, message: 'Failed to disable product form' });
  }
});

// Get all QuestionnaireCustomizations for current user
app.get("/admin/questionnaire-customizations", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const customizations = await QuestionnaireCustomization.findAll({
      where: { userId: currentUser.id }
    });

    res.status(200).json({ success: true, data: customizations });
  } catch (error) {
    console.error('❌ Error fetching questionnaire customizations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customizations' });
  }
});

// Update color for a QuestionnaireCustomization
app.put("/admin/questionnaire-customization/color", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { questionnaireId, customColor } = req.body || {};

    if (!questionnaireId) {
      return res.status(400).json({ success: false, message: "questionnaireId is required" });
    }

    // Validate hex color format
    if (customColor && !/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      return res.status(400).json({
        success: false,
        message: "customColor must be a valid hex code (e.g. #1A2B3C)"
      });
    }

    // Find the customization
    const customization = await QuestionnaireCustomization.findOne({
      where: { userId: currentUser.id, questionnaireId }
    });

    if (!customization) {
      return res.status(404).json({
        success: false,
        message: "QuestionnaireCustomization not found. Please enable the form first."
      });
    }

    // Update the color (null means "use clinic default")
    const finalColor = customColor || null;
    await customization.update({ customColor: finalColor });

    console.log(`🎨 Updated color for user ${currentUser.id}, questionnaire ${questionnaireId} to: ${finalColor || 'null (will use clinic default)'}`);

    res.status(200).json({
      success: true,
      data: customization
    });
  } catch (error) {
    console.error('❌ Error updating questionnaire color:', error);
    res.status(500).json({ success: false, message: 'Failed to update questionnaire color' });
  }
});

// Retry product selection: clears TenantProduct and TenantProductForm for current clinic, once per cycle
app.post("/tenant-products/retry-selection", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(currentUser.id);
    if (!user || !user.clinicId) {
      return res.status(400).json({ success: false, message: "User clinic not found" });
    }

    const subscription = await BrandSubscription.findOne({
      where: { userId: currentUser.id, status: BrandSubscriptionStatus.ACTIVE },
      order: [["createdAt", "DESC"]]
    });
    if (!subscription) {
      return res.status(400).json({ success: false, message: "No active subscription found" });
    }

    const periodStart = subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart) : null;
    const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    if (
      (subscription as any).retriedProductSelectionForCurrentCycle &&
      periodStart && periodEnd && new Date() >= periodStart && new Date() < periodEnd
    ) {
      return res.status(400).json({ success: false, message: "You already retried once for this billing cycle." });
    }

    // Hard delete all mappings for this clinic
    await (await import('./models/TenantProduct')).default.destroy({ where: { clinicId: user.clinicId } as any, force: true } as any);
    await (await import('./models/TenantProductForm')).default.destroy({ where: { clinicId: user.clinicId } as any, force: true } as any);

    await subscription.update({
      productsChangedAmountOnCurrentCycle: 0,
      retriedProductSelectionForCurrentCycle: true,
      lastProductChangeAt: new Date(),
    } as any)

    res.status(200).json({ success: true, message: "Selections cleared. You can choose products again." });
  } catch (error) {
    console.error('❌ Error retrying product selection:', error);
    res.status(500).json({ success: false, message: "Failed to retry product selection" });
  }
});

app.get("/questionnaires/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const questionnaireId = req.params.id;

    const questionnaire = await questionnaireService.getByIdForUser(questionnaireId, currentUser.id);

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: 'Questionnaire not found' });
    }

    res.status(200).json({ success: true, data: questionnaire });
  } catch (error) {
    console.error('❌ Error fetching questionnaire for user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaire' });
  }
});

app.put("/questionnaires/:id/color", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const questionnaireId = req.params.id;
    const { color } = req.body ?? {};

    if (color !== undefined && color !== null) {
      if (typeof color !== 'string' || !/^#([0-9a-fA-F]{6})$/.test(color)) {
        return res.status(400).json({ success: false, message: 'Color must be a valid hex code (e.g. #1A2B3C)' });
      }
    }

    const updated = await questionnaireService.updateColor(questionnaireId, currentUser.id, color ?? null);

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('❌ Error updating questionnaire color:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }

      if (error.message.includes('does not belong')) {
        return res.status(403).json({ success: false, message: error.message });
      }
    }

    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update questionnaire color' });
  }
});

app.post("/questionnaires/import", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const validation = assignTemplatesSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Invalid request body', errors: validation.error.flatten() });
    }

    const assignment = await formTemplateService.assignTemplates({
      tenantId: currentUser.id,
      ...validation.data,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error: any) {
    console.error('❌ Error assigning questionnaire templates:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to assign templates' });
  }
});

app.post("/questionnaires/step", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using questionnaireStepCreateSchema
    const validation = questionnaireStepCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { questionnaireId } = validation.data;

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using questionnaireStepUpdateSchema
    const validation = questionnaireStepUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { stepId, title, description, isDeadEnd, conditionalLogic } = validation.data;

    // Create questionnaire step service instance
    const questionnaireStepService = new QuestionnaireStepService();

    // Update questionnaire step
    const updatedStep = await questionnaireStepService.updateQuestionnaireStep(
      stepId,
      { title, description, isDeadEnd, conditionalLogic: conditionalLogic ?? undefined },
      currentUser.id
    );

    console.log('✅ Questionnaire step updated:', {
      stepId: updatedStep.id,
      title: updatedStep.title,
      description: updatedStep.description,
      isDeadEnd: updatedStep.isDeadEnd,
      conditionalLogic: updatedStep.conditionalLogic,
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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using questionnaireStepOrderSchema
    const validation = questionnaireStepOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { steps, questionnaireId } = validation.data;

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
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using questionCreateSchema
    const validation = questionCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { stepId, questionText, answerType, isRequired, placeholder, helpText, footerNote, conditionalLogic, conditionalLevel, subQuestionOrder, parentQuestionId, options } = validation.data;

    // Create question service instance
    const questionService = new QuestionService();

    // Create question
    const newQuestion = await questionService.createQuestion(
      stepId,
      { questionText, answerType, isRequired, placeholder, helpText, footerNote, conditionalLogic, conditionalLevel, subQuestionOrder, parentQuestionId, options },
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

app.put("/questions/:questionId", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { questionId } = req.params;

    const questionService = new QuestionService();

    const updated = await questionService.updateQuestion(questionId, req.body, currentUser.id);

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updated
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

// Update question
app.put("/questions", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using questionUpdateSchema
    const validation = questionUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { questionId, questionText, answerType, isRequired, placeholder, helpText, footerNote, options } = validation.data;

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

// Reorder step
app.put("/questionnaires/step/reorder", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { stepId, direction } = req.body;

    // Validate required fields
    if (!stepId || !direction) {
      return res.status(400).json({
        success: false,
        message: "stepId and direction are required"
      });
    }

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: "direction must be 'up' or 'down'"
      });
    }

    // Create questionnaire service instance
    const questionnaireService = new QuestionnaireService();

    // Reorder step
    const result = await questionnaireService.reorderStep(stepId, direction, currentUser.id);

    console.log('✅ Step reordered:', {
      stepId,
      direction,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Step reordered successfully",
      data: result
    });

  } catch (error) {
    console.error('❌ Error reordering step:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your clinic') ||
        error.message.includes('cannot move')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to reorder step"
    });
  }
});

// Delete questionnaire
app.delete("/questionnaires/:id", authenticateJWT, async (req, res) => {
  try {
    const { id: questionnaireId } = req.params;
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
        message: "questionnaireId is required"
      });
    }

    // Create questionnaire service instance
    const questionnaireService = new QuestionnaireService();

    // Delete questionnaire
    const result = await questionnaireService.deleteQuestionnaire(questionnaireId, currentUser.id);

    console.log('✅ Questionnaire deleted:', {
      questionnaireId: result.questionnaireId,
      deleted: result.deleted,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Questionnaire deleted successfully",
      data: result
    });

  } catch (error) {
    console.error('❌ Error deleting questionnaire:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') ||
        error.message.includes('does not belong to your account') ||
        error.message.includes('Cannot delete template questionnaires')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete questionnaire"
    });
  }
});

// Update questions order
app.post("/questions/order", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using questionOrderSchema
    const validation = questionOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { questions, stepId } = validation.data;

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
const clinicService = new ClinicService();


app.put("/patient", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using patientUpdateSchema
    const validation = patientUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { address, ...data } = validation.data

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

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using messageCreateSchema
    const validation = messageCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { text, reference_message_id, files } = validation.data;

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

// Get current user's MD patient record
app.get("/md/patient", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findByPk(currentUser.id);
    if (!user || !user.mdPatientId) {
      return res.status(404).json({ success: false, message: "MD patient not found for user" });
    }

    const MDAuthService = (await import('./services/mdIntegration/MDAuth.service')).default;
    const MDPatientService = (await import('./services/mdIntegration/MDPatient.service')).default;

    const tokenResponse = await MDAuthService.generateToken();
    const patient = await MDPatientService.getPatient(user.mdPatientId, tokenResponse.access_token);
    return res.json({ success: true, data: patient });
  } catch (error) {
    console.error('❌ Error fetching MD patient:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch MD patient' });
  }
});

// Get MD case details by caseId
app.get("/md/cases/:caseId", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { caseId } = req.params;
    if (!caseId) {
      return res.status(400).json({ success: false, message: 'caseId is required' });
    }

    const MDAuthService = (await import('./services/mdIntegration/MDAuth.service')).default;
    const MDCaseService = (await import('./services/mdIntegration/MDCase.service')).default;

    const tokenResponse = await MDAuthService.generateToken();
    const mdCase = await MDCaseService.getCase(caseId, tokenResponse.access_token);
    return res.json({ success: true, data: mdCase });
  } catch (error) {
    console.error('❌ Error fetching MD case:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch MD case' });
  }
});

// Get latest MD case for the current user (by most recent order with mdCaseId)
app.get("/md/cases/latest", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const lastOrder = await Order.findOne({
      where: { userId: currentUser.id },
      order: [["createdAt", "DESC"]]
    } as any);

    if (!lastOrder || !(lastOrder as any).mdCaseId) {
      return res.status(404).json({ success: false, message: 'No MD case found for latest order' });
    }

    const caseId = (lastOrder as any).mdCaseId as string;
    const MDAuthService = (await import('./services/mdIntegration/MDAuth.service')).default;
    const MDCaseService = (await import('./services/mdIntegration/MDCase.service')).default;
    const tokenResponse = await MDAuthService.generateToken();
    const mdCase = await MDCaseService.getCase(caseId, tokenResponse.access_token);
    return res.json({ success: true, data: mdCase });
  } catch (error) {
    console.error('❌ Error fetching latest MD case:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch latest MD case' });
  }
});

// Create an MD Integrations Case directly after checkout
// Public endpoint; attempts auth if provided, otherwise infers user from orderId
app.post("/md/cases", async (req, res) => {
  try {
    // TEMPORARY: Skip MD Integrations entirely
    console.log('⚠️ MD Integrations SKIPPED - endpoint disabled temporarily');
    return res.json({
      success: true,
      message: 'MD Integrations skipped (disabled)',
      data: { skipped: true }
    });

    // COMMENTED OUT - MD Integrations disabled temporarily
    /*
    let currentUser: any = null;
    try {
      currentUser = getCurrentUser(req);
    } catch { }
    const { orderId, patientOverrides } = req.body || {};

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    // Load order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If no authenticated user, infer from order
    if (!currentUser) {
      const ownerUser = await User.findByPk((order as any).userId);
      if (!ownerUser) {
        return res.status(404).json({ success: false, message: "User not found for order" });
      }
      currentUser = ownerUser;
    } else {
      // If authenticated, ensure access to order
      if ((order as any).userId !== currentUser.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    // If case already exists, return early
    if ((order as any).mdCaseId) {
      return res.json({ success: true, message: 'MD case already exists', data: { caseId: (order as any).mdCaseId } });
    }

    // Ensure user exists and has mdPatientId
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attempt to populate missing fields from questionnaire answers before syncing
    try {
      const qa = ((order as any).questionnaireAnswers || {}) as Record<string, any>;
      const keys = Object.keys(qa);
      const findAnswer = (substrs: string[]): string | undefined => {
        const key = keys.find(k => substrs.some(s => k.toLowerCase().includes(s)));
        const val = key ? qa[key] : undefined;
        return typeof val === 'string' ? val : (val != null ? String(val) : undefined);
      };

      const dob = findAnswer(['date of birth', 'dob', 'birth']);
      const genderAns = findAnswer(['gender', 'sex']);
      const phoneAns = findAnswer(['mobile', 'phone']);
      const firstNameAns = findAnswer(['first name']);
      const lastNameAns = findAnswer(['last name']);
      const emailAns = findAnswer(['email']);

      console.log('MD Case: extracted fields from QA', {
        hasDob: Boolean(dob),
        hasGender: Boolean(genderAns),
        hasPhone: Boolean(phoneAns)
      });

      const updatePayload: Partial<User> = {} as any;
      if (!user.dob && dob) (updatePayload as any).dob = dob;
      if (!user.gender && genderAns) (updatePayload as any).gender = String(genderAns).toLowerCase();
      if (!user.phoneNumber && phoneAns) (updatePayload as any).phoneNumber = phoneAns;
      if (!user.firstName && firstNameAns) (updatePayload as any).firstName = firstNameAns;
      if (!user.lastName && lastNameAns) (updatePayload as any).lastName = lastNameAns;
      if (!user.email && emailAns) (updatePayload as any).email = emailAns;

      // Apply explicit overrides from client (takes precedence)
      if (patientOverrides && typeof patientOverrides === 'object') {
        const { firstName, lastName, email, dob: dobOv, gender: genderOv, phoneNumber: phoneOv } = patientOverrides as any;
        if (firstName) (updatePayload as any).firstName = String(firstName);
        if (lastName) (updatePayload as any).lastName = String(lastName);
        if (email) (updatePayload as any).email = String(email);
        if (dobOv) (updatePayload as any).dob = String(dobOv);
        if (genderOv) (updatePayload as any).gender = String(genderOv).toLowerCase();
        if (phoneOv) (updatePayload as any).phoneNumber = String(phoneOv);
      }

      if (Object.keys(updatePayload).length > 0) {
        await user.update(updatePayload);
        await user.reload();
      }

      const userService = new UserService();
      await userService.syncPatientInMD(user.id, (order as any).shippingAddressId);
      await user.reload();
    } catch (e) {
      console.warn('⚠️ Could not enrich/sync patient before creating case:', e);
    }

    if (!user.mdPatientId) {
      // Validate required fields and provide actionable details
      const missingOrInvalid: Record<string, string> = {};
      const isValidDate = (value?: string) => {
        if (!value) return false;
        const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
        if (!m) return false;
        const year = Number(m[1]);
        const month = Number(m[2]);
        const day = Number(m[3]);
        if (year < 1900 || year > new Date().getFullYear()) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        return true;
      };

      if (!user.firstName) missingOrInvalid.firstName = 'required';
      if (!user.lastName) missingOrInvalid.lastName = 'required';
      if (!user.email) missingOrInvalid.email = 'required';
      if (!user.dob || !isValidDate(user.dob as any)) missingOrInvalid.dob = 'required (YYYY-MM-DD, realistic)';
      if (!user.gender) missingOrInvalid.gender = 'required (male/female)';
      if (!user.phoneNumber) missingOrInvalid.phoneNumber = 'required (US format)';
      const hasShipping = Boolean((order as any).shippingAddressId);
      console.warn('MD Case: mdPatientId missing after sync', {
        hasDob: Boolean(user.dob),
        hasGender: Boolean(user.gender),
        hasPhone: Boolean(user.phoneNumber),
        hasShipping
      });
      return res.status(400).json({
        success: false,
        message: "User is not provisioned in MD Integrations (missing mdPatientId)",
        details: {
          hasDob: Boolean(user.dob),
          hasGender: Boolean(user.gender),
          hasPhone: Boolean(user.phoneNumber),
          hasShipping,
          missingOrInvalid
        }
      });
    }

    // Resolve offering to use
    let offeringIds: { offering_id: string }[] = [];
    try {
      const mdConfig = (await import('./services/mdIntegration/config')).mdIntegrationsConfig;
      if (mdConfig.defaultOfferingId) {
        offeringIds = [{ offering_id: mdConfig.defaultOfferingId }];
      }
    } catch { }

    if (offeringIds.length === 0) {
      // Try to infer from environment or product metadata
      if (process.env.NODE_ENV !== 'production') {
        // Known sandbox offering for development
        offeringIds = [{ offering_id: '3c3d0118-e362-4466-9c92-d852720c5a41' }];
      } else {
        // Try from related product (via tenantProduct)
        let inferredOfferingId: string | undefined;
        try {
          if ((order as any).tenantProductId) {
            const tenantProduct = await TenantProduct.findByPk((order as any).tenantProductId, {
              include: [{ model: Product, as: 'product', required: false }] as any
            } as any);
            const product = tenantProduct && (tenantProduct as any).product;
            if (product && product.mdCaseId) {
              inferredOfferingId = product.mdCaseId;
            }
          }
        } catch { }
        if (inferredOfferingId) {
          offeringIds = [{ offering_id: inferredOfferingId }];
        }
      }
    }

    // Build case questions from stored questionnaire answers
    const { extractCaseQuestions } = await import('./utils/questionnaireAnswers');
    const caseQuestions = (order as any).questionnaireAnswers
      ? extractCaseQuestions((order as any).questionnaireAnswers)
      : [];

    // Generate token and create case
    const MDAuthService = (await import('./services/mdIntegration/MDAuth.service')).default;
    const MDCaseService = (await import('./services/mdIntegration/MDCase.service')).default;

    const tokenResponse = await MDAuthService.generateToken();

    const casePayload: any = {
      patient_id: user.mdPatientId,
      metadata: `orderId: ${order.id}`,
      hold_status: false,
      case_questions: caseQuestions,
    };
    if (offeringIds.length > 0) {
      (casePayload as any).case_offerings = offeringIds;
    }

    const caseResponse = await MDCaseService.createCase(casePayload, tokenResponse.access_token);

    await order.update({ mdCaseId: (caseResponse as any).case_id });

    return res.json({ success: true, message: 'MD case created', data: { caseId: (caseResponse as any).case_id } });
    */
  } catch (error) {
    console.error('❌ Error creating MD case:', error);
    return res.status(500).json({ success: false, message: 'Failed to create MD case' });
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
      logo: clinic?.logo || '',
      slug: clinic?.slug || '',
      isCustomDomain: (clinic as any)?.isCustomDomain || false,
      customDomain: (clinic as any)?.customDomain || '',
      defaultFormColor: (clinic as any)?.defaultFormColor || ''
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

    // Validate request body using organizationUpdateSchema
    const validation = organizationUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { businessName, phone, address, city, state, zipCode, website } = validation.data as any;
    const isCustomDomain = (validation.data as any).isCustomDomain as boolean | undefined;
    let customDomain = (validation.data as any).customDomain as string | undefined;
    const defaultFormColor = (validation.data as any).defaultFormColor as string | undefined;

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

    // Update clinic fields (Clinic has name, slug, logo, active, status, isCustomDomain, customDomain, defaultFormColor)
    let updatedClinic: any = null;
    if (user.clinicId) {
      const clinic = await Clinic.findByPk(user.clinicId);
      if (clinic) {
        const updateData: any = {};

        if (businessName) {
          updateData.name = businessName;
        }

        if (isCustomDomain !== undefined) {
          updateData.isCustomDomain = isCustomDomain;
        }

        if (customDomain !== undefined) {
          // Normalize custom domain to bare hostname (lowercase, no protocol/path/trailing dot)
          try {
            const candidate = customDomain.trim();
            const url = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
            let host = url.hostname.toLowerCase();
            if (host.endsWith('.')) host = host.slice(0, -1);
            updateData.customDomain = host;
          } catch {
            // Fallback to raw value (will be validated elsewhere if needed)
            updateData.customDomain = customDomain;
          }
        }

        // Update default form color if provided
        if (defaultFormColor !== undefined) {
          // Validate color format if not empty
          if (defaultFormColor && !/^#([0-9a-fA-F]{6})$/.test(defaultFormColor)) {
            return res.status(400).json({
              success: false,
              message: 'Default form color must be a valid hex code (e.g. #1A2B3C)'
            });
          }
          updateData.defaultFormColor = defaultFormColor || null;
        }

        await clinic.update(updateData);
        updatedClinic = clinic;
      }
    }

    res.json({
      success: true, message: "Organization updated successfully", data: {
        clinic: updatedClinic ? {
          id: updatedClinic.id,
          slug: updatedClinic.slug,
          name: updatedClinic.name,
          isCustomDomain: updatedClinic.isCustomDomain,
          customDomain: updatedClinic.customDomain,
          logo: updatedClinic.logo,
          active: updatedClinic.isActive,
          status: updatedClinic.status,
          defaultFormColor: updatedClinic.defaultFormColor,
        } : null
      }
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Verify custom domain CNAME
app.post("/organization/verify-domain", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { customDomain } = req.body;

    if (!customDomain) {
      return res.status(400).json({ success: false, message: "Custom domain is required" });
    }

    // Get user's clinic
    const user = await User.findByPk(currentUser.id, {
      include: [{ model: Clinic, as: 'clinic' }]
    });

    if (!user || !user.clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }

    const expectedCname = `${user.clinic.slug}.fuse.health`;

    try {
      // Try to get CNAME records for the custom domain
      const cnameRecords = await dns.resolveCname(customDomain);

      if (cnameRecords && cnameRecords.length > 0) {
        const actualCname = cnameRecords[0];

        // Check if CNAME points to the correct subdomain
        if (actualCname === expectedCname || actualCname === `${expectedCname}.`) {
          return res.json({
            success: true,
            verified: true,
            message: "Domain verified successfully!",
            actualCname: actualCname,
            expectedCname: expectedCname
          });
        } else {
          // CNAME exists but points to different domain
          return res.json({
            success: true,
            verified: false,
            message: `CNAME is configured but points to a different domain`,
            actualCname: actualCname,
            expectedCname: expectedCname,
            error: "CNAME_MISMATCH"
          });
        }
      } else {
        return res.json({
          success: true,
          verified: false,
          message: "No CNAME record found for this domain",
          expectedCname: expectedCname,
          error: "NO_CNAME"
        });
      }
    } catch (dnsError: any) {
      // DNS lookup failed - domain doesn't exist or no CNAME configured
      console.log('DNS lookup error:', dnsError.code);

      if (dnsError.code === 'ENODATA' || dnsError.code === 'ENOTFOUND') {
        return res.json({
          success: true,
          verified: false,
          message: "No CNAME record found. Please configure your DNS.",
          expectedCname: expectedCname,
          error: "NO_CNAME"
        });
      }

      return res.json({
        success: true,
        verified: false,
        message: "Unable to verify domain. Please try again later.",
        expectedCname: expectedCname,
        error: "DNS_ERROR"
      });
    }
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Allow custom domain (for Caddy on-demand TLS "ask")
app.get("/clinic/allow-custom-domain", async (req, res) => {
  try {
    const domainParam = (req.query as any).domain as string | undefined;
    if (!domainParam) {
      return res.status(400).send("domain required");
    }

    // Normalize to hostname
    let baseDomain = domainParam;
    try {
      const url = new URL(domainParam.startsWith('http') ? domainParam : `https://${domainParam}`);
      baseDomain = url.hostname;
    } catch {
      baseDomain = domainParam.split('/')[0].split('?')[0];
    }

    const clinic = await Clinic.findOne({
      where: { customDomain: baseDomain, isCustomDomain: true },
      attributes: ['id']
    });

    if (!clinic) {
      return res.status(404).send("not allowed");
    }

    return res.status(200).send("ok");
  } catch (error) {
    console.error('❌ Error in /clinic/allow-custom-domain:', error);
    return res.status(500).send("error");
  }
});

// Get clinic slug by custom domain
app.post("/clinic/by-custom-domain", async (req, res) => {
  try {
    const { domain } = req.body;
    console.log('clinic/by-custom-domain Edu', domain);
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domain is required"
      });
    }

    // Extract base URL (remove path, query params, etc)
    let baseDomain = domain;
    try {
      const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      baseDomain = url.hostname;
    } catch (e) {
      // If URL parsing fails, use the domain as is
      baseDomain = domain.split('/')[0].split('?')[0];
    }

    console.log(`🔍 Looking for clinic with custom domain: ${baseDomain}`);

    // Search for clinic with matching customDomain
    const clinic = await Clinic.findOne({
      where: {
        customDomain: baseDomain,
        isCustomDomain: true
      },
      attributes: ['id', 'slug', 'name', 'logo', 'customDomain']
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "No clinic found with this custom domain",
        domain: baseDomain
      });
    }

    console.log(`✅ Found clinic: ${clinic.name} with slug: ${clinic.slug}`);

    res.json({
      success: true,
      slug: clinic.slug,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        logo: clinic.logo,
        customDomain: clinic.customDomain
      }
    });

  } catch (error) {
    console.error('❌ Error finding clinic by custom domain:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
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

    // Retry product selection: clears TenantProduct and TenantProductForm for current clinic, once per cycle
    app.post("/tenant-products/retry-selection", authenticateJWT, async (req, res) => {
      try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
          return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await User.findByPk(currentUser.id);
        if (!user || !user.clinicId) {
          return res.status(400).json({ success: false, message: "User clinic not found" });
        }

        const subscription = await BrandSubscription.findOne({
          where: { userId: currentUser.id, status: BrandSubscriptionStatus.ACTIVE },
          order: [["createdAt", "DESC"]]
        });
        if (!subscription) {
          return res.status(400).json({ success: false, message: "No active subscription found" });
        }

        const periodStart = subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart) : null;
        const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
        if (
          (subscription as any).retriedProductSelectionForCurrentCycle &&
          periodStart && periodEnd && new Date() >= periodStart && new Date() < periodEnd
        ) {
          return res.status(400).json({ success: false, message: "You already retried once for this billing cycle." });
        }

        // Hard delete all mappings for this clinic
        await (await import('./models/TenantProduct')).default.destroy({ where: { clinicId: user.clinicId } as any, force: true } as any);
        await (await import('./models/TenantProductForm')).default.destroy({ where: { clinicId: user.clinicId } as any, force: true } as any);

        await subscription.update({
          productsChangedAmountOnCurrentCycle: 0,
          retriedProductSelectionForCurrentCycle: true,
          lastProductChangeAt: new Date(),
        } as any)

        res.status(200).json({ success: true, message: "Selections cleared. You can choose products again." });
      } catch (error) {
        console.error('❌ Error retrying product selection:', error);
        res.status(500).json({ success: false, message: "Failed to retry product selection" });
      }
    });
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
      where: { userId: currentUser.id, status: BrandSubscriptionStatus.ACTIVE },
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
        type: plan.planType,
        maxProducts: typeof (plan as any).maxProducts === 'number' ? (plan as any).maxProducts : undefined
      } : subscription.stripePriceId ? {
        name: subscription.planType,
        price: subscription.monthlyPrice ? Number(subscription.monthlyPrice) : 0,
        type: subscription.planType,
        priceId: subscription.stripePriceId,
        maxProducts: subscription.features && typeof (subscription.features as any).maxProducts === 'number' ? (subscription.features as any).maxProducts : undefined
      } : null,
      nextBillingDate: subscription.currentPeriodEnd || null,
      lastProductChangeAt: subscription.lastProductChangeAt || null,
      productsChangedAmountOnCurrentCycle: subscription.productsChangedAmountOnCurrentCycle || 0,
      retriedProductSelectionForCurrentCycle: !!(subscription as any).retriedProductSelectionForCurrentCycle
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
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

// ========================================
// Dashboard Analytics Endpoints
// ========================================

// Get dashboard metrics
app.get("/dashboard/metrics", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { startDate, endDate, clinicId } = req.query;

    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ success: false, message: "clinicId is required" });
    }

    // Verify user has access to this clinic
    const user = await User.findByPk(currentUser.id);
    if (!user || user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: "Access denied to this clinic" });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const dashboardService = new DashboardService();
    const metrics = await dashboardService.getDashboardMetrics(clinicId, { start, end });

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard metrics" });
  }
});

// Get revenue chart data
app.get("/dashboard/revenue-chart", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { startDate, endDate, interval, clinicId } = req.query;

    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ success: false, message: "clinicId is required" });
    }

    // Verify user has access to this clinic
    const user = await User.findByPk(currentUser.id);
    if (!user || user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: "Access denied to this clinic" });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    const chartInterval = (interval === 'daily' || interval === 'weekly') ? interval : 'daily';

    const dashboardService = new DashboardService();
    const chartData = await dashboardService.getRevenueOverTime(clinicId, { start, end }, chartInterval);

    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue chart" });
  }
});

// Get earnings report
app.get("/dashboard/earnings-report", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { startDate, endDate, clinicId } = req.query;

    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ success: false, message: "clinicId is required" });
    }

    // Verify user has access to this clinic
    const user = await User.findByPk(currentUser.id);
    if (!user || user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: "Access denied to this clinic" });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const dashboardService = new DashboardService();
    const earningsReport = await dashboardService.getEarningsReport(clinicId, { start, end });

    res.json({ success: true, data: earningsReport });
  } catch (error) {
    console.error('Error fetching earnings report:', error);
    res.status(500).json({ success: false, message: "Failed to fetch earnings report" });
  }
});

// Get recent activity
app.get("/dashboard/recent-activity", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { limit, clinicId } = req.query;

    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ success: false, message: "clinicId is required" });
    }

    // Verify user has access to this clinic
    const user = await User.findByPk(currentUser.id);
    if (!user || user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: "Access denied to this clinic" });
    }

    const activityLimit = limit ? parseInt(limit as string) : 10;

    const dashboardService = new DashboardService();
    const recentActivity = await dashboardService.getRecentActivity(clinicId, activityLimit);

    res.json({ success: true, data: recentActivity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: "Failed to fetch recent activity" });
  }
});

// Get projected recurring revenue (for remaining days of month)
app.get("/dashboard/projected-revenue", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { endDate, daysToProject, clinicId } = req.query;

    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ success: false, message: "clinicId is required" });
    }

    if (!daysToProject) {
      return res.status(400).json({ success: false, message: "daysToProject is required" });
    }

    // Verify user has access to this clinic
    const user = await User.findByPk(currentUser.id);
    if (!user || user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: "Access denied to this clinic" });
    }

    const projectionEndDate = endDate ? new Date(endDate as string) : new Date();
    const days = parseInt(daysToProject as string);

    const dashboardService = new DashboardService();
    const projectedRevenue = await dashboardService.getProjectedRecurringRevenue(clinicId, projectionEndDate, days);

    res.json({ success: true, data: projectedRevenue });
  } catch (error) {
    console.error('Error fetching projected revenue:', error);
    res.status(500).json({ success: false, message: "Failed to fetch projected revenue" });
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

  const httpServer = app.listen(PORT, () => {
    console.log(`🚀 API listening on :${PORT}`);
    console.log('📊 Database connected successfully');
    console.log('🔒 HIPAA-compliant security features enabled');
  });

  // Initialize WebSocket server
  const WebSocketService = (await import('./services/websocket.service')).default;
  WebSocketService.initialize(httpServer);
  console.log('🔌 WebSocket server initialized');

  // Start auto-approval service
  const AutoApprovalService = (await import('./services/autoApproval.service')).default;
  AutoApprovalService.start();
  console.log('🤖 Auto-approval service started');

  // List MD offerings for current user (approved and pending)
  app.get("/md/offerings", authenticateJWT, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const limit = Math.min(parseInt(String((req.query as any).limit || '50'), 10) || 50, 200);
      const offset = parseInt(String((req.query as any).offset || '0'), 10) || 0;

      const orders = await Order.findAll({
        where: { userId: currentUser.id },
        order: [["createdAt", "DESC"]] as any,
        limit,
        offset
      } as any);

      const flattened: any[] = [];
      for (const order of orders) {
        const mdCaseId = (order as any).mdCaseId;
        const mdOfferings = (order as any).mdOfferings as any[] | null | undefined;
        const tenantProduct = (order as any).tenantProduct;
        const questionnaireAnswers = (order as any).questionnaireAnswers;

        // Helper function to get product details from TenantProduct
        const getTenantProductDetails = async () => {
          const tenantProductId = (order as any).tenantProductId;
          if (!tenantProductId) return null;

          try {
            const tenantProduct = await TenantProduct.findByPk(tenantProductId, {
              include: [
                {
                  model: Product,
                  as: 'product'
                }
              ]
            });

            if (!tenantProduct) return null;

            return {
              id: tenantProduct.id,
              name: tenantProduct.product?.name || 'Product',
              description: tenantProduct.product?.description || null,
              dosage: tenantProduct.product?.dosage || null,
              category: tenantProduct.product?.category || null,
              stripePriceId: tenantProduct.stripePriceId || null,
              isActive: tenantProduct.isActive ?? true
            };
          } catch (error) {
            console.error('Error fetching TenantProduct:', error);
            return null;
          }
        };

        // Helper function to process questionnaire answers
        const getQuestionnaireAnswers = () => {
          if (!questionnaireAnswers) return null;

          // Check if it's the new structured format (simplified check)
          if (questionnaireAnswers && typeof questionnaireAnswers === 'object' && 'answers' in questionnaireAnswers && 'metadata' in questionnaireAnswers) {
            return {
              format: 'structured',
              answers: questionnaireAnswers.answers,
              metadata: questionnaireAnswers.metadata
            };
          } else {
            return {
              format: 'legacy',
              answers: questionnaireAnswers
            };
          }
        };

        // Get TenantProduct details
        const tenantProductDetails = await getTenantProductDetails();
        const questionnaireAnswersData = getQuestionnaireAnswers();

        // Determine status and classification based on approvedByDoctor field
        const orderStatus = (order as any).status;
        const approvedByDoctor = (order as any).approvedByDoctor || false;
        let status = orderStatus || 'pending';
        let classification: 'approved' | 'pending' = approvedByDoctor ? 'approved' : 'pending';
        let title = tenantProductDetails?.name || 'Order';

        // Store MD offerings count for reference
        const hasMdOfferings = Array.isArray(mdOfferings) && mdOfferings.length > 0;

        // Create ONE entry per order (not per MD offering)
        flattened.push({
          orderId: order.id,
          orderNumber: (order as any).orderNumber,
          caseId: mdCaseId,
          offeringId: null,
          caseOfferingId: null,
          title: title,
          productId: null,
          productType: null,
          status: status,
          orderStatus: orderStatus,
          createdAt: (order as any).createdAt,
          updatedAt: (order as any).updatedAt,
          classification,
          // Enhanced details with TenantProduct and questionnaire answers
          tenantProduct: tenantProductDetails,
          questionnaireAnswers: questionnaireAnswersData,
          // Store MD offerings count for reference
          mdOfferingsCount: hasMdOfferings ? mdOfferings.length : 0
        });
      }

      return res.json({ success: true, data: flattened });
    } catch (error) {
      console.error('❌ Error listing MD offerings:', error);
      return res.status(500).json({ success: false, message: 'Failed to list MD offerings' });
    }
  });

  // Get offerings for a specific MD case
  app.get("/md/cases/:caseId/offerings", authenticateJWT, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { caseId } = req.params as any;
      if (!caseId) {
        return res.status(400).json({ success: false, message: 'caseId is required' });
      }

      const MDAuthService = (await import('./services/mdIntegration/MDAuth.service')).default;
      const MDCaseService = (await import('./services/mdIntegration/MDCase.service')).default;
      const tokenResponse = await MDAuthService.generateToken();
      const offerings = await MDCaseService.getCaseOfferings(caseId, tokenResponse.access_token);

      return res.json({ success: true, data: offerings });
    } catch (error) {
      console.error('❌ Error fetching MD case offerings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch MD case offerings' });
    }
  });

  // One-off: resync MD case details onto the order (NO AUTH by request)
  // Body: { caseId: string }
  app.post("/md/resync", async (req, res) => {
    try {
      const { caseId } = req.body || {};
      if (!caseId || typeof caseId !== 'string') {
        return res.status(400).json({ success: false, message: 'caseId is required' });
      }

      const MDWebhookService = (await import('./services/mdIntegration/MDWebhook.service')).default;
      await MDWebhookService.resyncCaseDetails(caseId);

      return res.json({ success: true, message: 'Resync triggered', caseId });
    } catch (error) {
      console.error('❌ Error in /md/resync:', error);
      return res.status(500).json({ success: false, message: 'Failed to resync case details' });
    }
  });

  // ============= DOCTOR PORTAL ENDPOINTS =============
  const { registerDoctorEndpoints } = await import('./endpoints/doctor');
  registerDoctorEndpoints(app, authenticateJWT, getCurrentUser);

  // ============= PHARMACY MANAGEMENT ENDPOINTS =============
  const { registerPharmacyEndpoints } = await import('./endpoints/pharmacy');
  registerPharmacyEndpoints(app, authenticateJWT, getCurrentUser);

  // ============================================
  // DOCTOR-PATIENT CHAT ENDPOINTS
  // ============================================

  // Get all conversations for a doctor
  app.get("/doctor/chats", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'doctor') {
        return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
      }

      const chats = await DoctorPatientChats.findAll({
        where: { doctorId: currentUser.id },
        order: [['lastMessageAt', 'DESC']]
      });

      // Manually load patient data for each chat
      const chatsWithPatients = await Promise.all(
        chats.map(async (chat) => {
          const patient = await User.findByPk(chat.patientId, {
            attributes: ['id', 'firstName', 'lastName', 'email']
          });

          return {
            ...chat.toJSON(),
            patient: patient ? patient.toJSON() : null
          };
        })
      );

      res.json({
        success: true,
        data: chatsWithPatients
      });

    } catch (error) {
      console.error('❌ Error fetching doctor chats:', error);
      res.status(500).json({ success: false, message: "Failed to fetch chats" });
    }
  });

  // Get specific conversation messages
  app.get("/doctor/chats/:chatId", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'doctor') {
        return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
      }

      const { chatId } = req.params;

      const chat = await DoctorPatientChats.findOne({
        where: {
          id: chatId,
          doctorId: currentUser.id
        }
      });

      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      // Manually load patient data
      const patient = await User.findByPk(chat.patientId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      const chatWithPatient = {
        ...chat.toJSON(),
        patient: patient ? patient.toJSON() : null
      };

      res.json({
        success: true,
        data: chatWithPatient
      });

    } catch (error) {
      console.error('❌ Error fetching chat:', error);
      res.status(500).json({ success: false, message: "Failed to fetch chat" });
    }
  });

  // Upload file for chat (doctor only)
  app.post("/doctor/chat/upload-file", authenticateJWT, upload.single('file'), async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'doctor') {
        return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      // Validate file size
      if (!isValidFileSize(req.file.size)) {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB."
        });
      }

      // Validate file type (images and PDFs)
      if (!isValidImageFile(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only images (JPEG, PNG, WebP) and PDF files are allowed."
        });
      }

      // Upload to S3 in chat-files folder
      const fileUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'chat-files', // Folder específico para archivos del chat
        `doctor-${currentUser.id}` // Prefix con ID del doctor
      );

      console.log('📎 File uploaded for chat:', {
        userId: currentUser.id,
        fileName: req.file.originalname,
        fileUrl
      });

      res.json({
        success: true,
        data: {
          url: fileUrl,
          fileName: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size
        }
      });

    } catch (error) {
      console.error('❌ Error uploading chat file:', error);
      res.status(500).json({ success: false, message: "Failed to upload file" });
    }
  });

  // Send a message in a conversation
  app.post("/doctor/chats/:chatId/messages", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'doctor') {
        return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
      }

      const { chatId } = req.params;
      const { message, attachments } = req.body;

      // Validate: message is required OR attachments are provided
      if ((!message || typeof message !== 'string' || message.trim().length === 0) && (!attachments || !Array.isArray(attachments) || attachments.length === 0)) {
        return res.status(400).json({ success: false, message: "Message or attachments are required" });
      }

      // Validate attachments if provided
      if (attachments && Array.isArray(attachments)) {
        if (attachments.length > 10) {
          return res.status(400).json({ success: false, message: "Maximum 10 attachments allowed per message" });
        }
        // Validate that all attachments are valid URLs
        for (const url of attachments) {
          if (typeof url !== 'string' || !url.startsWith('https://')) {
            return res.status(400).json({ success: false, message: "Invalid attachment URL format" });
          }
        }
      }

      const chat = await DoctorPatientChats.findOne({
        where: {
          id: chatId,
          doctorId: currentUser.id
        }
      });

      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      // Create new message with optional attachments
      const newMessage: any = {
        id: require('crypto').randomUUID(),
        senderId: currentUser.id,
        senderRole: 'doctor' as const,
        message: message ? message.trim() : '',
        createdAt: new Date().toISOString(),
        read: false
      };

      // Add attachments if provided
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        newMessage.attachments = attachments;
      }

      // Add message to array
      const updatedMessages = [...(chat.messages || []), newMessage];

      // Update chat - reset doctor's unread count to 0 since they're sending a message
      await chat.update({
        messages: updatedMessages,
        lastMessageAt: new Date(),
        unreadCountPatient: chat.unreadCountPatient + 1,
        unreadCountDoctor: 0
      });

      // Reload and manually add patient data
      await chat.reload();
      const patient = await User.findByPk(chat.patientId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      const chatWithPatient = {
        ...chat.toJSON(),
        patient: patient ? patient.toJSON() : null
      };

      // Emit WebSocket event for new message
      WebSocketService.emitChatMessage({
        chatId: chat.id,
        doctorId: chat.doctorId,
        patientId: chat.patientId,
        message: newMessage
      });

      // Emit updated unread count to patient
      WebSocketService.emitUnreadCountUpdate(chat.patientId, chat.unreadCountPatient);

      // Emit doctor's unread count (reset to 0 since they sent the message)
      WebSocketService.emitUnreadCountUpdate(chat.doctorId, 0);

      res.json({
        success: true,
        data: {
          message: newMessage,
          chat: chatWithPatient
        }
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  });

  // Mark messages as read
  app.post("/doctor/chats/:chatId/mark-read", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'doctor') {
        return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
      }

      const { chatId } = req.params;

      const chat = await DoctorPatientChats.findOne({
        where: {
          id: chatId,
          doctorId: currentUser.id
        }
      });

      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      // Mark all messages from patient as read
      const updatedMessages = (chat.messages || []).map((msg: any) => {
        if (msg.senderRole === 'patient' && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });

      // Update chat
      await chat.update({
        messages: updatedMessages,
        unreadCountDoctor: 0
      });

      res.json({
        success: true,
        data: chat
      });

    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      res.status(500).json({ success: false, message: "Failed to mark messages as read" });
    }
  });

  // ============================================
  // PATIENT CHAT ENDPOINTS
  // ============================================

  // Get unread messages count for patient (lightweight endpoint)
  app.get("/patient/chat/unread-count", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'patient') {
        return res.status(403).json({ success: false, message: "Access denied. Patient role required." });
      }

      // Find patient's chat
      const chat = await DoctorPatientChats.findOne({
        where: { patientId: currentUser.id },
        attributes: ['unreadCountPatient'] // Only fetch the unread count
      });

      const unreadCount = chat ? chat.unreadCountPatient : 0;

      res.json({
        success: true,
        data: { unreadCount }
      });

    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      res.status(500).json({ success: false, message: "Failed to fetch unread count" });
    }
  });

  // Get patient's chat with their doctor
  app.get("/patient/chat", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'patient') {
        return res.status(403).json({ success: false, message: "Access denied. Patient role required." });
      }

      // A patient only has one chat (with their assigned doctor)
      let chat = await DoctorPatientChats.findOne({
        where: { patientId: currentUser.id }
      });

      if (!chat) {
        // Try to auto-assign default doctor
        console.log('📋 No chat found for patient, attempting to auto-assign default doctor...');

        try {
          // Look up the default doctor by email
          const defaultDoctor = await User.findOne({
            where: { email: 'dmeursing@yahoo.com', role: 'doctor' }
          });

          if (!defaultDoctor) {
            return res.json({
              success: true,
              data: null,
              message: "No chat found. You don't have an assigned doctor yet.",
              autoAssignAttempted: true,
              autoAssignError: "Default doctor (dmeursing@yahoo.com) not found in the system."
            });
          }

          // Create new chat with default doctor
          chat = await DoctorPatientChats.create({
            doctorId: defaultDoctor.id,
            patientId: currentUser.id,
            messages: [],
            unreadCountDoctor: 0,
            unreadCountPatient: 0
          });

          console.log('✅ Successfully auto-assigned default doctor to patient');

          // Load doctor data for response
          const doctor = await User.findByPk(chat.doctorId, {
            attributes: ['id', 'firstName', 'lastName', 'email']
          });

          const chatWithDoctor = {
            ...chat.toJSON(),
            doctor: doctor ? doctor.toJSON() : null
          };

          return res.json({
            success: true,
            data: chatWithDoctor,
            autoAssigned: true,
            message: `Successfully assigned Dr. ${defaultDoctor.firstName} ${defaultDoctor.lastName} as your doctor.`
          });

        } catch (autoAssignError: any) {
          console.error('❌ Error auto-assigning doctor:', autoAssignError);
          return res.json({
            success: true,
            data: null,
            message: "No chat found. You don't have an assigned doctor yet.",
            autoAssignAttempted: true,
            autoAssignError: `Failed to auto-assign doctor: ${autoAssignError.message}`
          });
        }
      }

      // Manually load doctor data
      const doctor = await User.findByPk(chat.doctorId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      const chatWithDoctor = {
        ...chat.toJSON(),
        doctor: doctor ? doctor.toJSON() : null
      };

      res.json({
        success: true,
        data: chatWithDoctor
      });

    } catch (error) {
      console.error('❌ Error fetching patient chat:', error);
      res.status(500).json({ success: false, message: "Failed to fetch chat" });
    }
  });

  // Upload file for chat (patient only)
  app.post("/patient/chat/upload-file", authenticateJWT, upload.single('file'), async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'patient') {
        return res.status(403).json({ success: false, message: "Access denied. Patient role required." });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      // Validate file size
      if (!isValidFileSize(req.file.size)) {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB."
        });
      }

      // Validate file type (images and PDFs)
      if (!isValidImageFile(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only images (JPEG, PNG, WebP) and PDF files are allowed."
        });
      }

      // Upload to S3 in chat-files folder
      const fileUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'chat-files', // Folder específico para archivos del chat
        `patient-${currentUser.id}` // Prefix con ID del paciente
      );

      console.log('📎 File uploaded for chat:', {
        userId: currentUser.id,
        fileName: req.file.originalname,
        fileUrl
      });

      res.json({
        success: true,
        data: {
          url: fileUrl,
          fileName: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size
        }
      });

    } catch (error) {
      console.error('❌ Error uploading chat file:', error);
      res.status(500).json({ success: false, message: "Failed to upload file" });
    }
  });

  // Send a message from patient to doctor
  app.post("/patient/chat/messages", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'patient') {
        return res.status(403).json({ success: false, message: "Access denied. Patient role required." });
      }

      const { message, attachments } = req.body;

      // Validate: message is required OR attachments are provided
      if ((!message || typeof message !== 'string' || message.trim().length === 0) && (!attachments || !Array.isArray(attachments) || attachments.length === 0)) {
        return res.status(400).json({ success: false, message: "Message or attachments are required" });
      }

      // Validate attachments if provided
      if (attachments && Array.isArray(attachments)) {
        if (attachments.length > 10) {
          return res.status(400).json({ success: false, message: "Maximum 10 attachments allowed per message" });
        }
        // Validate that all attachments are valid URLs
        for (const url of attachments) {
          if (typeof url !== 'string' || !url.startsWith('https://')) {
            return res.status(400).json({ success: false, message: "Invalid attachment URL format" });
          }
        }
      }

      // Find or create chat
      let chat = await DoctorPatientChats.findOne({
        where: { patientId: currentUser.id }
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "No chat found. You don't have an assigned doctor yet."
        });
      }

      // Create new message with optional attachments
      const newMessage: any = {
        id: require('crypto').randomUUID(),
        senderId: currentUser.id,
        senderRole: 'patient' as const,
        message: message ? message.trim() : '',
        createdAt: new Date().toISOString(),
        read: false
      };

      // Add attachments if provided
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        newMessage.attachments = attachments;
      }

      // Add message to array
      const updatedMessages = [...(chat.messages || []), newMessage];

      // Update chat - reset patient's unread count to 0 since they're sending a message
      await chat.update({
        messages: updatedMessages,
        lastMessageAt: new Date(),
        unreadCountDoctor: chat.unreadCountDoctor + 1,
        unreadCountPatient: 0
      });

      // Reload and manually add doctor data
      await chat.reload();
      const doctor = await User.findByPk(chat.doctorId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      const chatWithDoctor = {
        ...chat.toJSON(),
        doctor: doctor ? doctor.toJSON() : null
      };

      // Emit WebSocket event for new message
      WebSocketService.emitChatMessage({
        chatId: chat.id,
        doctorId: chat.doctorId,
        patientId: chat.patientId,
        message: newMessage
      });

      // Emit updated unread count to doctor
      WebSocketService.emitUnreadCountUpdate(chat.doctorId, chat.unreadCountDoctor);

      // Emit patient's unread count (reset to 0 since they sent the message)
      WebSocketService.emitUnreadCountUpdate(chat.patientId, 0);

      res.json({
        success: true,
        data: {
          message: newMessage,
          chat: chatWithDoctor
        }
      });

    } catch (error) {
      console.error('❌ Error sending patient message:', error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  });

  // Mark messages as read for patient
  app.post("/patient/chat/mark-read", authenticateJWT, async (req: any, res: any) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      if (currentUser.role !== 'patient') {
        return res.status(403).json({ success: false, message: "Access denied. Patient role required." });
      }

      const chat = await DoctorPatientChats.findOne({
        where: { patientId: currentUser.id }
      });

      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      // Mark all messages from doctor as read
      const updatedMessages = (chat.messages || []).map((msg: any) => {
        if (msg.senderRole === 'doctor' && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });

      // Update chat
      await chat.update({
        messages: updatedMessages,
        unreadCountPatient: 0
      });

      // Load doctor data
      const doctor = await User.findByPk(chat.doctorId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      const chatWithDoctor = {
        ...chat.toJSON(),
        doctor: doctor ? doctor.toJSON() : null
      };

      // Emit updated unread count to patient (reset to 0)
      WebSocketService.emitUnreadCountUpdate(currentUser.id, 0);

      res.json({
        success: true,
        data: chatWithDoctor
      });

    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      res.status(500).json({ success: false, message: "Failed to mark messages as read" });
    }
  });

  // ============= MD INTEGRATIONS WEBHOOKS =============

  // MD Integrations Webhook (raw body required for signature verification)
  // Accept any content-type as raw so signature can be computed on exact bytes
  app.post("/md/webhooks", express.raw({ type: () => true }), async (req, res) => {
    const requestId = (req.headers['x-request-id'] as string) || Math.random().toString(36).slice(2);
    try {
      // Lazy import to avoid circular deps at module init
      const { default: MDWebhookService } = await import('./services/mdIntegration/MDWebhook.service');

      const signatureHeaderName = process.env.MD_INTEGRATIONS_WEBHOOK_SIGNATURE_HEADER || 'x-md-signature';
      const providedSignature = (req.headers[signatureHeaderName] as string) || (req.headers['signature'] as string) || '';
      const authorization = (req.headers['authorization'] as string) || '';

      // Grab raw body bytes and content-type for logging and signature
      const rawBuf: Buffer | undefined = (req as any).body instanceof Buffer ? (req as any).body : undefined;
      const rawBody = rawBuf ? rawBuf.toString('utf8') : '';
      const contentType = (req.headers['content-type'] as string) || 'unknown';

      // Parse JSON or form if possible (without affecting signature calc)
      let payload: any = undefined;
      try {
        if (contentType.includes('application/json')) {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          // Basic URL-encoded parse
          payload = Object.fromEntries(new URLSearchParams(rawBody));
        } else {
          // Attempt JSON parse as a best-effort
          payload = rawBody ? JSON.parse(rawBody) : {};
        }
      } catch (e) {
        console.warn(`[MD-WH] reqId=${requestId} body parse failed; continuing with raw string`);
        payload = {};
      }

      const secret = process.env.MD_INTEGRATIONS_WEBHOOK_SECRET || '';
      let signatureValid = true;
      if (secret) {
        // Verify against exact raw body string
        signatureValid = MDWebhookService.verifyWebhookSignature(providedSignature, rawBody, secret);
      }

      console.log(`[MD-WH] reqId=${requestId} received`, {
        event_type: payload?.event_type,
        case_id: payload?.case_id,
        patient_id: payload?.patient_id,
        signature_present: Boolean(providedSignature),
        signature_valid: signatureValid,
        header_sig_name: signatureHeaderName,
        auth_present: Boolean(authorization),
        content_type: contentType,
        body_preview: rawBody?.slice(0, 300)
      });

      if (secret && !signatureValid) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      await MDWebhookService.processMDWebhook(payload);

      console.log(`[MD-WH] reqId=${requestId} processed`, { event_type: payload?.event_type });
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error(`[MD-WH] reqId=${requestId} error`, error);
      return res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
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
        active: treatment.isActive,
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

    // Validate request body using brandTreatmentSchema
    const validation = brandTreatmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    const { treatmentId, brandLogo, brandColor } = validation.data;

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

// Public: get product form by clinic slug + product slug
app.get("/public/brand-products/:clinicSlug/:slug", async (req, res) => {
  try {
    const { clinicSlug, slug } = req.params;

    const clinic = await Clinic.findOne({ where: { slug: clinicSlug } });
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }

    console.log('Public: get product form by clinic slug + product slug Edu', clinicSlug, slug);
    // First try legacy enablement via TenantProduct (selected products)
    // First try legacy enablement via TenantProduct (selected products)
    const tenantProduct = await TenantProduct.findOne({
      where: { clinicId: clinic.id },
      include: [
        {
          model: Product,
          required: true,
          where: { slug },
        },
        {
          model: Questionnaire,
          required: false,
        },
      ],
    });
    console.log('Public: tenantProduct Edu', tenantProduct);

    if (tenantProduct && tenantProduct.product) {
      const product = tenantProduct.product as any;
      // Try to resolve currentFormVariant from TenantProductForm for the same clinic/product
      let currentFormVariant: string | null = null;
      try {
        const tpf = await TenantProductForm.findOne({ where: { clinicId: clinic.id, productId: product.id } as any });
        currentFormVariant = (tpf as any)?.currentFormVariant ?? null;
      } catch { }

      // Always check for the most recently attached form via Questionnaire.productId
      // This takes precedence over TenantProduct.questionnaireId to ensure form switching works
      let questionnaireId = tenantProduct.questionnaireId || null;
      try {
        const productQuestionnaire = await Questionnaire.findOne({
          where: {
            productId: product.id,
            formTemplateType: 'normal'
          },
          order: [['updatedAt', 'DESC']]
        });
        if (productQuestionnaire) {
          questionnaireId = productQuestionnaire.id;
          console.log('✅ Using questionnaire from Questionnaire.productId:', questionnaireId);
        } else if (questionnaireId) {
          console.log('⚠️ No Questionnaire.productId found, falling back to TenantProduct.questionnaireId:', questionnaireId);
        }
      } catch (e) {
        console.error('Error finding product questionnaire:', e);
      }

      return res.status(200).json({
        success: true,
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          questionnaireId,
          clinicSlug: clinic.slug,
          category: product.category || null,
          currentFormVariant,
          // Expose tenant product pricing + stripe identifiers for checkout
          price: (tenantProduct as any).price ?? null,
          stripeProductId: (tenantProduct as any).stripeProductId ?? null,
          stripePriceId: (tenantProduct as any).stripePriceId ?? null,
          tenantProductId: (tenantProduct as any).id ?? null,
        },
      });
    }

    // Fallback: consider enablement via TenantProductForm (form assignment)
    const tenantProductForm = await TenantProductForm.findOne({
      where: { clinicId: clinic.id },
      include: [
        {
          model: Product,
          required: true,
          where: { slug },
        },
      ],
    });

    if (tenantProductForm && (tenantProductForm as any).product) {
      const product = (tenantProductForm as any).product;
      
      // Always check for the most recently attached form via Questionnaire.productId
      // This takes precedence over TenantProductForm.questionnaireId to ensure form switching works
      let questionnaireId = tenantProductForm.questionnaireId || null;
      try {
        const productQuestionnaire = await Questionnaire.findOne({
          where: {
            productId: product.id,
            formTemplateType: 'normal'
          },
          order: [['updatedAt', 'DESC']]
        });
        if (productQuestionnaire) {
          questionnaireId = productQuestionnaire.id;
          console.log('✅ Using questionnaire from Questionnaire.productId:', questionnaireId);
        } else if (questionnaireId) {
          console.log('⚠️ No Questionnaire.productId found, falling back to TenantProductForm.questionnaireId:', questionnaireId);
        }
      } catch (e) {
        console.error('Error finding product questionnaire:', e);
      }

      return res.status(200).json({
        success: true,
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          questionnaireId,
          clinicSlug: clinic.slug,
          category: product.category || null,
          currentFormVariant: (tenantProductForm as any).currentFormVariant ?? null,
        },
      });
    }

    return res.status(404).json({ success: false, message: "Product not enabled for this brand" });
  } catch (error) {
    console.error('❌ Error fetching published brand products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch published products' });
  }
});
// Public: list standardized templates (optionally filtered by category)
app.get("/public/questionnaires/standardized", async (req, res) => {
  try {
    const { category } = req.query;

    const where: any = {
      isTemplate: true,
      formTemplateType: 'standardized_template'
    };
    if (typeof category === 'string' && category.trim().length > 0) {
      where.category = category.trim();
    }

    const questionnaires = await Questionnaire.findAll({
      where,
      include: [
        {
          model: QuestionnaireStep,
          include: [
            {
              model: Question,
              include: [QuestionOption],
            },
          ],
        },
      ],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
      ] as any,
    });

    res.status(200).json({ success: true, data: questionnaires });
  } catch (error) {
    console.error('❌ Error fetching standardized questionnaires:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch standardized questionnaires' });
  }
});

// Public: get the latest questionnaire with formTemplateType = 'user_profile'
app.get("/public/questionnaires/first-user-profile", async (_req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({
      where: { formTemplateType: 'user_profile' },
      include: [
        {
          model: QuestionnaireStep,
          include: [
            {
              model: Question,
              include: [QuestionOption],
            },
          ],
        },
      ],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
        ["updatedAt", "DESC"],
      ] as any,
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: 'No user_profile questionnaire found' });
    }

    res.status(200).json({ success: true, data: questionnaire });
  } catch (error) {
    console.error('❌ Error fetching first user_profile questionnaire:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user_profile questionnaire' });
  }
});

// Public: get questionnaire by id (no auth), includes steps/questions/options
app.get("/public/questionnaires/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const questionnaire = await Questionnaire.findByPk(id, {
      include: [
        {
          model: QuestionnaireStep,
          include: [
            {
              model: Question,
              include: [QuestionOption],
            },
          ],
        },
      ],
      order: [
        [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
        [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC'],
      ] as any,
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: 'Questionnaire not found' });
    }

    res.status(200).json({ success: true, data: questionnaire });
  } catch (error) {
    console.error('❌ Error fetching public questionnaire:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questionnaire' });
  }
});

// Public: get active customization for a questionnaire by clinic
app.get("/public/questionnaire-customization/:questionnaireId", async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const clinicId = req.query.clinicId as string;

    console.log(`🎨 [PUBLIC] Fetching customization for questionnaire: ${questionnaireId}, clinic: ${clinicId}`);

    if (!clinicId) {
      console.log('❌ [PUBLIC] Missing clinicId parameter');
      return res.status(400).json({
        success: false,
        message: 'clinicId query parameter is required'
      });
    }

    // Find an active customization for this questionnaire from any user in this clinic
    const customization = await QuestionnaireCustomization.findOne({
      where: {
        questionnaireId,
        isActive: true,
        '$user.clinicId$': clinicId // Use nested where with Sequelize syntax
      },
      include: [{
        model: User,
        as: 'user',
        required: true,
        attributes: ['id', 'clinicId'] // Return minimal user data for debugging
      }]
    });

    console.log(`📦 [PUBLIC] Found customization:`, customization ? {
      id: customization.id,
      questionnaireId: customization.questionnaireId,
      customColor: customization.customColor,
      isActive: customization.isActive,
      userId: customization.userId
    } : null);

    if (!customization) {
      console.log('⚠️ [PUBLIC] No customization found, returning null');

      // Debug: Let's see what's in the table
      const allCustomizations = await QuestionnaireCustomization.findAll({
        where: { questionnaireId },
        include: [{ model: User, as: 'user', attributes: ['id', 'clinicId'] }]
      });
      console.log(`🔍 [PUBLIC] All customizations for this questionnaire:`, allCustomizations.map(c => ({
        id: c.id,
        questionnaireId: c.questionnaireId,
        customColor: c.customColor,
        isActive: c.isActive,
        userId: c.userId,
        userClinicId: (c as any).user?.clinicId
      })));

      return res.status(200).json({
        success: true,
        data: null // No customization found
      });
    }

    const result = {
      customColor: customization.customColor,
      isActive: customization.isActive
    };

    console.log(`✅ [PUBLIC] Returning customization:`, result);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ [PUBLIC] Error fetching questionnaire customization:', error);
    console.error('❌ [PUBLIC] Error details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customization' });
  }
});

// Public: get the latest questionnaire with formTemplateType = 'user_profile'
app.get("/public/questionnaires/first-user-profile", async (_req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({
      where: { formTemplateType: 'user_profile' },
      include: [
        {
          model: QuestionnaireStep,
          include: [
            {
              model: Question,
              include: [QuestionOption],
            },
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: 'No user_profile questionnaire found' });
    }

    res.status(200).json({ success: true, data: questionnaire });
  } catch (error) {
    console.error('❌ Error fetching first user_profile questionnaire:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user_profile questionnaire' });
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

// ========================================
// Tenant Product Endpoints
// ========================================

// Update product selection for a clinic
app.post("/tenant-products/update-selection", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate request body using a relaxed schema that allows missing questionnaireId
    const { z } = require('zod');
    const relaxedItemSchema = z.object({
      productId: z.string().uuid('Invalid product ID'),
      questionnaireId: z.string().uuid('Invalid questionnaire ID').optional(),
    });
    const relaxedSchema = z.object({
      products: z.array(relaxedItemSchema).min(1).max(100),
    });

    // Sanitize incoming to drop null questionnaireId values
    const sanitized = {
      products: Array.isArray(req.body?.products) ? req.body.products.map((p: any) => {
        const obj: any = { productId: p?.productId };
        if (typeof p?.questionnaireId === 'string' && p.questionnaireId.length > 0) {
          obj.questionnaireId = p.questionnaireId;
        }
        return obj;
      }) : []
    };

    const validation = relaxedSchema.safeParse(sanitized);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      });
    }

    // Create tenant product service instance
    const tenantProductService = new TenantProductService();

    // Update product selection
    const tenantProducts = await tenantProductService.updateSelection(
      validation.data,
      currentUser.id
    );

    console.log('✅ Tenant products updated:', {
      count: tenantProducts.length,
      userId: currentUser.id,
      // clinicId: currentUser.clinicId
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${tenantProducts.length} product(s)`,
      data: tenantProducts
    });

  } catch (error) {
    console.error('❌ Error updating tenant product selection:', error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Unauthorized') ||
        error.message.includes('does not belong to')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Duplicate')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }


      if (error.message.includes('Product limit exceeded')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('only change products once per billing cycle')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update tenant product selection"
    });
  }
});

// Update tenant product price
app.post("/tenant-products/update", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Basic validation (schema removed): expect tenantProductId (uuid) and positive price
    const { tenantProductId, price } = req.body || {};
    if (typeof tenantProductId !== 'string' || tenantProductId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'tenantProductId is required' });
    }
    if (typeof price !== 'number' || !(price > 0)) {
      return res.status(400).json({ success: false, message: 'price must be a positive number' });
    }

    // Create tenant product service instance
    const tenantProductService = new TenantProductService();

    // Update tenant product price
    const result = await tenantProductService.updatePrice({
      tenantProductId, price,
      userId: currentUser.id
    });

    if (!result.success) {
      // Handle specific error types
      if (result.error?.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      if (result.error?.includes('does not belong to')) {
        return res.status(403).json({
          success: false,
          message: result.error
        });
      }

      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to update price'
      });
    }

    console.log('✅ Tenant product price updated:', {
      tenantProductId,
      price,
      stripeProductId: result.stripeProductId,
      stripePriceId: result.stripePriceId,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: result.message || 'Price updated successfully',
      data: {
        tenantProduct: result.tenantProduct,
        stripeProductId: result.stripeProductId,
        stripePriceId: result.stripePriceId
      }
    });

  } catch (error) {
    console.error('❌ Error updating tenant product price:', error);

    res.status(500).json({
      success: false,
      message: "Failed to update tenant product price"
    });
  }
});

// Get all tenant products for a clinic
app.get("/tenant-products", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const tenantProductService = new TenantProductService();
    const tenantProducts = await tenantProductService.listByClinic(currentUser.id);

    res.status(200).json({
      success: true,
      message: `Retrieved ${tenantProducts.length} tenant product(s)`,
      data: tenantProducts
    });

  } catch (error) {
    console.error('❌ Error fetching tenant products:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant products"
    });
  }
});

// Delete a tenant product
app.delete("/tenant-products/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tenant product ID is required"
      });
    }

    const tenantProductService = new TenantProductService();
    const result = await tenantProductService.delete(id, currentUser.id);

    console.log('✅ Tenant product deleted:', {
      tenantProductId: id,
      userId: currentUser.id
    });

    res.status(200).json({
      success: true,
      message: "Tenant product deleted successfully",
      data: result
    });

  } catch (error) {
    console.error('❌ Error deleting tenant product:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Unauthorized') ||
        error.message.includes('does not belong to')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete tenant product"
    });
  }
});
