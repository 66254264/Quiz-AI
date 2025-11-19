import React from 'react';
import { useToast, type Toast as ToastType } from '../../contexts/ToastContext';

const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${getToastStyles()} min-w-[300px] max-w-[500px] animate-slide-in`}
      role="alert"
    >
      <span className="text-xl font-bold">{getIcon()}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = React.memo(() => {
  const { toasts } = useToast();

  console.log(`🍞 [ToastContainer] 渲染，Toast 数量:`, toasts.length);
  
  if (toasts.length > 0) {
    console.log(`🍞 [ToastContainer] Toast 列表:`, toasts);
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
});
