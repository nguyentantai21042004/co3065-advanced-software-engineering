import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: 'primary' | 'success' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function Progress({
  className,
  value,
  variant = 'primary',
  size = 'md',
  animated = false,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const variants = {
    primary: 'bg-blue-600',
    success: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50', sizes[size], className)}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          variants[variant],
          animated && 'animate-pulse',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
