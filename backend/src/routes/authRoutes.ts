import { Router } from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  getCurrentUser 
} from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['teacher', 'student'])
      .withMessage('Role must be either teacher or student'),
    body('profile.firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    body('profile.lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    body('profile.avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    validateRequest
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validateRequest
  ],
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    validateRequest
  ],
  refresh
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
