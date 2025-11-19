import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createQuiz,
  getTeacherQuizzes,
  getTeacherQuizById,
  updateQuiz,
  deleteQuiz,
  toggleQuizActive
} from '../controllers/quizController';
import { authenticate, isTeacher } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();

// All teacher quiz routes require authentication and teacher role
router.use(authenticate, isTeacher);

/**
 * @route   POST /api/quizzes/teacher
 * @desc    Create a new quiz
 * @access  Private (Teacher only)
 */
router.post(
  '/',
  invalidateCacheMiddleware(/\/quizzes|\/analytics/), // 清除测验和统计分析缓存
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('测验标题不能为空')
      .isLength({ max: 200 })
      .withMessage('标题不能超过200个字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('描述不能超过1000个字符'),
    body('questions')
      .isArray({ min: 1 })
      .withMessage('至少需要选择一道题目'),
    body('questions.*')
      .isMongoId()
      .withMessage('无效的题目ID'),
    body('timeLimit')
      .optional()
      .isInt({ min: 1, max: 480 })
      .withMessage('时间限制必须在1-480分钟之间'),
    validateRequest
  ],
  createQuiz
);

/**
 * @route   GET /api/quizzes/teacher
 * @desc    Get all quizzes created by the teacher
 * @access  Private (Teacher only)
 */
router.get('/', getTeacherQuizzes);

/**
 * @route   GET /api/quizzes/teacher/:id
 * @desc    Get a single quiz by ID
 * @access  Private (Teacher only)
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('无效的测验ID'),
    validateRequest
  ],
  getTeacherQuizById
);

/**
 * @route   PUT /api/quizzes/teacher/:id
 * @desc    Update a quiz
 * @access  Private (Teacher only)
 */
router.put(
  '/:id',
  invalidateCacheMiddleware(/\/quizzes|\/analytics/), // 清除测验和统计分析缓存
  [
    param('id')
      .isMongoId()
      .withMessage('无效的测验ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('测验标题不能为空')
      .isLength({ max: 200 })
      .withMessage('标题不能超过200个字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('描述不能超过1000个字符'),
    body('questions')
      .optional()
      .isArray({ min: 1 })
      .withMessage('至少需要选择一道题目'),
    body('questions.*')
      .optional()
      .isMongoId()
      .withMessage('无效的题目ID'),
    body('timeLimit')
      .optional()
      .isInt({ min: 1, max: 480 })
      .withMessage('时间限制必须在1-480分钟之间'),
    validateRequest
  ],
  updateQuiz
);

/**
 * @route   DELETE /api/quizzes/teacher/:id
 * @desc    Delete a quiz
 * @access  Private (Teacher only)
 */
router.delete(
  '/:id',
  invalidateCacheMiddleware(/\/analytics/), // 清除统计分析缓存
  [
    param('id')
      .isMongoId()
      .withMessage('无效的测验ID'),
    validateRequest
  ],
  deleteQuiz
);

/**
 * @route   PATCH /api/quizzes/teacher/:id/toggle-active
 * @desc    Toggle quiz active status (publish/unpublish)
 * @access  Private (Teacher only)
 */
router.patch(
  '/:id/toggle-active',
  invalidateCacheMiddleware(/\/quizzes|\/analytics/), // 清除测验和统计分析缓存
  [
    param('id')
      .isMongoId()
      .withMessage('无效的测验ID'),
    validateRequest
  ],
  toggleQuizActive
);

export default router;
