import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Enhanced helmet configuration for security headers
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // XSS Protection
  xssFilter: true,
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

/**
 * CORS configuration with enhanced security
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ CORS允许来自: ${origin}`);
      return callback(null, true);
    }

    // List of allowed origins (production)
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      'http://localhost:5174',
    ];

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

/**
 * Middleware to log suspicious activities
 */
export const logSuspiciousActivity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log requests with suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
    /(union.*select|insert.*into|drop.*table)/i, // SQL injection patterns
    /(<script|javascript:|onerror=|onload=)/i, // XSS patterns
    /(\$where|\$ne|\$gt|\$lt)/i, // NoSQL injection patterns
  ];

  const checkString = (str: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkString(obj);
    } else if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    return false;
  };

  // Check URL, query, body for suspicious patterns
  const url = req.originalUrl || req.url;
  const isSuspicious = 
    checkString(url) ||
    checkObject(req.query) ||
    checkObject(req.body);

  if (isSuspicious) {
    console.warn(`⚠️  Suspicious request detected:`, {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Middleware to prevent parameter pollution
 */
export const preventParameterPollution = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Convert array parameters to single values (take first value)
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        // Keep only the first value to prevent parameter pollution
        req.query[key] = (req.query[key] as string[])[0];
      }
    }
  }

  next();
};

/**
 * Middleware to add security-related response headers
 */
export const addSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};
