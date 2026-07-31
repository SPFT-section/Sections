import React, { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext(null);

let nextToastId = 0;

const useToastState = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++nextToastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  return { toasts, showToast, removeToast };
};

export const ToastProvider = ({ children }) => {
  const value = useToastState();
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={value.toasts} removeToast={value.removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastStore = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastStore must be used within a <ToastProvider>');
  }
  return ctx;
};

export default useToastStore;
