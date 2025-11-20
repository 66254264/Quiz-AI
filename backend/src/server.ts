import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { 
  securityHeaders, 
  corsOptions, 
  logSuspiciousActivity,
  preventParameterPollution,
  addSecurityHeaders 
} from './middleware/security';
import { 
  sanitizeInput, 
  sanitizeStrings, 
  validateRequestSize 
} from './middleware/sanitize';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Trust proxy - important for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Compression middleware - compress all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9, 6 is default)
}));

// Security headers
app.use(securityHeaders);
app.use(addSecurityHeaders);

// CORS configuration with enhanced security
app.use(cors(corsOptions));

// Request size validation
app.use(validateRequestSize);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization - prevent NoSQL injection and XSS
app.use(sanitizeInput);
app.use(sanitizeStrings);

// Prevent parameter pollution
app.use(preventParameterPollution);

// Log suspicious activities
app.use(logSuspiciousActivity);

// General rate limiting for all API routes
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Quiz System API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from './routes/authRoutes';
import questionRoutes from './routes/questionRoutes';
import quizRoutes from './routes/quizRoutes';
import teacherQuizRoutes from './routes/teacherQuizRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes/teacher', teacherQuizRoutes); // Teacher quiz management
app.use('/api/quizzes', quizRoutes); // Student quiz access
app.use('/api/analytics', analyticsRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Quiz System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      questions: '/api/questions',
      quizzes: '/api/quizzes',
      analytics: '/api/analytics'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;