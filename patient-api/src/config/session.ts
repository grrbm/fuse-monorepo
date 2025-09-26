import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PgSession = connectPgSimple(session);

// Generate a secure session secret (in production, use environment variable)
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secure-session-secret-change-in-production';

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: SESSION_SECRET environment variable is not set in production. Using default value for initial deployment.');
  console.warn('IMPORTANT: Set SESSION_SECRET environment variable immediately after deployment for security.');
}

// Create a separate connection pool for sessions
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: undefined,
    checkServerIdentity: () => undefined,
  } : false,
});

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
        console.log(`Session saved successfully for user: ${user.email}`);
        resolve();
      }
    });
    
    // Don't log PHI - only log non-sensitive session info
    console.log(`Session created for user: ${user.email}`);
  });
};

// Helper function to destroy user session
export const destroyUserSession = (req: any) => {
  const email = req.session?.userEmail;
  req.session.destroy((err: any) => {
    if (err) {
      console.error('Error destroying session');
    } else {
      console.log(`Session destroyed for user: ${email || 'unknown'}`);
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