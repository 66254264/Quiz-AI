import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../types';

/**
 * Middleware to validate request using express-validator
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 提取第一个错误消息作为主要错误消息
    const firstError = errors.array()[0];
    const errorMessage = firstError.msg || 'Validation failed';
    
    const response: ApiResponse = {
      success: false,
      error: {
        message: errorMessage,  // 使用具体的错误消息
        code: 'VALIDATION_ERROR',
        details: errors.array().map((err: any) => ({
          field: err.type === 'field' ? err.path : undefined,
          message: err.msg
        }))
      }
    };

    return res.status(400).json(response);
  }

  next();
};
