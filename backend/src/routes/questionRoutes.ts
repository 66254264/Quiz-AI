import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController';
import { authenticate, isTeacher } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { questionCreationLimiter } from '../middleware/rateLimiter';

const router = Router();

// All question routes require authentication and teacher role
router.use(authenticate, isTeacher);

/**
 * @route   POST /api/questions
 * @desc    Create a new question
 * @access  Private (Teacher only)
 */
router.post(
  '/',
  questionCreationLimiter,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Question title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Question content is required')
      .isLength({ max: 2000 })
      .withMessage('Content cannot exceed 2000 characters'),
    body('options')
      .isArray({ min: 2, max: 6 })
      .withMessage('Question must have between 2 and 6 options'),
    body('options.*.id')
      .trim()
      .notEmpty()
      .withMessage('Option ID is required'),
    body('options.*.text')
      .trim()
      .notEmpty()
      .withMessage('Option text is required')
      .isLength({ max: 500 })
      .withMessage('Option text cannot exceed 500 characters'),
    body('correctAnswer')
      .trim()
      .notEmpty()
      .withMessage('Correct answer is required'),
    body('explanation')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Explanation cannot exceed 1000 characters'),
    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Tag cannot exceed 50 characters'),
    validateRequest
  ],
  createQuestion
);

/**
 * @route   GET /api/questions
 * @desc    Get all questions with optional filters
 * @access  Private (Teacher only)
 */
router.get(
  '/',
  [
    query('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    query('tags')
      .optional()
      .isString()
      .withMessage('Tags must be a comma-separated string'),
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validateRequest
  ],
  getQuestions
);

/**
 * @route   GET /api/questions/:id
 * @desc    Get a single question by ID
 * @access  Private (Teacher only)
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid question ID'),
    validateRequest
  ],
  getQuestionById
);

/**
 * @route   PUT /api/questions/:id
 * @desc    Update a question
 * @access  Private (Teacher only)
 */
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid question ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Question title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Question content cannot be empty')
      .isLength({ max: 2000 })
      .withMessage('Content cannot exceed 2000 characters'),
    body('options')
      .optional()
      .isArray({ min: 2, max: 6 })
      .withMessage('Question must have between 2 and 6 options'),
    body('options.*.id')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Option ID is required'),
    body('options.*.text')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Option text is required')
      .isLength({ max: 500 })
      .withMessage('Option text cannot exceed 500 characters'),
    body('correctAnswer')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Correct answer cannot be empty'),
    body('explanation')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Explanation cannot exceed 1000 characters'),
    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Tag cannot exceed 50 characters'),
    validateRequest
  ],
  updateQuestion
);

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete a question
 * @access  Private (Teacher only)
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid question ID'),
    validateRequest
  ],
  deleteQuestion
);

export default router;
