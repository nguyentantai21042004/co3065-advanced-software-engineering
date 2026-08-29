'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">
        This demo has no email reset flow. Contact an admin to reset the account, or register a new one.
      </p>
      {submitted ? (
        <p className="mt-6 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          If this were production, a reset would be sent to {email}. Here, please contact the demo admin.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Contact admin
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/auth/login" className="text-blue-600">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
