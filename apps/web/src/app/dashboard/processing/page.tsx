'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { CvDataWire } from '@/types/wire';
import { api, ApiError } from '@/lib/api';
import { getCurrentFile } from '@/lib/auth';
import {
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Layers,
  Compass,
  Check,
} from 'lucide-react';
import { PageFrame, PageHeader, PageScroll, PageContent } from '@/components/shell/page-frame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Phase = 'queued' | 'extracting' | 'analyzing' | 'done' | 'error';

function ProcessingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const fileId = params.get('file_id') ?? getCurrentFile()?.fileId;
  const [phase, setPhase] = useState<Phase>('queued');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState(getCurrentFile()?.name ?? 'Tài liệu hồ sơ');
  const [fileSize, setFileSize] = useState(getCurrentFile()?.size ?? 0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const current = getCurrentFile();
    if (current?.name) setFileName(current.name);
    if (current?.size) setFileSize(current.size);

    if (!fileId) {
      setError('Không tìm thấy mã tệp hoạt động. Vui lòng tải lên tệp mới.');
      setPhase('error');
      return;
    }

    let cancelled = false;
    const started = Date.now();

    const intervalTimer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 500);

    async function tick() {
      try {
        const res = await api<CvDataWire>(`/cv/data/${fileId}`);
        if (cancelled) return;
        const data = res.data;
        if (data?.analysis_result || data?.coaching_report || data?.basic_info) {
          setPhase('done');
          return;
        }
        if (data?.raw_text) {
          setPhase('analyzing');
        } else {
          setPhase('extracting');
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.errorCode === 404)) {
          setPhase(Date.now() - started < 2000 ? 'queued' : 'extracting');
        } else {
          setPhase('error');
          setError(err instanceof Error ? err.message : 'Xử lý thất bại ngoài dự kiến.');
          return;
        }
      }
      if (!cancelled) timer = window.setTimeout(() => void tick(), 600);
    }

    let timer = window.setTimeout(() => void tick(), 250);

    return () => {
      cancelled = true;
      clearInterval(intervalTimer);
      window.clearTimeout(timer);
    };
  }, [fileId]);

  const steps = [
    {
      id: 'upload',
      title: '1. Lưu trữ tài liệu an toàn',
      desc: 'Tài liệu đã được tiếp nhận và lưu an toàn vào kho hồ sơ cục bộ.',
      done: true,
      active: false,
      icon: FileText,
    },
    {
      id: 'extract',
      title: '2. Bóc tách & cấu trúc hóa dữ liệu',
      desc: 'Trích xuất thông tin liên hệ, lịch sử làm việc và năng lực cốt lõi.',
      done: phase === 'analyzing' || phase === 'done',
      active: phase === 'queued' || phase === 'extracting',
      icon: Layers,
    },
    {
      id: 'analyze',
      title: '3. Phân tích định hướng & Phản biện hồ sơ',
      desc: 'So khớp chức danh thị trường, đánh giá cấu trúc và đề xuất cải thiện.',
      done: phase === 'done',
      active: phase === 'analyzing',
      icon: Compass,
    },
  ];

  return (
    <PageFrame>
      <PageHeader
        breadcrumbs={[
          { label: 'Bảng điều khiển', href: '/dashboard/upload' },
          { label: 'Tiến trình phân tích' },
        ]}
        title="Tiến trình đánh giá hồ sơ"
        description={`Mã hồ sơ: ${fileId ?? '—'}`}
        meta={
          <div className="flex items-center gap-2">
            <Badge
              variant={phase === 'done' ? 'success' : phase === 'error' ? 'danger' : 'brand'}
              size="sm"
              dot={phase !== 'done' && phase !== 'error'}
            >
              {phase === 'done' ? 'Hoàn tất' : phase === 'error' ? 'Thất bại' : 'Đang xử lý'}
            </Badge>
            <span className="text-xs text-slate-400 font-mono tabular-nums">{elapsed}s</span>
          </div>
        }
        maxWidthClass="max-w-3xl"
      />

      <PageScroll mode="scroll">
        <PageContent width="form" className="space-y-4 max-w-3xl">
          {phase === 'error' ? (
            <Card className="p-8 text-center border-red-200 bg-white shadow-soft-xs">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Xử lý thất bại</h2>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
              <div className="mt-6 flex justify-center gap-2.5">
                <Link href="/dashboard/upload">
                  <Button size="sm">Tải lên tệp khác</Button>
                </Link>
                <Link href="/dashboard/history">
                  <Button variant="outline" size="sm">
                    Xem lịch sử
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* File Meta */}
              <Card className="p-4 bg-white shadow-soft-xs flex items-center justify-between border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">{fileName}</p>
                    <p className="text-xs text-slate-400 font-mono tabular-nums">
                      {fileSize > 0 ? `${(fileSize / 1024).toFixed(1)} KB` : 'Đã tải lên'}
                    </p>
                  </div>
                </div>
                <div>
                  {phase === 'done' ? (
                    <Badge variant="success" size="sm">Đã sẵn sàng</Badge>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                      <span>Đang đọc…</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stepper */}
              <div className="space-y-3">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Card
                      key={step.id}
                      className={`p-4 transition-all border ${
                        step.done
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : step.active
                          ? 'border-blue-300 bg-blue-50/30 shadow-soft-xs'
                          : 'border-slate-200 bg-white opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            step.done
                              ? 'bg-emerald-100 text-emerald-700'
                              : step.active
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {step.done ? (
                            <Check className="h-4.5 w-4.5" />
                          ) : step.active ? (
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          ) : (
                            <Icon className="h-4.5 w-4.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                            <span
                              className={`text-xs font-semibold ${
                                step.done
                                  ? 'text-emerald-700'
                                  : step.active
                                  ? 'text-blue-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.done ? 'Hoàn thành' : step.active ? 'Đang thực hiện' : 'Chờ xử lý'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* When Done: Action Card */}
              {phase === 'done' && (
                <Card className="p-5 border border-emerald-200 bg-white shadow-soft-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Phân tích hoàn tất</h3>
                        <p className="text-xs text-slate-500">
                          Báo cáo phản biện và dữ liệu bóc tách đã được chuẩn bị đầy đủ.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="md"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      onClick={() => router.push(`/dashboard/results?file_id=${fileId}`)}
                    >
                      Xem báo cáo kết quả
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </PageContent>
      </PageScroll>
    </PageFrame>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
        </div>
      }
    >
      <ProcessingInner />
    </Suspense>
  );
}
