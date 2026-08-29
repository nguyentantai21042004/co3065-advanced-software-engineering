import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn('p-12 text-center flex flex-col items-center justify-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 border border-slate-200/80 mb-4 shadow-soft-sm">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
