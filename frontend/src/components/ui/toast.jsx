import React, { createContext, useContext, useState } from 'react';

// Create a context for the toast
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Toast component
export const Toast = ({ type, title, message, onClose }) => {
  // Define colors based on toast type
  const getColors = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-100 border-green-500 text-green-700';
      case TOAST_TYPES.ERROR:
        return 'bg-red-100 border-red-500 text-red-700';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case TOAST_TYPES.INFO:
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border-l-4 shadow-md ${getColors()}`}>
      <div className="flex justify-between items-start">
        <div>
          {title && <h3 className="font-bold">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message, duration = 3000) => {
    const id = Date.now();
    const newToast = { id, type, title, message };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const { addToast, removeToast } = context;
  
  const toast = {
    success: (title, message, duration) => addToast(TOAST_TYPES.SUCCESS, title, message, duration),
    error: (title, message, duration) => addToast(TOAST_TYPES.ERROR, title, message, duration),
    info: (title, message, duration) => addToast(TOAST_TYPES.INFO, title, message, duration),
    warning: (title, message, duration) => addToast(TOAST_TYPES.WARNING, title, message, duration),
    remove: (id) => removeToast(id),
  };
  
  return { toast };
};
