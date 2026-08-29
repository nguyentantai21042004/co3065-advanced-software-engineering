import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/80 p-4 bg-hero-grid">
      <div className="w-full max-w-md">
        {/* Top Back Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Về trang chủ</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <div className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-slate-900 text-white shadow-soft-xs">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span>AI Coach Studio</span>
          </div>
        </div>

        {/* Auth Content Card */}
        {children}

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          AI Coach · Hệ thống phân tích hồ sơ ứng viên chuyên nghiệp
        </p>
      </div>
    </div>
  );
}
