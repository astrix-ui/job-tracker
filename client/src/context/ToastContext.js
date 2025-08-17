import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000, options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, ...options };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (message, type = 'success', duration, options) => addToast(message, type, duration, options);
  const showSuccess = (message, duration, options) => addToast(message, 'success', duration, options);
  const showError = (message, duration, options) => addToast(message, 'error', duration, options);
  const showWarning = (message, duration, options) => addToast(message, 'warning', duration, options);
  const showInfo = (message, duration, options) => addToast(message, 'info', duration, options);
  
  const showConfirmToast = (message, onConfirm, onCancel, options = {}) => {
    return addToast(message, 'info', 0, {
      showConfirm: true,
      onConfirm,
      onCancel,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      ...options
    });
  };

  const showCancelableToast = (message, onCancelRequest, options = {}) => {
    return addToast(message, 'info', 0, {
      showCancelOption: true,
      onCancelRequest,
      ...options
    });
  };

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirmToast,
      showCancelableToast,
      removeToast
    }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          showConfirm={toast.showConfirm}
          onConfirm={toast.onConfirm}
          onCancel={toast.onCancel}
          confirmText={toast.confirmText}
          cancelText={toast.cancelText}
          showCancelOption={toast.showCancelOption}
          onCancelRequest={toast.onCancelRequest}
        />
      ))}
    </ToastContext.Provider>
  );
};