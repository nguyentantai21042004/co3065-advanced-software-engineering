'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type FormEvent } from 'react';
import { login } from '@/lib/auth';
import { Mail, Lock, Eye, EyeOff, Compass, ArrowRight, AlertCircle, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (error) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 340);
      return () => clearTimeout(timer);
    }
  }, [error]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await login(email, password);
      router.push('/dashboard/upload');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thông tin đăng nhập không chính xác.');
    } finally {
      setPending(false);
    }
  }

  function fillSampleAccount() {
    setEmail('demo@aicoach.local');
    setPassword('demo123456');
    setError('');
  }

  return (
    <Card className={`overflow-hidden shadow-soft-md bg-white border-slate-200/90 ${shaking ? 'is-shaking' : ''}`}>
      {/* Brand Header */}
      <div className="p-6 pb-2 text-center">
        <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-soft-xs">
          <Compass className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Đăng nhập tài khoản</h1>
        <p className="mt-1 text-xs text-slate-500">Truy cập hệ thống phân tích &amp; đánh giá hồ sơ</p>
      </div>

      <CardContent className="p-6 pt-2">
        {/* Quick Fill Account shortcut */}
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-xs text-slate-700 font-medium">Tài khoản thử nghiệm</span>
          </div>
          <button
            type="button"
            onClick={fillSampleAccount}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 cursor-pointer transition-colors"
          >
            Điền nhanh
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3.5">
          <Input
            label="Địa chỉ email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <span className="t-icon-swap" data-state={showPassword ? 'b' : 'a'}>
                  <span className="t-icon" data-icon="a">
                    <Eye className="h-4 w-4" />
                  </span>
                  <span className="t-icon" data-icon="b">
                    <EyeOff className="h-4 w-4" />
                  </span>
                </span>
              </button>
            }
          />

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            loading={pending}
            className="w-full"
            size="md"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {pending ? 'Đang xác thực…' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
