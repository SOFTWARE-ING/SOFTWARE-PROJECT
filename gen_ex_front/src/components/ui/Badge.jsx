import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Badge component for displaying status or labels
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {'default' | 'success' | 'warning' | 'error'} [props.variant='default'] - Badge variant
 * @param {string} [props.className] - Additional CSS classes
 */
export const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variantClasses = {
    default: 'bg-tertiary text-secondary',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};