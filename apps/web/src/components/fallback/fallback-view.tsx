'use client';

import Link from 'next/link';
import {
  Lock,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  Home,
  LogIn,
  UserPlus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type FallbackReason = 'unauthenticated' | 'not-found' | 'forbidden' | 'error';

interface FallbackViewProps {
  reason?: FallbackReason;
  returnUrl?: string | null;
  className?: string;
}

export function FallbackView({
  reason = 'unauthenticated',
  returnUrl,
  className = '',
}: FallbackViewProps) {
  const config = {
    unauthenticated: {
      badge: 'Yêu cầu xác thực',
      badgeVariant: 'brand' as const,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      icon: <Lock className="h-7 w-7" />,
      title: 'Bạn chưa đăng nhập vào hệ thống',
      description:
        'Trang hoặc tính năng bạn đang cố truy cập yêu cầu tài khoản thành viên để đảm bảo tính an toàn và bảo mật cho dữ liệu hồ sơ CV của bạn.',
      primaryAction: {
        label: 'Đăng nhập ngay',
        href: returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/login',
        icon: <LogIn className="h-4 w-4" />,
      },
      secondaryAction: {
        label: 'Tạo tài khoản mới',
        href: '/auth/register',
        icon: <UserPlus className="h-4 w-4" />,
      },
      tertiaryAction: {
        label: 'Về trang chủ',
        href: '/',
        icon: <Home className="h-4 w-4" />,
      },
      footerText: 'Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng thử đăng nhập lại.',
    },
    'not-found': {
      badge: 'Lỗi 404',
      badgeVariant: 'neutral' as const,
      iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
      icon: <FileQuestion className="h-7 w-7" />,
      title: 'Không tìm thấy trang yêu cầu',
      description:
        'Địa chỉ đường dẫn bạn đang truy cập không tồn tại, đã bị di chuyển hoặc hệ thống vừa cập nhật cấu trúc điều hướng mới.',
      primaryAction: {
        label: 'Về trang chủ',
        href: '/',
        icon: <Home className="h-4 w-4" />,
      },
      secondaryAction: {
        label: 'Tải lên CV',
        href: '/dashboard/upload',
        icon: <ArrowRight className="h-4 w-4" />,
      },
      tertiaryAction: {
        label: 'Đăng nhập tài khoản',
        href: '/auth/login',
        icon: <LogIn className="h-4 w-4" />,
      },
      footerText: 'Kiểm tra lại đường dẫn trên thanh địa chỉ của trình duyệt.',
    },
    forbidden: {
      badge: 'Từ chối truy cập',
      badgeVariant: 'danger' as const,
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
      icon: <ShieldAlert className="h-7 w-7" />,
      title: 'Quyền truy cập bị hạn chế',
      description:
        'Tài khoản của bạn hiện không có đủ quyền để xem hoặc thao tác trên tài nguyên này. Vui lòng liên hệ quản trị viên nếu cần cấp quyền.',
      primaryAction: {
        label: 'Về trang chủ',
        href: '/',
        icon: <Home className="h-4 w-4" />,
      },
      secondaryAction: {
        label: 'Đăng nhập tài khoản khác',
        href: '/auth/login',
        icon: <LogIn className="h-4 w-4" />,
      },
      tertiaryAction: null,
      footerText: 'Mã tham chiếu bảo mật: SEC-403-FORBIDDEN',
    },
    error: {
      badge: 'Sự cố xử lý',
      badgeVariant: 'danger' as const,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      icon: <RefreshCw className="h-7 w-7" />,
      title: 'Đã xảy ra sự cố không mong muốn',
      description:
        'Hệ thống gặp sự cố tạm thời trong quá trình xử lý yêu cầu. Vui lòng thử tải lại trang hoặc quay về trang chủ.',
      primaryAction: {
        label: 'Tải lại trang',
        href: '#reload',
        icon: <RefreshCw className="h-4 w-4" />,
        isReload: true,
      },
      secondaryAction: {
        label: 'Về trang chủ',
        href: '/',
        icon: <Home className="h-4 w-4" />,
      },
      tertiaryAction: null,
      footerText: 'Đội ngũ kỹ thuật đã nhận được nhật ký ghi nhận sự cố.',
    },
  }[reason];

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <Card className="overflow-hidden shadow-soft-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 text-center animate-fade-in t-reveal">
        <CardContent className="p-0 flex flex-col items-center">
          {/* Icon Badge */}
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-soft-xs ${config.iconBg}`}
          >
            {config.icon}
          </div>

          {/* Status Pill Badge */}
          <Badge variant={config.badgeVariant} className="mb-3">
            {config.badge}
          </Badge>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            {config.title}
          </h1>

          {/* Description */}
          <p className="mt-2.5 max-w-md text-xs sm:text-sm leading-relaxed text-slate-500">
            {config.description}
          </p>

          {/* Main Action Buttons */}
          <div className="mt-7 flex flex-col items-center gap-3.5 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-sm">
              {/* Primary Action */}
              {config.primaryAction && (
                'isReload' in config.primaryAction && config.primaryAction.isReload ? (
                  <Button
                    size="md"
                    onClick={() => window.location.reload()}
                    leftIcon={config.primaryAction.icon}
                    className="w-full sm:flex-1 h-10 shadow-soft-xs"
                  >
                    {config.primaryAction.label}
                  </Button>
                ) : (
                  <Link href={config.primaryAction.href} className="w-full sm:flex-1">
                    <Button
                      size="md"
                      leftIcon={config.primaryAction.icon}
                      className="w-full h-10 shadow-soft-xs"
                    >
                      {config.primaryAction.label}
                    </Button>
                  </Link>
                )
              )}

              {/* Secondary Action */}
              {config.secondaryAction && (
                <Link href={config.secondaryAction.href} className="w-full sm:flex-1">
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={config.secondaryAction.icon}
                    className="w-full h-10"
                  >
                    {config.secondaryAction.label}
                  </Button>
                </Link>
              )}
            </div>

            {/* Tertiary Return Link */}
            {config.tertiaryAction && (
              <Link
                href={config.tertiaryAction.href}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium pt-0.5 group"
              >
                {config.tertiaryAction.icon}
                <span className="group-hover:underline underline-offset-2">
                  {config.tertiaryAction.label}
                </span>
              </Link>
            )}
          </div>

          {/* Footnote */}
          {config.footerText && (
            <p className="mt-6 text-[11px] leading-5 text-slate-400">
              {config.footerText}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
