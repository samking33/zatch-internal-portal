'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { loginWithPassword } from '../../../lib/api-client';

const sanitizeRedirectTarget = (value: string | null): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }

  return value;
};

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectTarget(searchParams.get('redirectTo'));
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await loginWithPassword(phone, countryCode, password);
        window.location.assign(redirectTo);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Login failed');
      }
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
            Country code
          </span>
          <input
            type="text"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            placeholder="+91"
            autoComplete="tel-country-code"
            required
            className="input-base w-full"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
            Phone
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="9876543210"
            autoComplete="tel"
            required
            className="input-base w-full"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="input-base w-full"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button type="submit" className="btn-primary mt-2 w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};
