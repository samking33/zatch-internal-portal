import { SellerStatus } from '@zatch/shared';

const badgeStyles: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [SellerStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [SellerStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const labelMap: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'Pending',
  [SellerStatus.APPROVED]: 'Approved',
  [SellerStatus.REJECTED]: 'Rejected',
};

export const StatusBadge = ({ status }: { status: SellerStatus }) => (
  <span className={`status-pill ${badgeStyles[status]}`}>{labelMap[status]}</span>
);
