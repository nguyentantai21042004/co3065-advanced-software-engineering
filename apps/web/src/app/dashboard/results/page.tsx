'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import type { CvDataWire } from '@aicoach/shared/contracts/cv';
import { api } from '@/lib/api';
import { getCurrentFile } from '@/lib/auth';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asList(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object') as Record<string, unknown>[];
  const rec = asRecord(value);
  if (Array.isArray(rec.education)) return asList(rec.education);
  if (Array.isArray(rec.work_experience)) return asList(rec.work_experience);
  if (Array.isArray(rec.skills)) return asList(rec.skills);
  if (Object.keys(rec).length === 0) return [];
  return [rec];
}

function ResultsInner() {
  const params = useSearchParams();
  const fileId = params.get('file_id') ?? getCurrentFile()?.fileId;
  const [data, setData] = useState<CvDataWire | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fileId) {
      setError('No file selected.');
      return;
    }
    api<CvDataWire>(`/cv/data/${fileId}`)
      .then((res) => setData(res.data ?? null))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [fileId]);

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-red-700">{error}</p>
        <Link href="/dashboard/upload" className="mt-4 inline-block text-sm text-blue-600">
          Upload a CV
        </Link>
      </div>
    );
  }
  if (!data) return <p className="text-sm text-slate-500">Loading results…</p>;

  const info = asRecord(data.basic_info);
  const education = asList(data.education);
  const experience = asList(data.work_experience);
  const skills = asList(data.skills);
  const certsBlock = asRecord(data.certificates_languages);
  const certs = asList(certsBlock.certificates);
  const langs = asList(certsBlock.languages);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CV Analysis Results</h1>
        <p className="text-sm text-slate-500">file_id {data.file_id}</p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Basic info</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {['name', 'email', 'phone', 'address', 'date_of_birth', 'gender'].map((key) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{key.replaceAll('_', ' ')}</dt>
              <dd className="font-medium">{String(info[key] ?? '—')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section title="Education" empty={education.length === 0}>
        {education.map((row, i) => (
          <article key={i} className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold">{String(row.school_name ?? row.school ?? 'School')}</p>
            <p className="text-sm text-slate-600">
              {String(row.degree ?? '')} {row.major ? `in ${String(row.major)}` : ''}
            </p>
          </article>
        ))}
      </Section>

      <Section title="Work experience" empty={experience.length === 0}>
        {experience.map((row, i) => (
          <article key={i} className="border-l-4 border-blue-600 pl-4">
            <p className="font-semibold">{String(row.position ?? 'Role')}</p>
            <p className="text-sm text-slate-600">{String(row.company_name ?? row.company ?? '')}</p>
            <p className="text-xs text-slate-500">{String(row.time ?? '')}</p>
          </article>
        ))}
      </Section>

      <Section title="Skills" empty={skills.length === 0}>
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((row, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{String(row.name ?? Object.keys(row)[0] ?? 'Skill')}</span>
                <span className="text-blue-600">{row.level != null ? `${String(row.level)}%` : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Certificates" empty={certs.length === 0}>
          {certs.map((row, i) => (
            <p key={i} className="text-sm">
              {String(row.name ?? row)}
            </p>
          ))}
        </Section>
        <Section title="Languages" empty={langs.length === 0}>
          {langs.map((row, i) => (
            <p key={i} className="text-sm">
              {String(row.name ?? row)} {row.proficiency ? `· ${String(row.proficiency)}` : ''}
            </p>
          ))}
        </Section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Raw extracted text</h2>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          {data.raw_text || '(empty)'}
        </pre>
      </section>

      <div className="flex justify-center gap-3">
        <Link href="/dashboard/upload" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          Upload another
        </Link>
        <Link href="/dashboard/history" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          View history
        </Link>
      </div>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">{empty ? <p className="text-sm text-slate-500">None extracted.</p> : children}</div>
    </section>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <ResultsInner />
    </Suspense>
  );
}
