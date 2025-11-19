import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiResponse, JwtPayload } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN'
        }
      };
      return res.status(401).json(response);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    req.user = payload;

    next();
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Authentication failed',
        code: 'AUTHENTICATION_ERROR'
      }
    };
    return res.status(401).json(response);
  }
};

/**
 * Middleware to authorize user based on role
 */
export const authorize = (...allowedRoles: Array<'teacher' | 'student'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'NOT_AUTHENTICATED'
          }
        };
        return res.status(401).json(response);
      }

      if (!allowedRoles.includes(req.user.role)) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'You do not have permission to access this resource',
            code: 'FORBIDDEN'
          }
        };
        return res.status(403).json(response);
      }

      next();
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: error.message || 'Authorization failed',
          code: 'AUTHORIZATION_ERROR'
        }
      };
      return res.status(403).json(response);
    }
  };
};

/**
 * Middleware to check if user is a teacher
 */
export const isTeacher = authorize('teacher');

/**
 * Middleware to check if user is a student
 */
export const isStudent = authorize('student');

/**
 * Middleware to check if user is either teacher or student (authenticated user)
 */
export const isAuthenticated = authenticate;
