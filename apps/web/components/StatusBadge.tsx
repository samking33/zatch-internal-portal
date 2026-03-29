import { getStatusLabel } from '../lib/admin-api';

const statusToneMap: Record<string, { quiet: string; emphasis: string; dot: string }> = {
  pending: {
    quiet: 'border-amber-200 bg-amber-50/90 text-amber-900',
    emphasis: 'border-transparent bg-[color:var(--metric-warning)] text-white',
    dot: 'bg-[color:var(--metric-warning)]',
  },
  approved: {
    quiet: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    emphasis: 'border-transparent bg-[color:var(--metric-positive)] text-white',
    dot: 'bg-[color:var(--metric-positive)]',
  },
  active: {
    quiet: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    emphasis: 'border-transparent bg-[color:var(--metric-positive)] text-white',
    dot: 'bg-[color:var(--metric-positive)]',
  },
  delivered: {
    quiet: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    emphasis: 'border-transparent bg-[color:var(--metric-positive)] text-white',
    dot: 'bg-[color:var(--metric-positive)]',
  },
  paid: {
    quiet: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    emphasis: 'border-transparent bg-[color:var(--metric-positive)] text-white',
    dot: 'bg-[color:var(--metric-positive)]',
  },
  processing: {
    quiet: 'border-blue-200 bg-blue-50/90 text-blue-900',
    emphasis: 'border-transparent bg-[color:var(--metric-brand)] text-white',
    dot: 'bg-[color:var(--metric-brand)]',
  },
  confirmed: {
    quiet: 'border-blue-200 bg-blue-50/90 text-blue-900',
    emphasis: 'border-transparent bg-[color:var(--metric-brand)] text-white',
    dot: 'bg-[color:var(--metric-brand)]',
  },
  shipped: {
    quiet: 'border-blue-200 bg-blue-50/90 text-blue-900',
    emphasis: 'border-transparent bg-[color:var(--metric-brand)] text-white',
    dot: 'bg-[color:var(--metric-brand)]',
  },
  rejected: {
    quiet: 'border-red-200 bg-red-50/90 text-red-900',
    emphasis: 'border-transparent bg-[color:var(--metric-danger)] text-white',
    dot: 'bg-[color:var(--metric-danger)]',
  },
  inactive: {
    quiet: 'border-slate-200 bg-slate-100/90 text-slate-700',
    emphasis: 'border-transparent bg-slate-700 text-white',
    dot: 'bg-slate-500',
  },
  draft: {
    quiet: 'border-slate-200 bg-slate-100/90 text-slate-700',
    emphasis: 'border-transparent bg-slate-700 text-white',
    dot: 'bg-slate-500',
  },
  hold: {
    quiet: 'border-orange-200 bg-orange-50/90 text-orange-900',
    emphasis: 'border-transparent bg-orange-600 text-white',
    dot: 'bg-orange-500',
  },
  failed: {
    quiet: 'border-red-200 bg-red-50/90 text-red-900',
    emphasis: 'border-transparent bg-[color:var(--metric-danger)] text-white',
    dot: 'bg-[color:var(--metric-danger)]',
  },
  cancelled: {
    quiet: 'border-red-200 bg-red-50/90 text-red-900',
    emphasis: 'border-transparent bg-[color:var(--metric-danger)] text-white',
    dot: 'bg-[color:var(--metric-danger)]',
  },
  refunded: {
    quiet: 'border-indigo-200 bg-indigo-50/90 text-indigo-900',
    emphasis: 'border-transparent bg-[var(--tone-administration)] text-white',
    dot: 'bg-[var(--tone-administration)]',
  },
};

export const StatusBadge = ({
  status,
  variant = 'quiet',
}: {
  status: string;
  variant?: 'quiet' | 'emphasis';
}) => {
  const normalized = status.trim().toLowerCase() || 'unknown';
  const tone = statusToneMap[normalized] ?? {
    quiet: 'border-slate-200 bg-slate-100/90 text-slate-700',
    emphasis: 'border-transparent bg-slate-700 text-white',
    dot: 'bg-slate-500',
  };

  return (
    <span className={`status-pill ${variant === 'emphasis' ? tone.emphasis : tone.quiet}`}>
      <span className={`h-2 w-2 rounded-full ${variant === 'emphasis' ? 'bg-white/80' : tone.dot}`} />
      {getStatusLabel(normalized)}
    </span>
  );
};
