'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AdviceDiffWire,
  AdvicePinWire,
  AdviceSnapshotListWire,
  AdviceSnapshotWire,
} from '@aicoach/shared/contracts/advice';
import { api } from '@/lib/api';

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
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Lời khuyên cá nhân</h1>
        <p className="mt-2 text-sm text-slate-600">
          Snapshot tự động sau mỗi lần phân tích CV trong account, so sánh thay đổi theo thời gian, và sổ tay
          ghim thủ công.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Timeline phân tích</h2>
        {snapshots.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Chưa có snapshot. Hãy upload và phân tích ít nhất một CV.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {snapshots.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{s.domain}</p>
                    <p className="mt-1 text-sm text-slate-600">{s.summary}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(s.created_at).toLocaleString('vi-VN')}
                      {s.file_name ? ` · ${s.file_name}` : ''}
                    </p>
                  </div>
                  <code className="text-[10px] text-slate-400">{s.id.slice(0, 8)}</code>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">So sánh giữa các lần (toàn account)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Mặc định: lần mới nhất vs lần trước. Hoặc chọn thủ công hai snapshot bất kỳ.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Bản cũ (left)
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
            >
              <option value="">—</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.created_at).toLocaleString('vi-VN')} · {s.domain}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Bản mới (right)
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
            >
              <option value="">—</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.created_at).toLocaleString('vi-VN')} · {s.domain}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          disabled={busy || snapshots.length < 2}
          onClick={() => void runDiff()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Đang so sánh…' : 'So sánh'}
        </button>
        {(selectedLeft || selectedRight) && (
          <p className="mt-2 text-xs text-slate-500">
            {selectedLeft?.file_name ?? '…'} → {selectedRight?.file_name ?? '…'}
          </p>
        )}
        {diff && (
          <div className="mt-6 space-y-4 rounded-xl bg-slate-50 p-4 text-sm">
            <p>
              <span className="font-medium">Domain:</span>{' '}
              {diff.changes.domain_changed
                ? `${diff.changes.domain?.from} → ${diff.changes.domain?.to}`
                : 'Không đổi'}
            </p>
            <DiffList title="Recommendations thêm" items={diff.changes.recommendations.added} tone="add" />
            <DiffList title="Recommendations bỏ" items={diff.changes.recommendations.removed} tone="remove" />
            <DiffList title="Format findings thêm" items={diff.changes.format_findings.added} tone="add" />
            <DiffList title="Format findings bỏ" items={diff.changes.format_findings.removed} tone="remove" />
            <DiffList title="Strengths thêm" items={diff.changes.experience.strengths_added} tone="add" />
            <DiffList title="Gaps thêm" items={diff.changes.experience.gaps_added} tone="add" />
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Sổ tay ghim</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={pinBody}
            onChange={(e) => setPinBody(e.target.value)}
            placeholder="Ghim một lời khuyên / việc cần làm…"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy || !pinBody.trim()}
            onClick={() => void createPin()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Ghim
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {pins.length === 0 ? (
            <li className="text-sm text-slate-500">Chưa ghim mục nào. Có thể ghim từ trang kết quả hoặc ô trên.</li>
          ) : (
            pins.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-800">{p.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{p.section}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{p.status}</span>
                  {(['todo', 'doing', 'done', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => void setPinStatus(p.id, st)}
                      className="rounded border border-slate-200 px-2 py-0.5 hover:bg-slate-50"
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => void removePin(p.id)}
                    className="ml-auto text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
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
      <p className={`font-medium ${tone === 'add' ? 'text-emerald-700' : 'text-amber-700'}`}>{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
