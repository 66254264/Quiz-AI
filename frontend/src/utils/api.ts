import axios from 'axios';
import type { ApiResponse } from '../types';
import { apiCache, CacheTTL } from './cache';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// 调试：打印 API URL
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌐 Environment:', (import.meta as any).env);

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 请求拦截器 - URL:', config.url);
    console.log('🔑 Token 存在:', !!token);
    if (token) {
      console.log('🔑 Token 前20字符:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ 没有找到 accessToken');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // 不要在登录和注册接口的 401 错误时重定向
      // 这些是预期的错误（用户名密码错误等）
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        console.log('🔒 检测到 401 未授权，清除 token 并重定向到登录页');
        // Handle unauthorized access
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.log('🔒 登录/注册接口返回 401，不重定向');
      }
    }
    return Promise.reject(error);
  }
);

// Generic API call wrapper with caching support
export const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  options?: {
    cache?: boolean;
    cacheTTL?: number;
  }
): Promise<ApiResponse<T>> => {
  try {
    const shouldCache = options?.cache !== false;
    
    // Check cache for GET requests
    if (method === 'GET' && shouldCache) {
      // For GET requests, use the URL as the cache key (it already contains query params)
      const cacheKey = url;
      const cachedData = apiCache.get<ApiResponse<T>>(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return cachedData;
      }
    }

    console.log(`🌐 API Request: ${method} ${url}${shouldCache ? ' (cacheable)' : ' (no-cache)'}`);
    
    const response = await api.request({
      method,
      url,
      data,
    });

    const result = response.data;

    // Cache successful GET requests
    if (method === 'GET' && result.success && shouldCache) {
      // For GET requests, use the URL as the cache key (it already contains query params)
      const cacheKey = url;
      const ttl = options?.cacheTTL || CacheTTL.MEDIUM;
      apiCache.set(cacheKey, result, ttl);
      console.log(`💾 Cached: ${cacheKey} (TTL: ${ttl}ms)`);
    }

    // Invalidate related cache on mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      invalidateCacheForMutation(url);
    }

    return result;
  } catch (error: any) {
    console.error(`❌ API Error: ${method} ${url}`, error);
    
    // 如果服务器返回了错误响应
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // 确保返回标准的 ApiResponse 格式
      return {
        success: false,
        error: {
          message: errorData.error?.message || errorData.message || '请求失败',
          code: errorData.error?.code || errorData.code || 'API_ERROR',
        },
      };
    }
    
    // 网络错误或其他错误
    return {
      success: false,
      error: {
        message: error.message || '网络连接失败，请检查您的网络',
        code: 'NETWORK_ERROR',
      },
    };
  }
};

/**
 * Invalidate cache entries related to a mutation
 */
const invalidateCacheForMutation = (url: string): void => {
  // Extract resource type from URL
  if (url.includes('/questions')) {
    apiCache.invalidatePattern(/\/questions/);
  } else if (url.includes('/quizzes')) {
    apiCache.invalidatePattern(/\/quizzes/);
  } else if (url.includes('/analytics')) {
    apiCache.invalidatePattern(/\/analytics/);
  }
};

/**
 * Manually clear cache
 */
export const clearCache = (): void => {
  apiCache.clear();
};

/**
 * Invalidate specific cache pattern
 */
export const invalidateCache = (pattern: string | RegExp): void => {
  apiCache.invalidatePattern(pattern);
};