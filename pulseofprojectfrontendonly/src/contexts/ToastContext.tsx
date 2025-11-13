import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastData, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, description?: string, duration?: number) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    description?: string,
    duration: number = 5000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = {
      id,
      type,
      message,
      description,
      duration,
      position: 'top-right'
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration + animation time
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration + 500);
    }
  }, [removeToast]);

  const success = useCallback((message: string, description?: string) => {
    showToast(message, 'success', description);
  }, [showToast]);

  const error = useCallback((message: string, description?: string) => {
    showToast(message, 'error', description);
  }, [showToast]);

  const warning = useCallback((message: string, description?: string) => {
    showToast(message, 'warning', description);
  }, [showToast]);

  const info = useCallback((message: string, description?: string) => {
    showToast(message, 'info', description);
  }, [showToast]);

  const value: ToastContextType = {
    showToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
