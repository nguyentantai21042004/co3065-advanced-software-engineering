import Link from 'next/link';
import { FallbackView } from '@/components/fallback/fallback-view';

export const metadata = {
  title: 'Không tìm thấy trang · AI Coach',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
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
        <FallbackView reason="not-found" />
      </main>

      {/* Bottom Footer */}
      <footer className="mx-auto w-full max-w-6xl text-center py-4 text-xs text-slate-400">
        AI Coach Studio &bull; Nền tảng phân tích &amp; phản biện hồ sơ năng lực
      </footer>
    </div>
  );
}
