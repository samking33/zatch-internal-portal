import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="card-shell flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M5 7h14" strokeLinecap="round" />
        <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M9 11h6" strokeLinecap="round" />
        <path d="M9 15h4" strokeLinecap="round" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-primary">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);
