'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { loginWithPassword } from '../../../lib/api-client';

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await loginWithPassword(email, password);
        window.location.assign(redirectTo);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Login failed');
      }
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-secondary">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="opsadmin@zatch.in"
          autoComplete="email"
          required
          className="input-base w-full"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-secondary">Password</span>
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

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <button type="submit" className="btn-primary mt-2 w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};
