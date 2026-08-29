'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CvListItemWire } from '@aicoach/shared/contracts/cv';
import { api } from '@/lib/api';
import { setCurrentFile } from '@/lib/auth';

export default function HistoryPage() {
  const [items, setItems] = useState<CvListItemWire[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<CvListItemWire[]>('/cv/list')
      .then((res) => setItems(res.data ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load history'));
  }, []);

  const filtered = useMemo(
    () => items.filter((item) => item.original_file_name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">CV History</h1>
      <p className="mt-2 text-slate-600">Files uploaded with this account.</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by file name"
        className="mt-6 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="font-semibold">No CVs found</p>
          <Link href="/dashboard/upload" className="mt-4 inline-block text-sm text-blue-600">
            Upload a CV
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.file_id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="truncate font-semibold">{item.original_file_name}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(item.uploaded_at).toLocaleString()}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-blue-700">{item.status}</p>
              <p className="mt-1 text-xs text-slate-500">{(item.file_size / 1024).toFixed(1)} KB</p>
              <Link
                href={`/dashboard/results?file_id=${item.file_id}`}
                onClick={() =>
                  setCurrentFile({
                    fileId: item.file_id,
                    name: item.original_file_name,
                    size: item.file_size,
                    uploadedAt: item.uploaded_at,
                  })
                }
                className="mt-4 inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                View results
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
