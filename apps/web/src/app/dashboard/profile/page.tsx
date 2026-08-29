'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, logout } from '@/lib/auth';
import {
  User,
  Shield,
  Key,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (user) setEmail(user.email);
  }, []);

  const handleSignOut = () => {
    logout();
    router.push('/auth/login');
  };

  const initial = email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hồ sơ tài khoản
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Thông tin xác thực phiên làm việc hiện tại.
        </p>
      </div>

      <Card className="overflow-hidden shadow-soft-xs bg-white">
        {/* Banner */}
        <div className="bg-slate-900 h-20 relative">
          <div className="absolute -bottom-6 left-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1 shadow-soft-sm border border-slate-200/80">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-900">
                {initial}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{email || 'Tài khoản người dùng'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="success" size="sm" dot>
                  Đang hoạt động
                </Badge>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-500">Thành viên hệ thống</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="h-3.5 w-3.5 text-red-600" />}
              onClick={handleSignOut}
              className="text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              Đăng xuất
            </Button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Chi tiết bảo mật</h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <Shield className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Giao thức xác thực</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Signed JWT Bearer Token</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <Key className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Phạm vi tài nguyên</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Đọc &amp; Ghi dữ liệu hồ sơ cá nhân</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>Phiên làm việc được bảo vệ bằng chữ ký mật mã an toàn.</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
