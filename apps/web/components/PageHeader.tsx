import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <div className="mb-5 flex flex-col gap-4 rounded-card border border-border bg-white px-5 py-5 shadow-card lg:flex-row lg:items-start lg:justify-between">
    <div>
      {eyebrow ? <div className="label-meta">{eyebrow}</div> : null}
      <h1 className="mt-1 page-heading">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-secondary">{description}</p>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
  </div>
);
