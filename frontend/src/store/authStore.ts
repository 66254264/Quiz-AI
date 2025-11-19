import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('📡 调用 authService.login...');
      const response = await authService.login({ username, password });
      console.log('📡 登录响应:', response);
      
      if (response.success && response.data) {
        console.log('✅ 登录成功，用户数据:', response.data.user);
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        console.error('❌ 登录失败:', response.error);
        set({
          error: response.error?.message || 'Login failed',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      console.error('💥 登录异常:', error);
      set({
        error: error.message || 'An error occurred during login',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          error: response.error?.message || 'Registration failed',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred during registration',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: () => {
    const user = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    
    set({
      user,
      isAuthenticated,
    });
  },
}));
