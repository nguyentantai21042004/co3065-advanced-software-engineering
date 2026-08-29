'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type PageContentWidth = 'default' | 'fluid' | 'detail' | 'wideForm' | 'form';
export type PageScrollMode = 'fill' | 'scroll';

export interface Crumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  breadcrumbs?: Crumb[];
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}

const WIDTH_CLASSES: Record<PageContentWidth, string> = {
  default: 'max-w-[1440px]',
  fluid: 'max-w-none',
  detail: 'max-w-[1280px]',
  wideForm: 'max-w-[1152px]',
  form: 'max-w-[960px]',
};

/**
 * PageFrame: Root full-height column for an operational route.
 */
export function PageFrame({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f3f6] text-[#111827]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PageHeader: Full-width chrome sitting directly above PageScroll.
 * Owns breadcrumb, title (h1), status/meta, and action cluster.
 */
export function PageHeader({
  breadcrumbs,
  title,
  description,
  meta,
  actions,
  className,
  maxWidthClass = 'max-w-6xl',
}: PageHeaderProps) {
  const trail = breadcrumbs ? breadcrumbs.slice(0, -1) : [];

  return (
    <header
      className={cn(
        'shrink-0 border-b border-[#e0e3e8] bg-white/95 px-4 sm:px-6 py-3.5 sm:py-4 backdrop-blur-md z-10',
        className,
      )}
    >
      <div className={cn('mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3', maxWidthClass)}>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {trail.length > 0 && (
              <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-[#656d79]">
                {trail.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-[#868d99]">/</span>}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-[#111827] transition-colors underline-offset-2 hover:underline"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-[#868d99]">/</span>
              </nav>
            )}

            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] truncate">
              {title}
            </h1>

            {meta && (
              <>
                <span className="text-[#868d99] text-xs" aria-hidden="true">
                  ·
                </span>
                <div className="flex items-center gap-1.5">{meta}</div>
              </>
            )}
          </div>

          {description && (
            <p className="text-xs text-[#656d79] leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * PageScroll: Full-width outer shell that owns vertical scrolling.
 * Uses Fleet page gutter tokens (16px mobile, 20px desktop).
 */
export function PageScroll({
  mode = 'scroll',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { mode?: PageScrollMode }) {
  return (
    <div
      className={cn(
        'relative min-h-0 flex-1 bg-[#f1f3f6] p-4 sm:p-5',
        mode === 'scroll'
          ? 'overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]'
          : 'flex flex-col overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PageContent: Constrained content column inside PageScroll.
 * Width matrix only, gutters are owned by PageScroll.
 */
export function PageContent({
  width = 'default',
  fill = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  width?: PageContentWidth;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col',
        WIDTH_CLASSES[width],
        fill ? 'min-h-0 flex-1' : '!flex-none !grow-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
