import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Common validation rules
export const commonValidations = {
  // MongoDB ObjectId validation
  objectId: (field: string) => 
    param(field).custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${field} format`);
      }
      return true;
    }),

  // Email validation
  email: () => 
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

  // Password validation
  password: () => 
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Username validation
  username: () => 
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  // Role validation
  role: () => 
    body('role')
      .isIn(['teacher', 'student'])
      .withMessage('Role must be either teacher or student'),

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// User validation rules
export const userValidations = {
  register: [
    commonValidations.username(),
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.role(),
    body('profile.firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('profile.lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
  ],

  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],

  updateProfile: [
    body('profile.firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('profile.lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
  ]
};

// Question validation rules
export const questionValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Content must be between 1 and 2000 characters'),
    body('options')
      .isArray({ min: 2, max: 6 })
      .withMessage('Must have between 2 and 6 options'),
    body('options.*.id')
      .notEmpty()
      .withMessage('Option ID is required'),
    body('options.*.text')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Option text must be between 1 and 500 characters'),
    body('correctAnswer')
      .notEmpty()
      .withMessage('Correct answer is required'),
    body('difficulty')
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    body('explanation')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Explanation cannot exceed 1000 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters')
  ],

  update: [
    commonValidations.objectId('id'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Content must be between 1 and 2000 characters'),
    body('options')
      .optional()
      .isArray({ min: 2, max: 6 })
      .withMessage('Must have between 2 and 6 options'),
    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard')
  ],

  delete: [
    commonValidations.objectId('id')
  ]
};

// Quiz session validation rules
export const quizValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('questions')
      .isArray({ min: 1, max: 100 })
      .withMessage('Must have between 1 and 100 questions'),
    body('questions.*')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid question ID format');
        }
        return true;
      }),
    body('timeLimit')
      .optional()
      .isInt({ min: 1, max: 480 })
      .withMessage('Time limit must be between 1 and 480 minutes')
  ],

  start: [
    commonValidations.objectId('id')
  ],

  submit: [
    commonValidations.objectId('id'),
    body('answers')
      .isArray({ min: 1 })
      .withMessage('Answers array is required'),
    body('answers.*.questionId')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid question ID format');
        }
        return true;
      }),
    body('answers.*.selectedAnswer')
      .notEmpty()
      .withMessage('Selected answer is required'),
    body('startTime')
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 date')
  ]
};

// Submission validation rules
export const submissionValidations = {
  getByQuiz: [
    commonValidations.objectId('quizId'),
    ...commonValidations.pagination()
  ],

  getByStudent: [
    commonValidations.objectId('studentId'),
    ...commonValidations.pagination()
  ]
};

// Analytics validation rules
export const analyticsValidations = {
  overview: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard')
  ],

  questionStats: [
    commonValidations.objectId('questionId')
  ]
};