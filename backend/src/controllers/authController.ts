import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { ApiResponse } from '../types';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, profile } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Username already taken',
          code: 'USER_EXISTS'
        }
      };
      return res.status(409).json(response);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'student',
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar || null
      }
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        tokens
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Registration failed',
        code: 'REGISTRATION_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Invalid username or password',
          code: 'INVALID_CREDENTIALS'
        }
      };
      return res.status(401).json(response);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Invalid username or password',
          code: 'INVALID_CREDENTIALS'
        }
      };
      return res.status(401).json(response);
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        tokens
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Login failed',
        code: 'LOGIN_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Refresh access token
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        }
      };
      return res.status(400).json(response);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await User.findById(payload.userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    const response: ApiResponse = {
      success: true,
      data: { tokens }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Token refresh failed',
        code: 'REFRESH_ERROR',
        details: error
      }
    };
    res.status(401).json(response);
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the tokens from storage
    // This endpoint can be used for logging purposes or token blacklisting if needed

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Logout failed',
        code: 'LOGOUT_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    const user = await User.findById(userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt
        }
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to get user profile',
        code: 'GET_USER_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};
