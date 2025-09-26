import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRES_IN = '30m'; // 30 minutes for HIPAA compliance

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET not set in production. Using SESSION_SECRET as fallback.');
}

export interface JWTPayload {
  userId: string;
  userEmail: string;
  userRole: 'patient' | 'provider' | 'admin' | 'brand';
  loginTime: number;
  iat?: number;
  exp?: number;
}

// Create JWT token
export const createJWTToken = (user: any): string => {
  const payload: JWTPayload = {
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    loginTime: Date.now(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'patient-portal-api',
    audience: 'patient-portal-frontend',
  });
};

// Verify JWT token
export const verifyJWTToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'patient-portal-api',
      audience: 'patient-portal-frontend',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('JWT verification failed');
    return null;
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

// Middleware to authenticate JWT requests
export const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const decoded = verifyJWTToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Attach user info to request
  req.user = decoded;
  next();
};

// Check if user is authenticated (for backward compatibility)
export const isAuthenticated = (req: any): boolean => {
  return !!(req.user && req.user.userId);
};

// Get current user from JWT (for backward compatibility)
export const getCurrentUser = (req: any) => {
  if (!isAuthenticated(req)) {
    return null;
  }

  return {
    id: req.user.userId,
    email: req.user.userEmail,
    role: req.user.userRole,
    loginTime: new Date(req.user.loginTime),
  };
};