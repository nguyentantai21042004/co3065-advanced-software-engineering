'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const [hasRendered, setHasRendered] = React.useState(false);

  const updatePill = React.useCallback(
    (animate = true) => {
      const activeEl = tabRefs.current.get(activeTab);
      const pillEl = pillRef.current;
      if (!activeEl || !pillEl) return;

      if (!animate) {
        pillEl.style.transition = 'none';
      } else {
        pillEl.style.transition = '';
      }

      pillEl.style.transform = `translateX(${activeEl.offsetLeft}px)`;
      pillEl.style.width = `${activeEl.offsetWidth}px`;

      if (!animate) {
        // Force reflow so subsequent state updates animate cleanly
        void pillEl.offsetHeight;
        pillEl.style.transition = '';
      }
    },
    [activeTab],
  );

  React.useEffect(() => {
    updatePill(hasRendered);
    if (!hasRendered) {
      setHasRendered(true);
    }
  }, [activeTab, hasRendered, updatePill]);

  React.useEffect(() => {
    const handleResize = () => updatePill(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePill]);

  return (
    <div
      ref={containerRef}
      className={cn('t-tabs', className)}
      role="tablist"
    >
      <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" />
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className="t-tab"
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-semibold transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-200/80 text-slate-600',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
