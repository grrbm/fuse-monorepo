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
import QuestionnaireCustomization from '../models/QuestionnaireCustomization';
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
import UserPatient from '../models/UserPatient';
import TenantProduct from '../models/TenantProduct';
import FormSectionTemplate from '../models/FormSectionTemplate';
import TenantProductForm from '../models/TenantProductForm';
import Sale from '../models/Sale';
import DoctorPatientChats from '../models/DoctorPatientChats';
import Pharmacy from '../models/Pharmacy';
import PharmacyProduct from '../models/PharmacyProduct';
import { MigrationService } from '../services/migration.service';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Use DEV_DATABASE_URL for development environment, otherwise use DATABASE_URL
const databaseUrl = process.env.NODE_ENV === 'development'
  ? process.env.DEV_DATABASE_URL || process.env.DATABASE_URL
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL (or DEV_DATABASE_URL for development) environment variable is required');
}

// Check if we're connecting to localhost (Aptible tunnel)
const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// HIPAA-compliant database connection
const sequelizeConfig = {
  dialect: 'postgres' as const,
  dialectOptions: {
    // SSL configuration: 
    // - Production (Aptible): require SSL with relaxed validation
    // - Development with localhost: no SSL
    // - Localhost tunnel (non-development): use SSL but don't require it
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false,
      ca: undefined, // Don't validate CA certificate
      checkServerIdentity: () => undefined, // Skip hostname verification
    } : (process.env.NODE_ENV === 'development' && isLocalhost) ? false : isLocalhost ? {
      require: false, // Don't require SSL for localhost tunnel
      rejectUnauthorized: false,
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
    TreatmentProducts, Clinic, Questionnaire, QuestionnaireCustomization,
    QuestionnaireStep, Question, QuestionOption,
    Order, OrderItem, Payment,
    ShippingAddress, ShippingOrder, Subscription,
    TreatmentPlan, BrandSubscription, BrandSubscriptionPlans, Physician, BrandTreatment,
    UserPatient, TenantProduct, FormSectionTemplate,
    TenantProductForm, Sale, DoctorPatientChats, Pharmacy, PharmacyProduct
  ],
});

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    console.log("Syncing...")
    // Sync all models to database (safer sync mode)
    // Temporarily using alter: { drop: false } to avoid constraint conflicts
    await sequelize.sync({ alter: { drop: false } });
    // await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully');

    // Run active to isActive migration
    try {
      const migrationService = new MigrationService(sequelize);
      await migrationService.runActiveToIsActiveMigration();
    } catch (error) {
      console.error('❌ Error during active to isActive migration:', error);
      // Don't throw - let the app continue
    }

    // Ensure optional columns are nullable even if previous schema had NOT NULL
    try {
      await sequelize.query('ALTER TABLE "TenantProduct" ALTER COLUMN "questionnaireId" DROP NOT NULL;');
    } catch (e) {
      // ignore if already nullable or if statement not applicable
    }
    try {
      await sequelize.query('ALTER TABLE "Order" ALTER COLUMN "treatmentId" DROP NOT NULL;');
    } catch (e) {
      // ignore
    }
    try {
      // Change doctorNotes from JSONB to TEXT for single editable note
      await sequelize.query('ALTER TABLE "Order" ALTER COLUMN "doctorNotes" TYPE TEXT USING "doctorNotes"::text;');
    } catch (e) {
      // ignore
    }
    try {
      // Clean up any soft-deleted TenantProductForms by hard-deleting
      await sequelize.query('DELETE FROM "TenantProductForms" WHERE "deletedAt" IS NOT NULL;');
    } catch (e) {
      // ignore
    }

    // Reset retry flag at the start of a new billing cycle
    try {
      await sequelize.query(`
        UPDATE "BrandSubscription"
        SET "retriedProductSelectionForCurrentCycle" = false,
            "productsChangedAmountOnCurrentCycle" = 0
        WHERE "currentPeriodStart" IS NOT NULL
          AND "currentPeriodEnd" IS NOT NULL
          AND NOW() >= "currentPeriodStart"
          AND NOW() < "currentPeriodEnd"
          AND (
            "lastProductChangeAt" IS NULL OR "lastProductChangeAt" < "currentPeriodStart"
          )
      `);
    } catch (e) {
      // ignore
    }

    // Ensure Absolute RX pharmacy exists
    try {
      const existingPharmacy = await Pharmacy.findOne({
        where: { name: 'Absolute RX' }
      });

      if (!existingPharmacy) {
        await Pharmacy.create({
          name: 'Absolute RX',
          slug: 'absoluterx',
          supportedStates: ['CA'], // Can be expanded to include more states
          isActive: true
        });
        console.log('✅ Created Absolute RX pharmacy');
      } else {
        console.log('✅ Absolute RX pharmacy already exists');
      }
    } catch (e) {
      console.error('❌ Error creating Absolute RX pharmacy:', e);
      // ignore - don't fail startup
    }

    // Ensure IronSail pharmacy exists
    try {
      const existingIronSail = await Pharmacy.findOne({
        where: { name: 'IronSail' }
      });

      if (!existingIronSail) {
        await Pharmacy.create({
          name: 'IronSail',
          slug: 'ironsail',
          supportedStates: [
            'AL', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
            'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
            'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
            'WV', 'WI', 'WY', 'DC'
          ], // All US states except Alaska (AK) and Hawaii (HI)
          isActive: true
        });
        console.log('✅ Created IronSail pharmacy');
      } else {
        console.log('✅ IronSail pharmacy already exists');
      }
    } catch (e) {
      console.error('❌ Error creating IronSail pharmacy:', e);
      // ignore - don't fail startup
    }

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}
