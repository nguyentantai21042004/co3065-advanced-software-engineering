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
      <div className="flex min-h-screen items-center justify-center bg-[#f1f3f6]">
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
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-[#f1f3f6]">
      <DashboardHeader email={email} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
