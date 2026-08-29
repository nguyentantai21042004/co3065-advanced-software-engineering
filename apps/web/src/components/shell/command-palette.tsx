'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Upload,
  FileText,
  Lightbulb,
  User,
  Settings,
  LogOut,
  ArrowRight,
  Command,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  sub?: string;
  icon: React.ElementType;
  shortcut?: string;
  category: 'Điều hướng' | 'Cài đặt' | 'Hành động';
  action: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'upload',
        label: 'Tải lên hồ sơ ứng viên',
        sub: 'Tải lên CV mới định dạng PDF hoặc Word',
        icon: Upload,
        shortcut: 'G U',
        category: 'Điều hướng',
        action: () => {
          onClose();
          router.push('/dashboard/upload');
        },
      },
      {
        id: 'history',
        label: 'Lịch sử hồ sơ CV',
        sub: 'Xem danh sách và kết quả các CV đã phân tích',
        icon: FileText,
        shortcut: 'G H',
        category: 'Điều hướng',
        action: () => {
          onClose();
          router.push('/dashboard/history');
        },
      },
      {
        id: 'advice',
        label: 'Lời khuyên & Định hướng cá nhân',
        sub: 'Xem timeline tiến trình và sổ tay mục tiêu',
        icon: Lightbulb,
        shortcut: 'G A',
        category: 'Điều hướng',
        action: () => {
          onClose();
          router.push('/dashboard/advice');
        },
      },
      {
        id: 'profile',
        label: 'Hồ sơ tài khoản',
        sub: 'Xem thông tin bảo mật và phiên làm việc',
        icon: User,
        shortcut: 'G P',
        category: 'Cài đặt',
        action: () => {
          onClose();
          router.push('/dashboard/profile');
        },
      },
      {
        id: 'settings',
        label: 'Trạng thái hệ thống',
        sub: 'Kiểm tra kết nối API Gateway và hạ tầng',
        icon: Settings,
        shortcut: 'G S',
        category: 'Cài đặt',
        action: () => {
          onClose();
          router.push('/dashboard/settings');
        },
      },
      {
        id: 'logout',
        label: 'Đăng xuất tài khoản',
        sub: 'Kết thúc phiên làm việc hiện tại',
        icon: LogOut,
        category: 'Hành động',
        action: () => {
          onClose();
          logout();
          router.push('/');
        },
      },
    ],
    [onClose, router],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.sub && c.sub.toLowerCase().includes(q)),
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Box */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex h-13 items-center border-b border-slate-200 px-4 gap-3">
          <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tính năng, tài liệu hoặc thao tác… (ví dụ: upload, cv, settings)"
            className="h-full w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 shadow-none">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Không tìm thấy lệnh nào phù hợp với &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                const active = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                          active
                            ? 'bg-slate-800 text-blue-400'
                            : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-xs font-semibold truncate', active ? 'text-white' : 'text-slate-900')}>
                          {item.label}
                        </p>
                        {item.sub && (
                          <p className={cn('text-[11px] truncate', active ? 'text-slate-300' : 'text-slate-400')}>
                            {item.sub}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <kbd
                          className={cn(
                            'rounded border px-1.5 py-0.5 text-[10px] font-mono shadow-none',
                            active
                              ? 'border-slate-700 bg-slate-800 text-slate-300'
                              : 'border-slate-200 bg-slate-50 text-slate-400',
                          )}
                        >
                          {item.shortcut}
                        </kbd>
                      )}
                      <ArrowRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform',
                          active ? 'translate-x-0.5 text-blue-400' : 'text-transparent',
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info with Hotkey hints */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px]">↑↓</kbd> để chọn
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px]">↵</kbd> để mở
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px]">esc</kbd> để đóng
          </span>
        </div>
      </div>
    </div>
  );
}
