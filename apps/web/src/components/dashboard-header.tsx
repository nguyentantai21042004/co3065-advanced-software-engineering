'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/lib/auth';
import {
  Upload,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  Lightbulb,
} from 'lucide-react';
import { Button } from './ui/button';

interface DashboardHeaderProps {
  email: string | null;
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard/upload', label: 'Tải lên CV', icon: Upload },
    { href: '/dashboard/history', label: 'Lịch sử hồ sơ', icon: History },
    { href: '/dashboard/advice', label: 'Lời khuyên', icon: Lightbulb },
    { href: '/dashboard/profile', label: 'Tài khoản', icon: User },
    { href: '/dashboard/settings', label: 'Hệ thống', icon: Settings },
  ];

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  const userInitial = email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 h-[72px] sm:h-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard/upload" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-soft-xs group-hover:scale-105 transition-transform">
              <img src="/logo-mark.svg" alt="AI Coach" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">AI Coach</span>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">Career Studio</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
              {userInitial}
            </div>
            <span className="text-xs font-medium text-slate-700 max-w-[170px] truncate">
              {email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            leftIcon={<LogOut className="h-3.5 w-3.5" />}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 shadow-soft">
          <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-slate-700 border-b border-slate-100 pb-2 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              {userInitial}
            </div>
            <span className="truncate">{email}</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
