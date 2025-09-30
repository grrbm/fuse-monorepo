import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from '../models/User';
import Entity from '../models/Entity';
import Product from '../models/Product';
import Prescription from '../models/Prescription';
import Treatment from '../models/Treatment';
import PrescriptionProducts from '../models/PrescriptionProducts';
import TreatmentProducts from '../models/TreatmentProducts';
import Clinic from '../models/Clinic';
import Questionnaire from '../models/Questionnaire';
import QuestionnaireStep from '../models/QuestionnaireStep';
import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Payment from '../models/Payment';
import ShippingAddress from '../models/ShippingAddress';
import BrandSubscription from '../models/BrandSubscription';
import BrandSubscriptionPlans from '../models/BrandSubscriptionPlans';
import ShippingOrder from '../models/ShippingOrder';
import Subscription from '../models/Subscription';
import TreatmentPlan from '../models/TreatmentPlan';
import Physician from '../models/Physician';
import BrandTreatment from '../models/BrandTreatment';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Check if we're connecting to localhost (Aptible tunnel)
const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// HIPAA-compliant database connection
const shouldUseSSL = process.env.NODE_ENV === 'production' || process.env.USE_DB_SSL === 'true';
const sequelizeConfig = {
  dialect: 'postgres' as const,
  dialectOptions: {
    // SSL configuration: 
    // - Production (Aptible): require SSL with relaxed validation
    // - Local dev default: no SSL
    // - Optional: enable via USE_DB_SSL=true (for RDS over localhost tunnel)
    ssl: shouldUseSSL ? {
      require: true,
      rejectUnauthorized: false,
      ca: undefined, // Don't validate CA certificate
      checkServerIdentity: () => undefined, // Skip hostname verification
    } : false,
  },
  logging: false, // Don't log SQL queries in production (could contain PHI)
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export const sequelize = new Sequelize(databaseUrl, {
  ...sequelizeConfig,
  models: [User, Entity, Product,
    Prescription, Treatment, PrescriptionProducts,
    TreatmentProducts, Clinic, Questionnaire,
    QuestionnaireStep, Question, QuestionOption,
    Order, OrderItem, Payment,
    ShippingAddress, ShippingOrder, Subscription,
    TreatmentPlan, BrandSubscription, BrandSubscriptionPlans, Physician, BrandTreatment
  ],
});

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    console.log("Syncing...")
    // Sync all models to database (safer sync mode)
    await sequelize.sync({ alter: { drop: false } });
    console.log('✅ Database tables synchronized successfully');

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}