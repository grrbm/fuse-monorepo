import { Sequelize } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
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
import GlobalFormStructure from '../models/GlobalFormStructure';
import Sale from '../models/Sale';
import DoctorPatientChats from '../models/DoctorPatientChats';
import Pharmacy from '../models/Pharmacy';
import PharmacyProduct from '../models/PharmacyProduct';
import MessageTemplate from '../models/MessageTemplate';
import Sequence from '../models/Sequence';
import SequenceRun from '../models/SequenceRun';
import Tag from '../models/Tag';
import UserTag from '../models/UserTag';
import TenantCustomFeatures from '../models/TenantCustomFeatures';
import TierConfiguration from '../models/TierConfiguration';
import TenantAnalyticsEvents from '../models/TenantAnalyticsEvents';
import FormAnalyticsDaily from '../models/FormAnalyticsDaily';
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

// Check if we're connecting to localhost
const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// HIPAA-compliant database connection
const sequelizeConfig = {
  dialect: 'postgres' as const,
  dialectOptions: {
    // SSL configuration: 
    // - Production: require SSL with relaxed validation
    // - Development with localhost: no SSL
    // - Localhost (non-development): use SSL but don't require it
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
  models: [User, Product,
    Prescription, Treatment, PrescriptionProducts,
    TreatmentProducts, Clinic, Questionnaire, QuestionnaireCustomization,
    QuestionnaireStep, Question, QuestionOption,
    Order, OrderItem, Payment,
    ShippingAddress, ShippingOrder, Subscription,
    TreatmentPlan, BrandSubscription, BrandSubscriptionPlans, Physician, BrandTreatment,
    UserPatient, TenantProduct, FormSectionTemplate,
    TenantProductForm, GlobalFormStructure, Sale, DoctorPatientChats, Pharmacy, PharmacyProduct,
    MessageTemplate, Sequence, SequenceRun, Tag, UserTag,
    TenantCustomFeatures, TierConfiguration, TenantAnalyticsEvents, FormAnalyticsDaily
  ],
});

async function ensureProductCategoriesColumn() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tableDefinition = await queryInterface.describeTable('Product');
    const hasCategoriesColumn = Object.prototype.hasOwnProperty.call(tableDefinition, 'categories');
    const hasTempColumn = Object.prototype.hasOwnProperty.call(tableDefinition, 'categories_temp');
    const hasLegacyCategoryColumn = Object.prototype.hasOwnProperty.call(tableDefinition, 'category');

    if (!hasCategoriesColumn) {
      console.log('⚙️  Updating Product table to support multiple categories (auto-migration)...');

      if (!hasTempColumn) {
        await queryInterface.addColumn('Product', 'categories_temp', {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
          comment: 'Product categories as array',
        });
      }

      if (hasLegacyCategoryColumn) {
        await sequelize.query(`
          UPDATE "Product"
          SET "categories_temp" = CASE
            WHEN "category" IS NOT NULL THEN ARRAY["category"::text]
            ELSE ARRAY[]::text[]
          END;
        `);
        try {
          await queryInterface.removeColumn('Product', 'category');
          await sequelize.query('DROP TYPE IF EXISTS "enum_Product_category";');
        } catch (removeError) {
          console.warn('⚠️  Skipped removing legacy category column (already removed?):', removeError instanceof Error ? removeError.message : removeError);
        }
      }

      try {
        await queryInterface.renameColumn('Product', 'categories_temp', 'categories');
      } catch (renameError) {
        if (renameError instanceof Error && renameError.message.includes('already exists')) {
          console.warn('⚠️  Categories column already present, skipping rename.');
        } else {
          throw renameError;
        }
      }

      await sequelize.query(`
        ALTER TABLE "Product"
        ALTER COLUMN "categories" SET DEFAULT ARRAY[]::text[];
      `);

      await sequelize.query(`
        UPDATE "Product"
        SET "categories" = ARRAY[]::text[]
        WHERE "categories" IS NULL;
      `);

      console.log('✅ Product categories auto-migration completed');
    } else {
      // Ensure column defaults and null handling are correct even if migration already ran
      await sequelize.query(`
        ALTER TABLE "Product"
        ALTER COLUMN "categories" SET DEFAULT ARRAY[]::text[];
      `);

      await sequelize.query(`
        UPDATE "Product"
        SET "categories" = ARRAY[]::text[]
        WHERE "categories" IS NULL;
      `);
    }
  } catch (error) {
    console.error('❌ Failed to ensure Product categories column:', error);
  }
}

async function ensureDefaultFormStructures() {
  const defaultStructures = [
    {
      id: "default",
      name: "Default - Short form",
      sections: [
        { id: "product", icon: "📦", type: "product_questions", label: "Product Questions", order: 1, enabled: true, description: "Questions specific to each individual product" },
        { id: "account", icon: "👤", type: "account_creation", label: "Create Account", order: 2, enabled: true, description: "Patient information collection" },
        { id: "checkout", icon: "💳", type: "checkout", label: "Payment & Checkout", order: 3, enabled: true, description: "Billing and shipping" },
        { id: "category", icon: "📋", type: "category_questions", label: "Standardized Category Questions", order: 4, enabled: false, description: "Questions shared across all products in a category" }
      ],
      createdAt: "2025-11-06T00:00:00.000Z",
      description: "Standard questionnaire flow for all products"
    },
    {
      id: "1762381752300",
      name: "Personalized Long",
      sections: [
        { id: "category", icon: "📋", type: "category_questions", label: "Standardized Category Questions", order: 1, enabled: true, description: "Questions shared across all products in a category" },
        { id: "product", icon: "📦", type: "product_questions", label: "Product Questions", order: 2, enabled: true, description: "Questions specific to each individual product" },
        { id: "account", icon: "👤", type: "account_creation", label: "Create Account", order: 3, enabled: true, description: "Patient information collection" },
        { id: "checkout", icon: "💳", type: "checkout", label: "Payment & Checkout", order: 4, enabled: true, description: "Billing information and payment processing" }
      ],
      createdAt: "2025-11-06T00:00:00.000Z",
      description: "Category questions first for comprehensive intake"
    },
    {
      id: "1762382187889",
      name: "Personalized and Payment First",
      sections: [
        { id: "category", icon: "📋", type: "category_questions", label: "Standardized Category Questions", order: 1, enabled: true, description: "Questions shared across all products in a category" },
        { id: "account", icon: "👤", type: "account_creation", label: "Create Account", order: 2, enabled: true, description: "Patient information collection" },
        { id: "checkout", icon: "💳", type: "checkout", label: "Payment & Checkout", order: 3, enabled: true, description: "Billing information and payment processing" },
        { id: "product", icon: "📦", type: "product_questions", label: "Product Questions", order: 4, enabled: true, description: "Questions specific to each individual product" }
      ],
      createdAt: "2025-11-06T00:00:00.000Z",
      description: "Payment after category questions"
    },
    {
      id: "1762382604408",
      name: "Payment First",
      sections: [
        { id: "checkout", icon: "💳", type: "checkout", label: "Payment & Checkout", order: 1, enabled: true, description: "Billing information and payment processing" },
        { id: "account", icon: "👤", type: "account_creation", label: "Create Account", order: 2, enabled: true, description: "Patient information collection" },
        { id: "product", icon: "📦", type: "product_questions", label: "Product Questions", order: 3, enabled: true, description: "Questions specific to each individual product" },
        { id: "category", icon: "📋", type: "category_questions", label: "Standardized Category Questions", order: 4, enabled: false, description: "Questions shared across all products in a category" }
      ],
      createdAt: "2025-11-06T00:00:00.000Z",
      description: "Collect payment before medical questions"
    }
  ];

  try {
    for (const structure of defaultStructures) {
      const existing = await GlobalFormStructure.findOne({
        where: { structureId: structure.id }
      });

      if (!existing) {
        await GlobalFormStructure.create({
          structureId: structure.id,
          name: structure.name,
          description: structure.description,
          sections: structure.sections,
          isDefault: structure.id === "default",
          isActive: true
        });
        console.log(`✅ Created default form structure: ${structure.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error ensuring default form structures:', error);
  }
}

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    console.log("Syncing...")
    // Sync all models to database (safer sync mode)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully');

    // Ensure TierConfiguration exists for all active BrandSubscriptionPlans
    try {
      console.log('🔍 Checking TierConfiguration for active plans...');
      const activePlans = await BrandSubscriptionPlans.findAll({
        where: { isActive: true }
      });

      for (const plan of activePlans) {
        const existingConfig = await TierConfiguration.findOne({
          where: { brandSubscriptionPlanId: plan.id }
        });

        if (!existingConfig) {
          // Determine default canAddCustomProducts based on plan type
          const isPremiumTier = plan.planType.toLowerCase() === 'premium' ||
            plan.planType.toLowerCase() === 'enterprise';

          await TierConfiguration.create({
            brandSubscriptionPlanId: plan.id,
            canAddCustomProducts: isPremiumTier,
          });
          console.log(`✅ Created TierConfiguration for plan: ${plan.name} (${plan.planType}) - canAddCustomProducts: ${isPremiumTier}`);
        } else {
          console.log(`✓ TierConfiguration already exists for plan: ${plan.name}`);
        }
      }
      console.log('✅ TierConfiguration check complete');
    } catch (error) {
      console.error('❌ Error ensuring TierConfiguration:', error);
    }

    // Force recreate GlobalFormStructure table (drop and recreate)
    try {
      console.log('🔄 Dropping and recreating GlobalFormStructure table...');
      // First, try to drop the table if it exists with wrong permissions
      try {
        await sequelize.query('DROP TABLE IF EXISTS "GlobalFormStructures" CASCADE;');
        console.log('✅ Dropped existing GlobalFormStructures table');
      } catch (dropError) {
        console.log('⚠️  Could not drop table (may not exist):', dropError instanceof Error ? dropError.message : dropError);
      }

      // Now force create the table fresh
      await GlobalFormStructure.sync({ force: true });
      console.log('✅ GlobalFormStructure table created fresh');
    } catch (syncError) {
      console.error('❌ Error syncing GlobalFormStructure:', syncError);
      throw syncError;
    }

    await ensureDefaultFormStructures();
    await ensureProductCategoriesColumn();

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

    // Ensure customMaxProducts column exists on BrandSubscription
    try {
      await sequelize.query(`
        ALTER TABLE "BrandSubscription"
        ADD COLUMN IF NOT EXISTS "customMaxProducts" INTEGER;
      `);
      console.log('✅ Ensured customMaxProducts column exists on BrandSubscription');
    } catch (e) {
      console.log('⚠️  customMaxProducts column may already exist or error:', e instanceof Error ? e.message : e);
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
