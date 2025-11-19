import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize user input to prevent NoSQL injection attacks
 * Removes any keys that start with '$' or contain '.'
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizeObject = (obj: any, path: string = ''): any => {
      if (obj === null || obj === undefined) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
      }

      if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            // Check for dangerous keys
            if (key.startsWith('$') || key.includes('.')) {
              console.warn(`Sanitized potentially malicious key: ${path}.${key} in request from ${req.ip}`);
              // Replace dangerous characters
              const safeKey = key.replace(/\$/g, '_').replace(/\./g, '_');
              sanitized[safeKey] = sanitizeObject(obj[key], `${path}.${safeKey}`);
            } else {
              sanitized[key] = sanitizeObject(obj[key], `${path}.${key}`);
            }
          }
        }
        return sanitized;
      }

      return obj;
    };

    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body, 'body');
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query, 'query');
    }

    next();
  } catch (error) {
    console.error('Error in NoSQL injection prevention:', error);
    next(error);
  }
};

/**
 * Custom sanitization middleware for additional XSS protection
 * Strips HTML tags and dangerous characters from string inputs
 */
export const sanitizeStrings = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Recursively sanitize object properties
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        // Remove HTML tags
        let sanitized = obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
        
        return sanitized;
      } else if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      } else if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };

    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Error in sanitization middleware:', error);
    next(error);
  }
};

/**
 * Middleware to validate and limit request size
 * Prevents large payload attacks
 */
export const validateRequestSize = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const contentLength = req.headers['content-length'];
  
  if (contentLength) {
    const sizeInMB = parseInt(contentLength) / (1024 * 1024);
    const maxSize = 10; // 10MB limit
    
    if (sizeInMB > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          message: `Request payload too large. Maximum size is ${maxSize}MB`,
          code: 'PAYLOAD_TOO_LARGE'
        }
      });
    }
  }
  
  next();
};
