import { Suspense } from 'react';
import Image from 'next/image';

import { LoginForm } from './LoginForm';

const LoginPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-page px-4 py-8 sm:px-6 lg:px-8">
    <section className="w-full max-w-[420px] rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-card border border-border bg-white">
          <Image
            src="/zatch-logo.png"
            alt="Zatch logo"
            width={48}
            height={48}
            className="h-11 w-11 object-cover"
            priority
          />
        </div>
        <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-primary">
          Zatch Admin Portal
        </h1>
      </div>

      <Suspense fallback={<div className="mt-6 text-sm text-secondary">Loading...</div>}>
          <LoginForm />
      </Suspense>
    </section>
  </main>
);

export default LoginPage;
