import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import dbConnect from './database';

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

export type UserRole = 'admin' | 'manager' | 'staff';

export interface AuthOptions {
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// JWT token generation
export function generateTokens(userId: string, role: UserRole) {
  const accessToken = jwt.sign(
    { userId, role, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

// JWT token verification
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Get user from database
export async function getUserById(userId: string) {
  try {
    await dbConnect();
    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Main authentication function
export async function authenticateUser(request: NextRequest): Promise<any> {
  try {
    // Get access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return null;
    }

    // Try to verify access token first
    if (accessToken) {
      const decoded = verifyToken(accessToken);
      if (decoded && decoded.type === 'access') {
        const user = await getUserById(decoded.userId);
        if (user && user.isActive) {
          return user;
        }
      }
    }

    // If access token is invalid or expired, try refresh token
    if (refreshToken) {
      const decoded = verifyToken(refreshToken);
      if (decoded && decoded.type === 'refresh') {
        const user = await getUserById(decoded.userId);
                 if (user && user.isActive) {
           // Generate new tokens
           const newTokens = generateTokens((user._id as any).toString(), user.role);
          
          // Set new cookies (this will be handled by the calling function)
          return {
            user,
            newTokens,
            needsTokenRefresh: true
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Authorization function
export async function authorizeRequest(
  request: AuthenticatedRequest,
  options: AuthOptions = {}
): Promise<{ success: boolean; user?: any; error?: string; status?: number; newTokens?: any }> {
  const { requiredRoles = [], requireAuth = true } = options;

  try {
    // If authentication is not required, proceed
    if (!requireAuth) {
      return { success: true };
    }

    // Authenticate user
    const authResult = await authenticateUser(request);
    
    if (!authResult) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }

    // Handle token refresh
    if (authResult.needsTokenRefresh) {
      return {
        success: true,
        user: authResult.user,
        newTokens: authResult.newTokens
      };
    }

    const user = authResult;

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is deactivated',
        status: 403
      };
    }

    // Check role requirements
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403
      };
    }

    // Attach user to request
    request.user = user;
    
    return { success: true, user };
  } catch (error) {
    console.error('Authorization error:', error);
    return {
      success: false,
      error: 'Authorization failed',
      status: 500
    };
  }
}

// Auth middleware factory
export function createAuthMiddleware(options: AuthOptions = {}) {
  return async (request: AuthenticatedRequest) => {
    const authResult = await authorizeRequest(request, options);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    // Handle token refresh in middleware
    if (authResult.newTokens) {
      const response = NextResponse.next();
      
      // Set new cookies
      response.cookies.set('accessToken', authResult.newTokens.accessToken, COOKIE_OPTIONS);
      response.cookies.set('refreshToken', authResult.newTokens.refreshToken, REFRESH_COOKIE_OPTIONS);
      
      return response;
    }
    
    return null; // Continue to the next handler
  };
}

// Helper functions for common authorization patterns
export const requireAuth = createAuthMiddleware({ requireAuth: true });
export const requireAdmin = createAuthMiddleware({ requiredRoles: ['admin'] });
export const requireManager = createAuthMiddleware({ requiredRoles: ['admin', 'manager'] });
export const requireStaff = createAuthMiddleware({ requiredRoles: ['admin', 'manager', 'staff'] });

// Utility functions for API routes
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set('accessToken', accessToken, COOKIE_OPTIONS);
  response.cookies.set('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
} 