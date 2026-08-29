'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { CvDataWire } from '@aicoach/shared/contracts/cv';
import { api, ApiError } from '@/lib/api';
import { getCurrentFile } from '@/lib/auth';

type Phase = 'queued' | 'extracting' | 'analyzing' | 'done' | 'error';

function ProcessingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const fileId = params.get('file_id') ?? getCurrentFile()?.fileId;
  const [phase, setPhase] = useState<Phase>('queued');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState(getCurrentFile()?.name ?? 'Your file');

  useEffect(() => {
    const current = getCurrentFile();
    if (current?.name) setFileName(current.name);
    if (!fileId) {
      setError('No file to process. Upload a CV first.');
      setPhase('error');
      return;
    }

    let cancelled = false;
    const started = Date.now();

    async function tick() {
      try {
        const res = await api<CvDataWire>(`/cv/data/${fileId}`);
        if (cancelled) return;
        const data = res.data;
        if (data?.analysis_result || data?.basic_info) {
          setPhase('done');
          return;
        }
        if (data?.raw_text) setPhase('analyzing');
        else setPhase('extracting');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.errorCode === 404)) {
          setPhase(Date.now() - started < 1500 ? 'queued' : 'extracting');
        } else {
          setPhase('error');
          setError(err instanceof Error ? err.message : 'Processing failed');
          return;
        }
      }
      if (!cancelled) timer = window.setTimeout(() => void tick(), 600);
    }

    let timer = window.setTimeout(() => void tick(), 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [fileId]);

  const steps: { id: Phase | 'extracting'; title: string; active: boolean; done: boolean }[] = [
    {
      id: 'extracting',
      title: 'Extracting text',
      active: phase === 'queued' || phase === 'extracting',
      done: phase === 'analyzing' || phase === 'done',
    },
    {
      id: 'analyzing',
      title: 'AI analysis',
      active: phase === 'analyzing',
      done: phase === 'done',
    },
  ];

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Processing failed</h1>
        <p className="mt-2 text-slate-600">{error}</p>
        <Link href="/dashboard/upload" className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Upload again
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Processing CV: {fileName}</h1>
      <p className="mt-2 text-slate-600">Extract runs in-process; this page polls GET /api/cv/data until analysis lands.</p>
      <div className="mt-8 space-y-4">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{step.title}</p>
              <span className="text-sm text-slate-500">
                {step.done ? 'Done' : step.active ? 'In progress' : 'Waiting'}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${step.done ? 'w-full bg-green-500' : step.active ? 'w-2/3 animate-pulse bg-blue-600' : 'w-0 bg-slate-300'}`}
              />
            </div>
          </div>
        ))}
      </div>
      {phase === 'done' && (
        <button
          type="button"
          onClick={() => router.push(`/dashboard/results?file_id=${fileId}`)}
          className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View analysis results
        </button>
      )}
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <ProcessingInner />
    </Suspense>
  );
}
