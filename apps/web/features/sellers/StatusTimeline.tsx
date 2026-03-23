import { SellerStatus, type ISeller } from '@zatch/shared';

import { formatFullDateTime } from '../../lib/format';

const dotStyles: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'bg-amber-500',
  [SellerStatus.APPROVED]: 'bg-emerald-500',
  [SellerStatus.REJECTED]: 'bg-red-500',
};

const labelMap: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'Pending',
  [SellerStatus.APPROVED]: 'Approved',
  [SellerStatus.REJECTED]: 'Rejected',
};

export const StatusTimeline = ({ seller }: { seller: ISeller }) => (
  <div className="space-y-0">
    {seller.statusHistory.map((entry, index) => (
      <div key={`${seller._id}-${entry.changedAt.toString()}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
        <div className="relative flex w-5 justify-center">
          <div className={`relative z-10 mt-1 h-3 w-3 rounded-full ${dotStyles[entry.status]}`} />
          {index < seller.statusHistory.length - 1 ? (
            <div className="absolute top-4 h-full w-px bg-slate-200" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 rounded-card border border-border bg-slate-50 px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-medium text-primary">{labelMap[entry.status]}</div>
            <div className="text-xs text-muted">{formatFullDateTime(entry.changedAt)}</div>
          </div>
          <div className="mt-2 text-sm text-secondary">Changed by {entry.changedBy ?? 'system'}</div>
          {entry.note ? <div className="mt-2 text-sm text-primary">{entry.note}</div> : null}
        </div>
      </div>
    ))}
  </div>
);
