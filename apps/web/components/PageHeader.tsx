import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  tone?:
    | 'default'
    | 'overview'
    | 'review'
    | 'catalog'
    | 'fulfillment'
    | 'finance'
    | 'administration';
  legend?: ReactNode;
  insight?: ReactNode;
  showToneChip?: boolean;
  variant?: 'standard' | 'compact';
  footer?: ReactNode;
};

const toneMap = {
  default: {
    bar: 'bg-[rgba(84,101,127,0.75)]',
    chip: 'text-secondary',
  },
  overview: {
    bar: 'bg-[var(--tone-overview)]',
    chip: 'tone-overview',
  },
  review: {
    bar: 'bg-[rgba(185,121,22,0.92)]',
    chip: 'text-[color:var(--metric-warning)]',
  },
  catalog: {
    bar: 'bg-[var(--tone-operations)]',
    chip: 'tone-operations',
  },
  fulfillment: {
    bar: 'bg-[rgba(37,99,235,0.82)]',
    chip: 'text-[color:var(--metric-brand)]',
  },
  finance: {
    bar: 'bg-[rgba(15,138,102,0.86)]',
    chip: 'text-[color:var(--metric-positive)]',
  },
  administration: {
    bar: 'bg-[var(--tone-administration)]',
    chip: 'tone-administration',
  },
} as const;

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  badge,
  tone = 'default',
  legend,
  insight,
  showToneChip = true,
  variant = 'standard',
  footer,
}: PageHeaderProps) => {
  const hasMetaRow = Boolean(eyebrow || showToneChip || badge);

  return (
    <div
      className={`card-shell relative overflow-hidden ${tone === 'administration' ? 'system-card' : ''} ${
        variant === 'compact' ? 'px-5 py-5' : 'px-5 py-6 sm:px-6'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-[3px] ${toneMap[tone].bar}`} />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          {hasMetaRow ? (
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow ? <div className={`label-meta ${toneMap[tone].chip}`}>{eyebrow}</div> : null}
              {showToneChip ? (
                <span className={`tone-chip ${toneMap[tone].chip}`}>
                  <span className={`tone-chip-dot ${toneMap[tone].bar}`} />
                  {tone === 'administration'
                    ? 'System layer'
                    : tone === 'review'
                      ? 'Review queue'
                      : tone === 'catalog'
                        ? 'Catalog'
                        : tone === 'fulfillment'
                          ? 'Fulfillment'
                          : tone === 'finance'
                            ? 'Finance'
                            : tone === 'overview'
                              ? 'Overview'
                              : 'Workspace'}
                </span>
              ) : null}
              {badge ? <div>{badge}</div> : null}
            </div>
          ) : null}
          <h1 className={`${hasMetaRow ? 'mt-3' : ''} page-heading`}>{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary">{description}</p> : null}
          {legend ? <div className="mt-4 flex flex-wrap items-center gap-2">{legend}</div> : null}
        </div>
        {(actions || insight) ? (
          <div className="flex shrink-0 flex-col gap-3 xl:items-end">
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            {insight ? <div className="max-w-[360px]">{insight}</div> : null}
          </div>
        ) : null}
      </div>
      {footer ? <div className="mt-5 border-t border-border pt-5">{footer}</div> : null}
    </div>
  );
};
