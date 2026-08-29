'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CvListItemWire } from '@aicoach/shared/contracts/cv';
import { api } from '@/lib/api';
import { setCurrentFile } from '@/lib/auth';
import {
  FileText,
  Search,
  Calendar,
  ArrowRight,
  Upload,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';

export default function HistoryPage() {
  const [items, setItems] = useState<CvListItemWire[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api<CvListItemWire[]>('/cv/list')
      .then((res) => setItems(res.data ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải danh sách hồ sơ'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = item.original_file_name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? item.status === 'completed'
          : item.status !== 'completed';
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const processingCount = items.filter((i) => i.status !== 'completed').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
            Lịch sử hồ sơ CV
          </h1>
          <p className="mt-0.5 text-xs text-[#656d79]">
            Danh sách tất cả các hồ sơ ứng viên đã được tải lên và phân tích.
          </p>
        </div>

        <Link href="/dashboard/upload">
          <Button size="sm" leftIcon={<Upload className="h-4 w-4" />}>
            Tải lên hồ sơ mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards (Fleet Flat Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#656d79]">Tổng số hồ sơ</p>
            <p className="text-xl font-semibold text-[#111827] mt-1 tabular-nums">{totalCount}</p>
            <p className="text-[11px] text-[#868d99] mt-0.5">Tệp lưu trữ</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f4f5f8] text-[#374151] border border-[#e0e3e8]">
            <FileText className="h-4 w-4 text-[#ff7500]" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#656d79]">Đã phân tích xong</p>
            <p className="text-xl font-semibold text-[#0e6027] mt-1 tabular-nums">{completedCount}</p>
            <p className="text-[11px] text-[#868d99] mt-0.5">Báo cáo sẵn sàng</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ecfdf5] text-[#0e6027] border border-[#a7f3d0]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#656d79]">Đang trong hàng đợi</p>
            <p className="text-xl font-semibold text-[#7f5b00] mt-1 tabular-nums">{processingCount}</p>
            <p className="text-[11px] text-[#868d99] mt-0.5">Đang xử lý</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#fffbeb] text-[#7f5b00] border border-[#fde68a]">
            <Clock className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#868d99]">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên tệp…"
            className="w-full rounded-md border border-[#e0e3e8] bg-white py-1.5 pl-8 pr-7 text-xs text-[#111827] placeholder:text-[#868d99] focus:border-[#ff7500] focus:outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#868d99] hover:text-[#111827]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs (tabs-sliding transition) */}
        <Tabs
          tabs={[
            { id: 'all', label: 'Tất cả', count: totalCount },
            { id: 'completed', label: 'Hoàn thành', count: completedCount },
            { id: 'processing', label: 'Đang xử lý', count: processingCount },
          ]}
          activeTab={statusFilter}
          onChange={(tab) => setStatusFilter(tab as 'all' | 'completed' | 'processing')}
        />
      </div>

      {error && (
        <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] p-3 text-xs text-[#b91c1c]">
          {error}
        </div>
      )}

      {/* Grid of CV Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6 text-[#ff7500]" />}
          title={query ? 'Không tìm thấy hồ sơ phù hợp' : 'Chưa có hồ sơ nào được tải lên'}
          description={
            query
              ? `Không có tệp nào khớp với từ khóa "${query}".`
              : 'Hãy tải lên CV đầu tiên để bắt đầu phân tích và tạo hồ sơ đánh giá.'
          }
          action={
            query ? (
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Xóa bộ lọc tìm kiếm
              </Button>
            ) : (
              <Link href="/dashboard/upload">
                <Button size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                  Tải lên hồ sơ ngay
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isCompleted = item.status === 'completed';
            const isDocx = item.original_file_name.toLowerCase().endsWith('.docx');

            return (
              <Card
                key={item.file_id}
                className="p-4 flex flex-col justify-between hover:border-[#868d99] transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-bold text-[10px] ${
                          isDocx
                            ? 'bg-[#eef2ff] text-[#0e4174] border border-[#c7d2fe]'
                            : 'bg-[#fff7ed] text-[#ff7500] border border-[#fed7aa]'
                        }`}
                      >
                        {isDocx ? 'DOCX' : 'PDF'}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-medium text-xs text-[#111827] truncate group-hover:text-[#ff7500] transition-colors"
                          title={item.original_file_name}
                        >
                          {item.original_file_name}
                        </p>
                        <p className="text-[11px] text-[#868d99] font-mono tabular-nums">
                          {(item.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={isCompleted ? 'success' : 'warning'}
                      size="sm"
                      dot={!isCompleted}
                    >
                      {isCompleted ? 'Hoàn thành' : 'Đang xử lý'}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-[#e0e3e8] flex items-center gap-1.5 text-[11px] text-[#868d99]">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {new Date(item.uploaded_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e0e3e8] flex justify-end">
                  <Link
                    href={`/dashboard/results?file_id=${item.file_id}`}
                    onClick={() => {
                      setCurrentFile({
                        fileId: item.file_id,
                        name: item.original_file_name,
                        size: item.file_size,
                        uploadedAt: item.uploaded_at,
                      });
                    }}
                    className="w-full"
                  >
                    <Button
                      variant={isCompleted ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      {isCompleted ? 'Xem báo cáo kết quả' : 'Kiểm tra trạng thái'}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
