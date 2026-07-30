import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  const disabledClass = disabled || loading ? 'btn-disabled' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon-left">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon-right">{icon}</span>
      )}
    </button>
  );
};
