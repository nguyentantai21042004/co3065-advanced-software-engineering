'use client';

import { API_URL } from '@/lib/api';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-slate-600">Demo configuration. There is no extra backend surface here.</p>
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">API</dt>
          <dd className="font-mono">{API_URL}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">LLM</dt>
          <dd>
            Gemini when <code>GEMINI_API_KEYS</code> is set on the API; otherwise a deterministic stub that fills the
            same analysis JSON fields.
          </dd>
        </div>
      </dl>
    </div>
  );
}
