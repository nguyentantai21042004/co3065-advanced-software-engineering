import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default'
  | 'primary'
  | 'indigo';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusTone;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  let tone: string = variant;
  if (tone === 'default') tone = 'neutral';
  if (tone === 'primary' || tone === 'indigo') tone = 'brand';

  const toneStyles: Record<string, string> = {
    neutral: 'bg-slate-100/90 text-slate-700 border-slate-200/80',
    brand: 'bg-blue-50 text-blue-700 border-blue-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-red-50 text-red-700 border-red-200/80',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  };

  const dotColors: Record<string, string> = {
    neutral: 'bg-slate-400',
    brand: 'bg-blue-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-indigo-600',
  };

  const sizeStyles = {
    sm: 'h-5 px-2 text-[11px]',
    md: 'h-5.5 px-2.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-medium rounded-full whitespace-nowrap select-none transition-colors',
        toneStyles[tone] || toneStyles.neutral,
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[tone] || dotColors.neutral)}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
