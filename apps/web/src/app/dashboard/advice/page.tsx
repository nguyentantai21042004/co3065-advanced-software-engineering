'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AdviceDiffWire,
  AdvicePinWire,
  AdviceSnapshotListWire,
  AdviceSnapshotWire,
} from '@/types/wire';
import { api } from '@/lib/api';
import { PageFrame, PageHeader, PageScroll, PageContent } from '@/components/shell/page-frame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, GitCompare, Bookmark, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdvicePage() {
  const [snapshots, setSnapshots] = useState<AdviceSnapshotWire[]>([]);
  const [pins, setPins] = useState<AdvicePinWire[]>([]);
  const [diff, setDiff] = useState<AdviceDiffWire | null>(null);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [error, setError] = useState('');
  const [pinBody, setPinBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [snapRes, pinRes] = await Promise.all([
        api<AdviceSnapshotListWire>('/advice/snapshots'),
        api<AdvicePinWire[]>('/advice/pins'),
      ]);
      const items = snapRes.data?.items ?? [];
      setSnapshots(items);
      setPins(pinRes.data ?? []);
      if (items.length >= 2) {
        setRightId((prev) => prev || items[0]!.id);
        setLeftId((prev) => prev || items[1]!.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu lời khuyên');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedLeft = useMemo(() => snapshots.find((s) => s.id === leftId), [snapshots, leftId]);
  const selectedRight = useMemo(() => snapshots.find((s) => s.id === rightId), [snapshots, rightId]);

  async function runDiff() {
    setBusy(true);
    setError('');
    try {
      const q =
        leftId && rightId
          ? `?left_id=${encodeURIComponent(leftId)}&right_id=${encodeURIComponent(rightId)}`
          : '';
      const res = await api<AdviceDiffWire>(`/advice/diff${q}`);
      setDiff(res.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không so sánh được');
    } finally {
      setBusy(false);
    }
  }

  async function createPin() {
    if (!pinBody.trim()) return;
    setBusy(true);
    try {
      await api('/advice/pins', {
        method: 'POST',
        body: JSON.stringify({
          body: pinBody.trim(),
          section: 'custom',
          source_snapshot_id: rightId || undefined,
        }),
      });
      setPinBody('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ghim thất bại');
    } finally {
      setBusy(false);
    }
  }

  async function setPinStatus(id: string, status: AdvicePinWire['status']) {
    try {
      await api(`/advice/pins/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật pin thất bại');
    }
  }

  async function removePin(id: string) {
    try {
      await api(`/advice/pins/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xoá pin thất bại');
    }
  }

  return (
    <PageFrame>
      <PageHeader
        breadcrumbs={[
          { label: 'Bảng điều khiển', href: '/dashboard/upload' },
          { label: 'Lời khuyên cá nhân' },
        ]}
        title="Lời khuyên &amp; Tiến trình cá nhân"
        description="Snapshot tự động sau mỗi lần phân tích CV, so sánh thay đổi và quản lý sổ tay mục tiêu."
        maxWidthClass="max-w-[1280px]"
      />

      <PageScroll mode="scroll">
        <PageContent width="detail" className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Section 1: Timeline Snapshots */}
          <Card className="p-6 bg-white border border-slate-200 shadow-soft-xs">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Timeline phân tích hồ sơ</h2>
            </div>

            {snapshots.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Chưa có snapshot nào. Hãy tải lên và phân tích ít nhất một CV.
              </p>
            ) : (
              <ul className="space-y-3">
                {snapshots.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{s.domain}</p>
                          <Badge variant="brand" size="sm">Snapshot</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{s.summary}</p>
                        <p className="mt-2 text-[11px] text-slate-400 font-mono">
                          {new Date(s.created_at).toLocaleString('vi-VN')}
                          {s.file_name ? ` · ${s.file_name}` : ''}
                        </p>
                      </div>
                      <code className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {s.id.slice(0, 8)}
                      </code>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Section 2: Account-Wide Comparison */}
          <Card className="p-6 bg-white border border-slate-200 shadow-soft-xs">
            <div className="flex items-center gap-2 mb-1">
              <GitCompare className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">So sánh giữa các phiên phân tích</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Mặc định: lần mới nhất so với lần trước. Hoặc chọn thủ công hai snapshot bất kỳ.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bản cũ (phiên trước)
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                  value={leftId}
                  onChange={(e) => setLeftId(e.target.value)}
                >
                  <option value="">— Chọn phiên —</option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.created_at).toLocaleString('vi-VN')} · {s.domain}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bản mới (phiên hiện tại)
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                  value={rightId}
                  onChange={(e) => setRightId(e.target.value)}
                >
                  <option value="">— Chọn phiên —</option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.created_at).toLocaleString('vi-VN')} · {s.domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                disabled={busy || snapshots.length < 2}
                onClick={() => void runDiff()}
              >
                {busy ? 'Đang so sánh…' : 'Thực hiện so sánh'}
              </Button>

              {(selectedLeft || selectedRight) && (
                <span className="text-xs text-slate-500 font-mono">
                  {selectedLeft?.file_name ?? '…'} → {selectedRight?.file_name ?? '…'}
                </span>
              )}
            </div>

            {diff && (
              <div className="mt-5 space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
                <p className="font-semibold text-slate-900">
                  Lĩnh vực:{' '}
                  {diff.changes.domain_changed ? (
                    <span className="text-blue-600 font-bold">
                      {diff.changes.domain?.from} → {diff.changes.domain?.to}
                    </span>
                  ) : (
                    <span className="text-slate-500">Không đổi</span>
                  )}
                </p>
                <DiffList title="Khuyến nghị bổ sung mới" items={diff.changes.recommendations.added} tone="add" />
                <DiffList title="Khuyến nghị đã khắc phục / loại bỏ" items={diff.changes.recommendations.removed} tone="remove" />
                <DiffList title="Phát hiện định dạng mới" items={diff.changes.format_findings.added} tone="add" />
                <DiffList title="Phát hiện định dạng đã xử lý" items={diff.changes.format_findings.removed} tone="remove" />
                <DiffList title="Điểm mạnh mới được ghi nhận" items={diff.changes.experience.strengths_added} tone="add" />
                <DiffList title="Điểm thiếu hụt phát sinh thêm" items={diff.changes.experience.gaps_added} tone="add" />
              </div>
            )}
          </Card>

          {/* Section 3: Pinned Notes */}
          <Card className="p-6 bg-white border border-slate-200 shadow-soft-xs">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Sổ tay ghim mục tiêu</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={pinBody}
                onChange={(e) => setPinBody(e.target.value)}
                placeholder="Ghim một việc cần làm hoặc lời khuyên quan trọng…"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition-colors"
              />
              <Button
                size="sm"
                disabled={busy || !pinBody.trim()}
                onClick={() => void createPin()}
              >
                Ghim mục tiêu
              </Button>
            </div>

            <ul className="mt-4 space-y-3">
              {pins.length === 0 ? (
                <li className="text-xs text-slate-500 italic">
                  Chưa ghim mục nào. Hãy nhập nội dung ở trên để lưu trữ việc cần làm.
                </li>
              ) : (
                pins.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{p.body}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                        <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-slate-600 font-mono">{p.section}</span>
                        <Badge variant={p.status === 'done' ? 'success' : 'neutral'} size="sm">
                          {p.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['todo', 'doing', 'done', 'archived'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => void setPinStatus(p.id, st)}
                          className={`rounded px-2 py-1 text-[11px] font-medium border transition-colors ${
                            p.status === st
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => void removePin(p.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
                        aria-label="Xoá ghim"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </PageContent>
      </PageScroll>
    </PageFrame>
  );
}

function DiffList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'add' | 'remove';
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className={`font-semibold ${tone === 'add' ? 'text-emerald-700' : 'text-amber-700'}`}>{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
