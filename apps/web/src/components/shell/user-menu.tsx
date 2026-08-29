'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Command,
  LogOut,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ShortcutsModal } from './shortcuts-modal';
import { notify } from '@/lib/notify';

interface UserMenuProps {
  email: string | null;
  collapsed?: boolean;
}

export function UserMenu({ email, collapsed = false }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initial = email ? email.charAt(0).toUpperCase() : 'U';
  const displayName = email?.split('@')[0] ?? 'Người dùng';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    logout();
    notify.info('Đã đăng xuất', 'Phiên làm việc của bạn đã kết thúc an toàn.');
    router.push('/');
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        {/* Trigger Button */}
        {collapsed ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={`Tài khoản: ${email}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors mx-auto"
          >
            {initial}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex w-full items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2 text-left shadow-soft-xs hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-soft-2xs">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5" title={email ?? ''}>
                  {email ?? '—'}
                </p>
              </div>
            </div>

            <ChevronUp
              className={cn(
                'h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0',
                open ? 'rotate-180 text-slate-700' : '',
              )}
            />
          </button>
        )}

        {/* Popover Dropdown Menu */}
        {open && (
          <div
            className={cn(
              'absolute bottom-full mb-2 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in',
              collapsed ? 'left-full ml-2 bottom-0 w-60' : 'left-0 right-0 w-full min-w-[230px]',
            )}
          >
            {/* User Identity Header */}
            <div className="px-2.5 py-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1 space-y-0.5">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Hồ sơ tài khoản</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Trạng thái hệ thống</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShortcutsOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Command className="h-3.5 w-3.5 text-slate-400" />
                  <span>Phím tắt trợ giúp</span>
                </div>
                <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.2 text-[10px] font-mono text-slate-400">
                  ?
                </kbd>
              </button>
            </div>

            {/* Divider & Logout */}
            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
