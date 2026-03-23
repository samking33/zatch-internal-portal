import { Suspense } from 'react';
import Image from 'next/image';

import { LoginForm } from './LoginForm';

const LoginPage = () => (
  <main className="min-h-screen bg-page px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_440px]">
      <section className="card-shell hidden overflow-hidden lg:block">
        <div className="relative h-full bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(135deg,_#ffffff,_#eef4ff)] p-10">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
              <Image
                src="/zatch-logo.png"
                alt="Zatch logo"
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
                priority
              />
            </div>
            <div className="label-meta">Internal Operations Portal</div>
          </div>
          <h1 className="mt-3 max-w-xl text-[38px] font-medium leading-[1.1] text-primary">
            Seller onboarding in a proper ops console.
          </h1>
          <p className="mt-4 max-w-xl text-base text-secondary">
            Review seller applications, inspect documents, track decisions, and manage admins from a single operational workspace.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-border bg-white/90 p-5 shadow-card">
              <div className="label-meta">Operations</div>
              <div className="mt-2 text-lg font-medium text-primary">Seller Boarding</div>
              <p className="mt-2 text-sm text-secondary">
                Queue-based review with fast approve and reject actions.
              </p>
            </div>
            <div className="rounded-card border border-border bg-white/90 p-5 shadow-card">
              <div className="label-meta">Traceability</div>
              <div className="mt-2 text-lg font-medium text-primary">Immutable Audit Trail</div>
              <p className="mt-2 text-sm text-secondary">
                Every status transition and admin event remains visible and timestamped.
              </p>
            </div>
            <div className="rounded-card border border-border bg-white/90 p-5 shadow-card">
              <div className="label-meta">Documents</div>
              <div className="mt-2 text-lg font-medium text-primary">Verification Ready</div>
              <p className="mt-2 text-sm text-secondary">
                Inspect submitted files and history before taking action.
              </p>
            </div>
            <div className="rounded-card border border-border bg-white/90 p-5 shadow-card">
              <div className="label-meta">Access Control</div>
              <div className="mt-2 text-lg font-medium text-primary">Role-Aware Views</div>
              <p className="mt-2 text-sm text-secondary">
                Super admins manage users. Ops admins stay focused on seller review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-shell p-6 sm:p-8">
        <div className="label-meta">Secure Sign In</div>
        <h2 className="mt-2 text-[28px] font-medium text-primary">Access the ops portal</h2>
        <p className="mt-2 text-sm text-secondary">
          Use your admin credentials to continue into the internal workspace.
        </p>
        <Suspense fallback={<div className="mt-6 text-sm text-secondary">Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  </main>
);

export default LoginPage;
