'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getUser } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard-header';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    setEmail(user.email);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
          <p className="text-xs font-medium text-slate-500">
            Đang tải dữ liệu người dùng…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <DashboardHeader email={email} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        AI Coach · Hệ thống phân tích hồ sơ ứng viên &amp; định hướng sự nghiệp
      </footer>
    </div>
  );
}
