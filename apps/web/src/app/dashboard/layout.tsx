'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getUser } from '@/lib/auth';
import { Sidebar } from '@/components/shell/sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/fallback?reason=unauthenticated');
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
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Left Sidebar (Fixed on Desktop, Off-canvas on Mobile) */}
      <Sidebar
        email={email}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div
        className={`flex h-screen min-h-screen flex-col overflow-hidden transition-[padding] duration-200 ease-in-out ${
          collapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
