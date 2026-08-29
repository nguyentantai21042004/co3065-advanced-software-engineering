'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';

export default function LandingPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getUser()?.email ?? null);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <p className="text-lg font-semibold">AI Coach</p>
            <p className="text-xs text-slate-500">CV processing demo</p>
          </div>
        </div>
        <nav className="flex gap-3">
          {email ? (
            <Link
              href="/dashboard/upload"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-600">CO3065 demo</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Upload a CV. Extract the text. Read a structured analysis.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          Local-first demo: PGlite (or Neon), filesystem (or R2), in-process extract queue, Gemini when a key is set
          otherwise a deterministic stub that fills the same JSON fields.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={email ? '/dashboard/upload' : '/auth/register'}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {email ? 'Upload a CV' : 'Get started'}
          </Link>
          <Link href="/auth/login" className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            I already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
