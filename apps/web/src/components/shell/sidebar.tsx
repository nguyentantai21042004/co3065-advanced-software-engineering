'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Upload,
  FileText,
  Lightbulb,
  Search,
  PanelLeft,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';
import { CommandPalette } from './command-palette';
import { ShortcutsModal } from './shortcuts-modal';

interface SidebarProps {
  email: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  email,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  const isControlled = externalCollapsed !== undefined;
  const collapsed = isControlled ? externalCollapsed : internalCollapsed;
  const toggleCollapse = React.useCallback(() => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed((prev) => !prev);
  }, [onToggleCollapse]);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Global Keyboard Shortcuts (Fleet Convention)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute('contenteditable') === 'true';

      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // ⌘\ or Ctrl+\ -> Toggle Sidebar Collapse
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleCollapse();
        return;
      }

      // If typing in an input field, do not intercept single-key shortcuts
      if (isInput) return;

      // '/' -> Search
      if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // '?' -> Shortcuts Modal
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { href: '/dashboard/upload', label: 'Tải lên CV', icon: Upload },
    { href: '/dashboard/history', label: 'Lịch sử hồ sơ', icon: FileText },
    { href: '/dashboard/advice', label: 'Lời khuyên cá nhân', icon: Lightbulb },
  ];

  const renderNavContent = (isMobile = false) => {
    const isCol = collapsed && !isMobile;

    return (
      <div className="flex h-full flex-col justify-between">
        {/* Top Header & Navigation */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Header */}
          <div
            className={cn(
              'flex h-16 shrink-0 items-center border-b border-slate-200/80 px-3 transition-all',
              isCol ? 'justify-center px-1' : 'justify-between px-4',
            )}
          >
            {isCol ? (
              <button
                type="button"
                onClick={toggleCollapse}
                title="Mở rộng thanh bên (⌘\)"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-soft-xs hover:scale-105 transition-transform"
              >
                <img src="/logo-mark.svg" alt="AI Coach" className="h-8 w-8 object-contain" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Link href="/dashboard/upload" className="flex items-center gap-2.5 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-soft-xs group-hover:scale-105 transition-transform">
                    <img src="/logo-mark.svg" alt="AI Coach" className="h-8 w-8 object-contain" />
                  </div>
                  <div>
                    <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                      AI Coach
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
                      Career Studio
                    </span>
                  </div>
                </Link>

                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Đóng menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    title="Thu gọn thanh bên (⌘\)"
                    className="hidden md:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Search Hotkey Trigger (⌘K) */}
          <div className={cn('pt-3 pb-1', isCol ? 'px-2' : 'px-3')}>
            {isCol ? (
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                title="Tìm kiếm nhanh (⌘K)"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors mx-auto"
              >
                <Search className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="group flex h-10 w-full items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 text-left text-xs font-medium text-slate-400 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 transition-all shadow-soft-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  <span className="truncate">Tìm kiếm &amp; Lệnh…</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-soft-2xs">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>

          {/* Navigation Section */}
          <div className={cn('flex-1 overflow-y-auto py-2 space-y-1', isCol ? 'px-1.5' : 'px-2.5')}>
            {!isCol && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hồ sơ &amp; Phân tích
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                if (isCol) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-all mx-auto',
                        isActive
                          ? 'bg-slate-900 text-white shadow-soft-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', isActive ? 'text-blue-400' : 'text-slate-500')} />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex h-10 items-center justify-between gap-2.5 rounded-xl px-2.5 text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-slate-100 text-slate-900 border border-slate-200/80 shadow-soft-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                          isActive
                            ? 'bg-white text-blue-600 border-slate-200/80 shadow-soft-2xs'
                            : 'bg-slate-100/70 text-slate-400 border-slate-200/40 group-hover:bg-white group-hover:text-slate-600',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User CTA at Bottom of Sidebar (Includes Profile, Settings, Hotkeys, Logout) */}
        <footer
          className={cn(
            'border-t border-slate-200/80 bg-white p-2.5 shrink-0',
            isCol ? 'flex justify-center px-1' : 'px-3',
          )}
        >
          <UserMenu email={email} collapsed={isCol} />
        </footer>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo-mark.svg" alt="AI Coach" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold text-slate-900">AI Coach Studio</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {renderNavContent(true)}
      </div>

      {/* Desktop Left Sidebar (Collapsible: 64px vs 256px) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200/80 bg-white md:block transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {renderNavContent(false)}
      </aside>

      {/* Modals & Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <ShortcutsModal
        open={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </>
  );
}
