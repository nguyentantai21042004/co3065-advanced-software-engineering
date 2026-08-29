'use client';

import { X, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['⌘', 'K'], desc: 'Mở tìm kiếm nhanh và bảng lệnh' },
  { keys: ['/'], desc: 'Tìm kiếm nhanh khi không nhập liệu' },
  { keys: ['⌘', '\\'], desc: 'Thu gọn / Mở rộng thanh bên' },
  { keys: ['?'], desc: 'Mở bảng trợ giúp phím tắt này' },
  { keys: ['Esc'], desc: 'Đóng hộp thoại hoặc hủy tìm kiếm' },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Command className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Phím tắt hệ thống</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-slate-50 last:border-none"
            >
              <span className="text-slate-700">{item.desc}</span>
              <div className="flex items-center gap-1 shrink-0">
                {item.keys.map((k, ki) => (
                  <kbd
                    key={ki}
                    className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 shadow-soft-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <Button size="sm" onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </div>
    </div>
  );
}
