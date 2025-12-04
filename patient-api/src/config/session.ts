import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  console.error('❌ CRITICAL: SESSION_SECRET environment variable is not set');
  console.error('   This is required for secure session management');
  console.error('   Set SESSION_SECRET in your .env.local file');
  throw new Error('SESSION_SECRET environment variable is required');
}

const SESSION_SECRET = process.env.SESSION_SECRET;

// HIPAA Compliance: Load AWS RDS CA certificate bundle for proper TLS verification
const rdsCaCertPath = path.join(__dirname, '../certs/rds-ca-bundle.pem');
let rdsCaCert: string | undefined;

try {
  if (fs.existsSync(rdsCaCertPath)) {
    rdsCaCert = fs.readFileSync(rdsCaCertPath, 'utf8');
  }
} catch (certError) {
  console.warn('⚠️  Session pool: Failed to load RDS CA certificate');
}

// SECURITY: Determine if connecting to localhost
const databaseUrl = process.env.DATABASE_URL || '';
const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// Create a separate connection pool for sessions with proper TLS verification
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for pg Pool (different from Sequelize):
  // - false = no SSL (localhost dev only)
  // - object = SSL enabled with these options
  ssl: isLocalhost && process.env.NODE_ENV === 'development'
    ? false  // Local development only
    : {
      rejectUnauthorized: true, // ALWAYS verify certificates in non-local environments
      ca: rdsCaCert, // AWS RDS CA certificate bundle
    },
});

// SECURITY: Fail if we're in production without CA certificate
if (process.env.NODE_ENV === 'production' && !rdsCaCert) {
  console.error('❌ CRITICAL: RDS CA certificate not found for session pool in production');
  console.error('   Download from: https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem');
  console.error('   Save to: patient-api/src/certs/rds-ca-bundle.pem');
  throw new Error('RDS CA certificate is required in production');
}

// HIPAA-compliant session configuration
export const sessionConfig = session({
  store: new PgSession({
    pool: sessionPool,
    tableName: 'session',
    createTableIfMissing: false, // We created it via migration
  }),

  // Session configuration for HIPAA compliance
  name: 'sessionId', // Don't use default 'connect.sid' name
  secret: SESSION_SECRET,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something is stored

  // Security settings  
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 30 * 60 * 1000, // 30 minutes (HIPAA compliance - short session timeout)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' with proper CORS whitelisting
    // Let browser handle domain naturally with CORS origin control
  },

  // Session cleanup
  rolling: true, // Reset expiration on activity
});

// Extend session type to include user data
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userEmail?: string;
    userRole?: 'patient' | 'doctor' | 'admin';
    loginTime?: Date;
    lastActivity?: Date;
  }
}

// Middleware to update last activity time
export const updateLastActivity = (req: any, res: any, next: any) => {
  if (req.session && req.session.userId) {
    req.session.lastActivity = new Date();
  }
  next();
};

// Helper function to create user session
export const createUserSession = (req: any, user: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.loginTime = new Date();
    req.session.lastActivity = new Date();

    // Explicitly save the session to ensure cookie is set
    req.session.save((err: any) => {
      if (err) {
        console.error('Failed to save session:', err);
        reject(err);
      } else {
        console.log(`Session saved successfully for user ID: ${user.id}`);
        resolve();
      }
    });

    // Don't log PHI - only log non-sensitive session info
    console.log(`Session created for user ID: ${user.id}`);
  });
};

// Helper function to destroy user session
export const destroyUserSession = (req: any) => {
  const userId = req.session?.userId;
  req.session.destroy((err: any) => {
    if (err) {
      console.error('Error destroying session');
    } else {
      console.log(`Session destroyed for user ID: ${userId || 'unknown'}`);
    }
  });
};
// Check if user is authenticated
export const isAuthenticated = (req: any): boolean => {
  return !!(req.session && req.session.userId);
};

// Get current user from session
export const getCurrentUser = (req: any) => {
  if (!isAuthenticated(req)) {
    return null;
  }

  return {
    id: req.session.userId,
    email: req.session.userEmail,
    role: req.session.userRole,
    loginTime: req.session.loginTime,
    lastActivity: req.session.lastActivity,
  };
};