import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Skeleton component for loading states
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-700 rounded',
        className
      )}
      {...props}
    />
  );
};

/**
 * Card skeleton for loading states
 */
export const CardSkeleton = () => {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex space-x-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
};

/**
 * Settings section skeleton
 */
export const SettingsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <CardSkeleton />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
};