import Link from 'next/link';

import { FilterToolbar } from '../../../components/FilterToolbar';
import { MetricStrip } from '../../../components/MetricStrip';
import { PageHeader } from '../../../components/PageHeader';
import { SettlementsManager } from '../../../features/settlements/SettlementsManager';
import {
  fetchCommissionOverview,
  fetchPayoutPage,
  fetchPayoutSummary,
  fetchSellerSettlement,
} from '../../../lib/admin-data';
import { formatCurrency } from '../../../lib/admin-api';

type SettlementsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SettlementsPage = async ({ searchParams }: SettlementsPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const limit = typeof resolvedSearchParams.limit === 'string' ? resolvedSearchParams.limit : '20';
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : '';
  const sellerId =
    typeof resolvedSearchParams.sellerId === 'string' ? resolvedSearchParams.sellerId : '';

  const [payoutSummary, commissionOverview, payoutResult, sellerSettlement] = await Promise.all([
    fetchPayoutSummary(),
    fetchCommissionOverview(),
    fetchPayoutPage({
      page,
      limit,
      ...(status ? { status } : {}),
      ...(sellerId ? { sellerId } : {}),
    }),
    sellerId ? fetchSellerSettlement(sellerId) : Promise.resolve(null),
  ]);

  const queryParams: Record<string, string> = {};
  if (status) queryParams.status = status;
  if (sellerId) queryParams.sellerId = sellerId;
  if (limit) queryParams.limit = limit;

  const pending =
    payoutSummary.pending &&
    typeof payoutSummary.pending === 'object' &&
    payoutSummary.pending !== null
      ? (payoutSummary.pending as { count?: unknown; amount?: unknown })
      : {};
  const paid =
    payoutSummary.paid && typeof payoutSummary.paid === 'object' && payoutSummary.paid !== null
      ? (payoutSummary.paid as { count?: unknown; amount?: unknown })
      : {};

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Settlements"
        title="Settlements"
        description="Work the payout queue with cleaner focus on approvals, holds, and seller-level payout context."
        tone="finance"
        legend={
          <>
            <span className="filter-chip-active">Finance workflow</span>
            <span className="filter-chip">Bulk approvals stay elevated but controlled</span>
          </>
        }
        actions={
          <>
            <Link href="/settlements/overview" className="btn-ghost px-4">
              View settlement overview
            </Link>
            <Link href="/settlements?status=pending" className="btn-primary px-4">
              Open pending payouts
            </Link>
          </>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-positive)]">Settlement posture</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {Number(pending.count ?? 0)}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  payouts are still waiting for a finance decision
                </div>
              </div>
              <span className="command-badge">{Number(paid.count ?? 0)} paid</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Pending payouts',
            value: Number(pending.count ?? 0),
            helper: formatCurrency(Number(pending.amount ?? 0)),
            tone: 'warning',
          },
          {
            label: 'Paid payouts',
            value: Number(paid.count ?? 0),
            helper: formatCurrency(Number(paid.amount ?? 0)),
            tone: 'positive',
          },
          {
            label: 'Commission earned',
            value:
              commissionOverview.totalCommissionFormatted?.toString() ??
              formatCurrency(Number(commissionOverview.totalCommissionEarned ?? 0)),
            helper: 'Total commission captured',
            tone: 'brand',
          },
          {
            label: 'Seller focus',
            value: sellerSettlement?.seller?.username ?? (sellerId ? 'Filtered seller' : 'All sellers'),
            helper:
              sellerSettlement ? `${sellerSettlement.payouts.pagination.total} payout records` : 'No seller filter',
            tone: 'neutral',
          },
        ]}
      />

      <FilterToolbar
        action="/settlements"
        tone="finance"
        resetHref="/settlements"
        submitLabel="Apply"
        hiddenFields={<input type="hidden" name="limit" value={limit} />}
        resultCount={`${payoutResult.pagination.total} matching payouts`}
        search={
          <input
            type="text"
            name="sellerId"
            defaultValue={sellerId}
            placeholder="Filter by seller ID"
            className="input-base w-full"
          />
        }
        primaryFilters={
          <select name="status" defaultValue={status} className="select-base min-w-[190px]">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="hold">Hold</option>
          </select>
        }
        quickFilters={
          <>
            <Link href="/settlements?status=pending" className={status === 'pending' ? 'filter-chip-active' : 'filter-chip'}>
              Pending
            </Link>
            <Link href="/settlements?status=hold" className={status === 'hold' ? 'filter-chip-active' : 'filter-chip'}>
              On hold
            </Link>
            <Link href="/settlements?status=paid" className={status === 'paid' ? 'filter-chip-active' : 'filter-chip'}>
              Paid
            </Link>
            <Link href="/settlements" className={!status && !sellerId ? 'filter-chip-active' : 'filter-chip'}>
              All payouts
            </Link>
          </>
        }
        activeFilters={
          <>
            {status ? <span className="filter-chip-active">Status: {status}</span> : null}
            {sellerId ? <span className="filter-chip">Seller ID: {sellerId}</span> : null}
          </>
        }
      />

      <SettlementsManager result={payoutResult} queryParams={queryParams} />
    </section>
  );
};

export default SettlementsPage;
