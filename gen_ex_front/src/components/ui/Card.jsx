import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Card component for displaying content in a contained box
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {function} [props.onClick] - Click handler
 */
export const Card = ({ children, className, onClick, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl shadow-sm border border-primary p-6 transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card header component
 */
export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Card title component
 */
export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-primary', className)} {...props}>
      {children}
    </h3>
  );
};

/**
 * Card content component
 */
export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};