import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Applies to all API routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: {
    success: false,
    error: {
      message: '请求次数过多，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (increased from 30 seconds)
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // More lenient in development
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: {
      message: '认证尝试次数过多，请稍后再试',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for quiz submission
 * Prevents spam submissions
 */
export const submissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // More lenient in development
  message: {
    success: false,
    error: {
      message: '提交次数过多，请稍后再试',
      code: 'SUBMISSION_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for question creation
 * Prevents spam question creation
 */
export const questionCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // More lenient in development
  message: {
    success: false,
    error: {
      message: '创建题目次数过多，请稍后再试',
      code: 'QUESTION_CREATION_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for analytics endpoints
 * Prevents excessive data queries
 */
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 30 : 100, // More lenient in development
  message: {
    success: false,
    error: {
      message: '统计查询次数过多，请稍后再试',
      code: 'ANALYTICS_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
