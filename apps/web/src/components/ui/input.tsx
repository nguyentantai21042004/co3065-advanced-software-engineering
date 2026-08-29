'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const [shaking, setShaking] = React.useState(false);

  // Jakub Antalík / transitions.dev — error state shake
  React.useEffect(() => {
    if (error) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 340);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-soft-xs focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-red-500 focus:border-red-500',
            shaking && 'is-shaking',
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 animate-fade-in">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});
