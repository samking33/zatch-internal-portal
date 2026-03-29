import Link from 'next/link';

import { DataTable } from '../../../../components/DataTable';
import { EmptyState } from '../../../../components/EmptyState';
import { MetricStrip } from '../../../../components/MetricStrip';
import { PageHeader } from '../../../../components/PageHeader';
import { StatusBadge } from '../../../../components/StatusBadge';
import { fetchSettlementOverview } from '../../../../lib/admin-data';
import { formatCurrency } from '../../../../lib/admin-api';
import { formatFullDateTime } from '../../../../lib/format';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toNumberValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toStringValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

const extractSummaryEntry = (value: unknown): { count: number; amount: number; formatted: string } => {
  if (!isRecord(value)) {
    return { count: 0, amount: 0, formatted: formatCurrency(0) };
  }

  const amount = toNumberValue(value.amount);

  return {
    count: toNumberValue(value.count),
    amount,
    formatted: toStringValue(value.formatted) || formatCurrency(amount),
  };
};

const SettlementOverviewPage = async () => {
  const overview = await fetchSettlementOverview();
  const pending = extractSummaryEntry(overview.stats.pending);
  const hold = extractSummaryEntry(overview.stats.hold);
  const processing = extractSummaryEntry(overview.stats.processing);
  const paid = extractSummaryEntry(overview.stats.paid);
  const totalCommission =
    toStringValue(overview.stats.totalCommissionFormatted) ||
    formatCurrency(toNumberValue(overview.stats.totalCommission));

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Settlements"
        title="Settlement Overview"
        description="Review the base settlement overview route with pending posture, held payouts, and finance totals before moving into queue actions."
        tone="finance"
        legend={
          <>
            <Link href="/settlements/overview" className="filter-chip-active">
              Overview route
            </Link>
            <Link href="/settlements?status=pending" className="filter-chip">
              Pending queue
            </Link>
            <Link href="/settlements?status=hold" className="filter-chip">
              Held payouts
            </Link>
          </>
        }
        actions={
          <>
            <Link href="/settlements" className="btn-ghost px-4">
              Open payouts queue
            </Link>
            <Link href="/settlements?status=pending" className="btn-primary px-4">
              Review pending payouts
            </Link>
          </>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-positive)]">Commission posture</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">{totalCommission}</div>
                <div className="mt-2 text-sm text-secondary">
                  total commission reported by the settlement overview route
                </div>
              </div>
              <span className="command-badge">{pending.count + hold.count} at risk</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Pending payouts',
            value: pending.count,
            helper: pending.formatted,
            tone: 'warning',
          },
          {
            label: 'On hold',
            value: hold.count,
            helper: hold.formatted,
            tone: 'danger',
          },
          {
            label: 'Processing',
            value: processing.count,
            helper: formatCurrency(processing.amount),
            tone: 'brand',
          },
          {
            label: 'Paid',
            value: paid.count,
            helper: paid.formatted,
            tone: 'positive',
          },
        ]}
      />

      <DataTable
        data={overview.pendingPayouts}
        getRowKey={(item) => item.id}
        title="Pending payouts"
        description="Pending items surfaced directly by the base settlement overview route."
        tone="finance"
        density="compact"
        rowTone={() => 'warning'}
        emptyState={
          <EmptyState
            title="No pending payouts"
            description="The settlement overview route did not return any pending payouts."
          />
        }
        columns={[
          {
            key: 'seller',
            header: 'Seller',
            className: 'min-w-[220px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-semibold text-primary">{item.sellerName || 'Unknown seller'}</div>
                <div className="mt-1 text-xs text-secondary">{item.orderRef || item.orderId}</div>
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Seller amount',
            className: 'min-w-[140px]',
            priority: 'secondary',
            render: (item) => <span className="text-sm text-primary">{formatCurrency(item.sellerAmount)}</span>,
          },
          {
            key: 'status',
            header: 'Status',
            className: 'min-w-[140px]',
            priority: 'secondary',
            render: (item) => <StatusBadge status={item.status} />,
          },
          {
            key: 'created',
            header: 'Created',
            className: 'min-w-[180px]',
            priority: 'tertiary',
            render: (item) => (
              <span className="text-sm text-secondary">
                {item.createdAt ? formatFullDateTime(item.createdAt) : 'Unknown'}
              </span>
            ),
          },
          {
            key: 'action',
            header: 'Action',
            className: 'min-w-[150px]',
            priority: 'action',
            render: (item) => (
              <div className="flex justify-end">
                <Link href={`/settlements?sellerId=${item.sellerId}`} className="btn-ghost px-3 text-xs">
                  Open payout queue
                </Link>
              </div>
            ),
          },
        ]}
      />

      <DataTable
        data={overview.heldPayouts}
        getRowKey={(item) => item.id}
        title="Held payouts"
        description="Held items surfaced directly by the base settlement overview route."
        tone="finance"
        density="compact"
        rowTone={() => 'danger'}
        emptyState={
          <EmptyState
            title="No held payouts"
            description="The settlement overview route did not return any held payout records."
          />
        }
        columns={[
          {
            key: 'seller',
            header: 'Seller',
            className: 'min-w-[220px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-semibold text-primary">{item.sellerName || 'Unknown seller'}</div>
                <div className="mt-1 text-xs text-secondary">{item.orderRef || item.orderId}</div>
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Seller amount',
            className: 'min-w-[140px]',
            priority: 'secondary',
            render: (item) => <span className="text-sm text-primary">{formatCurrency(item.sellerAmount)}</span>,
          },
          {
            key: 'reason',
            header: 'Hold reason',
            className: 'min-w-[220px]',
            priority: 'secondary',
            render: (item) => <span className="text-sm text-secondary">{item.holdReason || item.adminNote || 'No reason recorded'}</span>,
          },
          {
            key: 'action',
            header: 'Action',
            className: 'min-w-[150px]',
            priority: 'action',
            render: (item) => (
              <div className="flex justify-end">
                <Link href={`/settlements?status=hold&sellerId=${item.sellerId}`} className="btn-ghost px-3 text-xs">
                  Review hold
                </Link>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};

export default SettlementOverviewPage;
