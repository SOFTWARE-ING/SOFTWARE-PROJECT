import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

/**
 * Toast component for notifications
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {'success' | 'error' | 'warning' | 'info'} [props.type='info'] - Toast type
 * @param {function} [props.onClose] - Close handler
 */
export const Toast = ({ message, type = 'info', onClose }) => {
  const typeClasses = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-2xl border shadow-sm max-w-md',
      typeClasses[type]
    )}>
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-75 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};