'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';

export default function ProfilePage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    setEmail(getUser()?.email ?? '');
  }, []);

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-slate-600">Account identity comes from the JWT subject (email).</p>
      <dl className="mt-6 space-y-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="font-medium">{email || '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
