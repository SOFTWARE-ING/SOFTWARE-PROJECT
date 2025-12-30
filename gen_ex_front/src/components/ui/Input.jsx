import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Input component for text input fields
 * @param {Object} props
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Input value
 * @param {function} [props.onChange] - Change handler
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.className] - Additional CSS classes
 */
export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2 border border-primary rounded-xl bg-secondary text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};