'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Mail, ArrowLeft, Info, CheckCircle2, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <Card className="overflow-hidden shadow-soft-md bg-white border-slate-200/90">
      <div className="p-6 pb-2 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Khôi phục mật khẩu</h1>
        <p className="mt-1 text-xs text-slate-500">
          Hỗ trợ lấy lại quyền truy cập tài khoản
        </p>
      </div>

      <CardContent className="p-6 pt-2">
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            Trong môi trường nội bộ, việc khôi phục mật khẩu được xử lý qua quản trị viên hoặc tạo tài khoản mới.
          </div>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-center space-y-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
              Nếu tài khoản <strong className="font-semibold">{email}</strong> tồn tại, liên kết khôi phục sẽ được gửi đi.
            </p>
            <div className="pt-1">
              <Link href="/auth/register">
                <Button size="sm" variant="outline" className="w-full">
                  Tạo tài khoản mới
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3.5">
            <Input
              label="Email tài khoản"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Button type="submit" className="w-full" size="md" rightIcon={<Send className="h-4 w-4" />}>
              Gửi yêu cầu khôi phục
            </Button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại trang đăng nhập</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
