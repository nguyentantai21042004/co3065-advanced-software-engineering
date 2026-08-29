'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FallbackView, type FallbackReason } from '@/components/fallback/fallback-view';

function FallbackInner() {
  const searchParams = useSearchParams();
  const rawReason = searchParams.get('reason') ?? 'unauthenticated';
  const returnUrl = searchParams.get('returnUrl');

  const reason: FallbackReason =
    rawReason === 'not-found' || rawReason === 'forbidden' || rawReason === 'error'
      ? rawReason
      : 'unauthenticated';

  return <FallbackView reason={reason} returnUrl={returnUrl} />;
}

export default function FallbackPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Identity Header */}
      <header className="mx-auto w-full max-w-6xl flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-soft-xs bg-white border border-slate-200">
            <img src="/logo-mark.svg" alt="AI Coach" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              AI Coach
            </span>
            <p className="text-[10px] text-slate-500 font-medium leading-none">Career Studio</p>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Về trang chủ →
        </Link>
      </header>

      {/* Main Center Panel */}
      <main className="my-auto py-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            </div>
          }
        >
          <FallbackInner />
        </Suspense>
      </main>

      {/* Bottom Footer */}
      <footer className="mx-auto w-full max-w-6xl text-center py-4 text-xs text-slate-400">
        AI Coach Studio &bull; Nền tảng phân tích &amp; phản biện hồ sơ năng lực
      </footer>
    </div>
  );
}
