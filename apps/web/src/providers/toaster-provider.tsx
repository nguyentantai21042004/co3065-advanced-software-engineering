'use client';

import { Toaster } from 'sonner';

/**
 * Transient feedback provider for the whole portal (Fleet-convention).
 * Tone is carried by a 3.5px left border indicator plus status icon.
 */
export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      closeButton
      duration={4500}
      toastOptions={{
        classNames: {
          toast:
            'group flex items-start gap-3 w-full bg-white text-slate-900 border border-slate-200/90 shadow-soft-md rounded-xl p-3.5 text-sm font-medium',
          success: 'ln-toast-success',
          error: 'ln-toast-error',
          warning: 'ln-toast-warning',
          info: 'ln-toast-info',
          title: 'font-semibold text-slate-900 text-sm leading-snug',
          description: 'text-xs text-slate-500 font-normal leading-relaxed mt-0.5',
          closeButton:
            '!bg-transparent !border-none !text-slate-400 hover:!text-slate-700 !static !ml-auto !p-0.5',
        },
      }}
    />
  );
}
