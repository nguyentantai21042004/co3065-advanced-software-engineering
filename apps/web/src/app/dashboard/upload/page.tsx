'use client';

import { useRouter } from 'next/navigation';
import { useState, type DragEvent } from 'react';
import type { UploadedFileWire } from '@aicoach/shared/contracts/cv';
import { api } from '@/lib/api';
import { setCurrentFile } from '@/lib/auth';

const ALLOWED = ['.pdf', '.docx', '.doc'];
const MAX = 10 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    const lower = file.name.toLowerCase();
    if (!ALLOWED.some((ext) => lower.endsWith(ext))) {
      setStatus('error');
      setError('Invalid file type. Only PDF, DOCX, and DOC files are supported.');
      return;
    }
    if (file.size > MAX) {
      setStatus('error');
      setError('File size exceeds 10MB limit.');
      return;
    }

    setStatus('uploading');
    setError('');
    setProgress(20);

    try {
      const form = new FormData();
      form.append('file', file);
      const uploaded = await api<UploadedFileWire>('/cv/upload', { method: 'POST', body: form });
      const fileId = uploaded.data?.file_id;
      if (!fileId) throw new Error('Upload succeeded without file_id');
      setProgress(70);
      await api(`/cv/extract/${fileId}`, { method: 'POST' });
      setProgress(100);
      setCurrentFile({
        fileId,
        name: file.name,
        size: file.size,
        uploadedAt: uploaded.data?.uploaded_at ?? new Date().toISOString(),
      });
      router.push(`/dashboard/processing?file_id=${fileId}`);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Upload Your CV</h1>
      <p className="mt-2 text-slate-600">PDF, DOCX, or DOC. Max 10MB. Extract starts as soon as upload succeeds.</p>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
        {status === 'uploading' ? (
          <div>
            <p className="text-sm font-medium">Uploading and queueing extract…</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center ${
              drag ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <p className="text-lg font-semibold">Drag and drop your CV here</p>
            <p className="mt-1 text-sm text-slate-500">PDF, DOCX, DOC (Max 10MB)</p>
            <label className="mt-6 inline-block cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Browse files
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
          </div>
        )}
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
