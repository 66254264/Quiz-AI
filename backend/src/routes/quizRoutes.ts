import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAvailableQuizzes,
  startQuiz,
  submitQuiz,
  getQuizResult
} from '../controllers/quizController';
import { authenticate, isStudent } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { submissionLimiter } from '../middleware/rateLimiter';
import { cacheMiddleware, invalidateCacheMiddleware, CacheTTL } from '../middleware/cache';

const router = Router();

// All quiz routes require authentication and student role
router.use(authenticate, isStudent);

/**
 * @route   GET /api/quizzes
 * @desc    Get all available quizzes for students
 * @access  Private (Student only)
 */
router.get('/', cacheMiddleware(CacheTTL.MEDIUM), getAvailableQuizzes);

/**
 * @route   POST /api/quizzes/:id/start
 * @desc    Start a quiz session
 * @access  Private (Student only)
 */
router.post(
  '/:id/start',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid quiz ID'),
    validateRequest
  ],
  startQuiz
);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Submit quiz answers
 * @access  Private (Student only)
 */
router.post(
  '/:id/submit',
  submissionLimiter,
  invalidateCacheMiddleware(/\/analytics/), // Invalidate analytics cache on submission
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid quiz ID'),
    body('answers')
      .isArray({ min: 1 })
      .withMessage('Answers must be a non-empty array'),
    body('answers.*.questionId')
      .isMongoId()
      .withMessage('Invalid question ID'),
    body('answers.*.selectedAnswer')
      .trim()
      .notEmpty()
      .withMessage('Selected answer is required'),
    body('startTime')
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 date'),
    validateRequest
  ],
  submitQuiz
);

/**
 * @route   GET /api/quizzes/:id/result
 * @desc    Get quiz result details
 * @access  Private (Student only)
 */
router.get(
  '/:id/result',
  cacheMiddleware(CacheTTL.LONG), // Cache results for 15 minutes
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid quiz ID'),
    validateRequest
  ],
  getQuizResult
);

export default router;
