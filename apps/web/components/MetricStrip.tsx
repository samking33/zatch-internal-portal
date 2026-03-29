import type { ReactNode } from 'react';

type MetricTone = 'brand' | 'positive' | 'warning' | 'danger' | 'neutral';

export type MetricItem = {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  trend?: ReactNode;
  tone?: MetricTone;
};

type MetricStripProps = {
  items: MetricItem[];
  variant?: 'compact' | 'analytics';
};

const toneMap: Record<MetricTone, string> = {
  brand: 'text-[color:var(--metric-brand)]',
  positive: 'text-[color:var(--metric-positive)]',
  warning: 'text-[color:var(--metric-warning)]',
  danger: 'text-[color:var(--metric-danger)]',
  neutral: 'text-primary',
};

const toneLabelMap: Record<MetricTone, string> = {
  brand: 'Priority',
  positive: 'Healthy',
  warning: 'Attention',
  danger: 'Risk',
  neutral: 'Live',
};

export const MetricStrip = ({ items, variant = 'compact' }: MetricStripProps) => (
  <div className={`grid gap-3 ${variant === 'analytics' ? 'xl:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
    {items.map((item) => (
      <article
        key={item.label}
        className={`metric-card metric-card-${item.tone ?? 'neutral'} ${
          variant === 'analytics' ? 'metric-card-analytics' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="metric-label">{item.label}</div>
          <span className={`tone-chip ${toneMap[item.tone ?? 'neutral']}`}>
            <span className={`tone-chip-dot ${item.tone === 'danger'
              ? 'bg-[color:var(--metric-danger)]'
              : item.tone === 'warning'
                ? 'bg-[color:var(--metric-warning)]'
                : item.tone === 'positive'
                  ? 'bg-[color:var(--metric-positive)]'
                  : item.tone === 'brand'
                    ? 'bg-[color:var(--metric-brand)]'
                    : 'bg-[rgba(84,101,127,0.82)]'}`} />
            {toneLabelMap[item.tone ?? 'neutral']}
          </span>
        </div>
        <div className={`metric-value ${toneMap[item.tone ?? 'neutral']}`}>{item.value}</div>
        {item.helper ? <div className="metric-helper">{item.helper}</div> : null}
        {item.trend ? <div className="metric-trend">{item.trend}</div> : null}
      </article>
    ))}
  </div>
);
