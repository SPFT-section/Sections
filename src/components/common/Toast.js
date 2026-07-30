import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import './Toast.css';

const toastTypes = {
  success: { icon: 'checkCircle', className: 'toast-success' },
  error: { icon: 'xCircle', className: 'toast-error' },
  warning: { icon: 'alertCircle', className: 'toast-warning' },
  info: { icon: 'info', className: 'toast-info' },
};

export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const toastType = toastTypes[type] || toastTypes.info;
  const IconComponent = toastType.icon;

  if (!isVisible) return null;

  return (
    <div className={`toast ${toastType.className} toast-show`}>
      <div className="toast-icon">
        <Icon name={IconComponent} size={20} />
      </div>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Close notification"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
