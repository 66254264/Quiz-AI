import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    console.log(`🍞 [ToastContext] removeToast 被调用:`, id);
    // 清除对应的 timeout
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, type, message, duration };

      console.log(`🍞 [ToastContext] 显示 Toast:`, { type, message, duration, id });
      
      setToasts((prev) => {
        const newToasts = [...prev, toast];
        console.log(`🍞 [ToastContext] 当前 Toast 数量:`, newToasts.length);
        return newToasts;
      });

      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          console.log(`🍞 [ToastContext] 定时移除 Toast:`, id);
          timeoutsRef.current.delete(id);
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
        
        timeoutsRef.current.set(id, timeoutId);
        console.log(`🍞 [ToastContext] 设置定时器:`, id, '时长:', duration);
      }
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast('success', message, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast('error', message, duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast('warning', message, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast('info', message, duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
