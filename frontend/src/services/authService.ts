import { apiCall } from '../utils/api';
import type { ApiResponse, User, LoginCredentials, RegisterData } from '../types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export const authService = {
  // Register a new user
  register: async (data: RegisterData): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiCall<any>('POST', '/auth/register', data, {
      cache: false,
    });
    
    console.log('📝 authService.register 响应:', response);
    
    if (response.success && response.data) {
      // Extract tokens from nested structure if needed
      const accessToken = response.data.accessToken || response.data.tokens?.accessToken;
      const refreshToken = response.data.refreshToken || response.data.tokens?.refreshToken;
      const user = response.data.user;
      
      if (accessToken && refreshToken && user) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Return normalized response
        return {
          success: true,
          data: {
            accessToken,
            refreshToken,
            user
          }
        };
      }
    }
    
    // 注册失败，返回错误信息
    console.error('❌ 注册失败:', response.error);
    return {
      success: false,
      error: {
        message: response.error?.message || '注册失败，请重试',
        code: response.error?.code || 'REGISTER_FAILED'
      }
    };
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiCall<any>('POST', '/auth/login', credentials, {
      cache: false,
    });
    
    console.log('🔐 authService.login 响应:', response);
    
    if (response.success && response.data) {
      // Extract tokens from nested structure if needed
      const accessToken = response.data.accessToken || response.data.tokens?.accessToken;
      const refreshToken = response.data.refreshToken || response.data.tokens?.refreshToken;
      const user = response.data.user;
      
      if (accessToken && refreshToken && user) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Return normalized response
        return {
          success: true,
          data: {
            accessToken,
            refreshToken,
            user
          }
        };
      } else {
        console.error('❌ 缺少必要的认证数据');
        return {
          success: false,
          error: {
            message: '登录响应数据不完整',
            code: 'INVALID_RESPONSE'
          }
        };
      }
    }
    
    // 登录失败，返回错误信息
    console.error('❌ 登录失败:', response.error);
    return {
      success: false,
      error: {
        message: response.error?.message || '登录失败，请检查您的邮箱和密码',
        code: response.error?.code || 'LOGIN_FAILED'
      }
    };
  },

  // Refresh access token
  refreshToken: async (): Promise<ApiResponse<RefreshResponse>> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return {
        success: false,
        error: {
          message: 'No refresh token available',
          code: 'NO_REFRESH_TOKEN',
        },
      };
    }
    
    const response = await apiCall<RefreshResponse>('POST', '/auth/refresh', { refreshToken }, {
      cache: false,
    });
    
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response;
  },

  // Logout user
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiCall<{ message: string }>('POST', '/auth/logout', {}, {
      cache: false,
    });
    
    // Clear local storage regardless of response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiCall<{ user: User }>('GET', '/auth/me', undefined, {
      cache: false,
    });
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get user role
  getUserRole: (): 'teacher' | 'student' | null => {
    const user = authService.getStoredUser();
    return user?.role || null;
  },
};
