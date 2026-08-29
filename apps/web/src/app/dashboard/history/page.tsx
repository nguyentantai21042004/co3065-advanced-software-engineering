'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CvListItemWire } from '@/types/wire';
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
import { PageFrame, PageHeader, PageScroll, PageContent } from '@/components/shell/page-frame';
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
    <PageFrame>
      <PageHeader
        breadcrumbs={[
          { label: 'Bảng điều khiển', href: '/dashboard/upload' },
          { label: 'Lịch sử hồ sơ' },
        ]}
        title="Lịch sử hồ sơ CV"
        description="Danh sách tất cả các hồ sơ ứng viên đã được tiếp nhận và phân tích trong hệ thống."
        actions={
          <Link href="/dashboard/upload">
            <Button size="sm" leftIcon={<Upload className="h-4 w-4" />}>
              Tải lên hồ sơ mới
            </Button>
          </Link>
        }
        maxWidthClass="max-w-[1440px]"
      />

      <PageScroll mode="scroll">
        <PageContent width="default" className="space-y-5">
          {/* Stats Cards (Fleet Flat Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Card className="p-4 flex items-center justify-between bg-white border border-slate-200 shadow-soft-xs">
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng số hồ sơ</p>
                <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{totalCount}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tệp lưu trữ</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileText className="h-4.5 w-4.5 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between bg-white border border-slate-200 shadow-soft-xs">
              <div>
                <p className="text-xs font-medium text-slate-500">Đã phân tích xong</p>
                <p className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">{completedCount}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Báo cáo sẵn sàng</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between bg-white border border-slate-200 shadow-soft-xs">
              <div>
                <p className="text-xs font-medium text-slate-500">Đang trong hàng đợi</p>
                <p className="text-xl font-bold text-amber-600 mt-1 tabular-nums">{processingCount}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Đang xử lý</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </Card>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên tệp…"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition-colors shadow-soft-xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-700"
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Grid of CV Cards */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6 text-blue-600" />}
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
            <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const isCompleted = item.status === 'completed';
                const isDocx = item.original_file_name.toLowerCase().endsWith('.docx');

                return (
                  <Card
                    key={item.file_id}
                    className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all group bg-white border border-slate-200 shadow-soft-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-[10px] ${
                              isDocx
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}
                          >
                            {isDocx ? 'DOCX' : 'PDF'}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-xs sm:text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors"
                              title={item.original_file_name}
                            >
                              {item.original_file_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono tabular-nums">
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

                      <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="font-mono tabular-nums">
                          {new Date(item.uploaded_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
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
        </PageContent>
      </PageScroll>
    </PageFrame>
  );
}
