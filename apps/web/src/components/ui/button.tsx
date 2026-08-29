'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  const baseStyles =
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-150 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 select-none focus-visible:outline-none';

  const variants = {
    primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-soft-xs active:bg-slate-950',
    secondary: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-soft-xs hover:border-slate-300',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-soft-xs hover:border-slate-300',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-soft-xs',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
    md: 'h-10 px-4 text-sm font-medium [&_svg]:size-4',
    lg: 'h-11 px-5 text-sm font-semibold [&_svg]:size-4',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});
