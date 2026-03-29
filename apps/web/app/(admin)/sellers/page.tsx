import Link from 'next/link';

import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { FilterToolbar } from '../../../components/FilterToolbar';
import { MetricStrip } from '../../../components/MetricStrip';
import { OverflowMenu } from '../../../components/OverflowMenu';
import { PageHeader } from '../../../components/PageHeader';
import { QueryPagination } from '../../../components/QueryPagination';
import { StatusBadge } from '../../../components/StatusBadge';
import { SellerStatusActions } from '../../../features/sellers/SellerStatusActions';
import { fetchSellerCounts, fetchSellerPage } from '../../../lib/admin-data';
import { formatFullDateTime } from '../../../lib/format';

type SellersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getSellerRowTone = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'pending') return 'warning' as const;
  if (normalized === 'approved' || normalized === 'active') return 'success' as const;
  if (normalized === 'rejected') return 'danger' as const;

  return 'neutral' as const;
};

const SellersPage = async ({ searchParams }: SellersPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const limit = typeof resolvedSearchParams.limit === 'string' ? resolvedSearchParams.limit : '20';
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : '';
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';

  const [sellerResult, sellerCounts] = await Promise.all([
    fetchSellerPage({
      page,
      limit,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    }),
    fetchSellerCounts(),
  ]);

  const queryParams: Record<string, string> = {};
  if (status) queryParams.status = status;
  if (search) queryParams.search = search;
  if (limit) queryParams.limit = limit;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Seller Review"
        title="Sellers"
        description="Work through onboarding decisions quickly, with the queue, contact context, and escalation actions kept close together."
        tone="review"
        legend={
          <>
            <span className="filter-chip-active">Review workflow</span>
            <span className="filter-chip">Contact and KYC context stay collapsed until needed</span>
          </>
        }
        actions={
          <Link href="/sellers?status=pending" className="btn-primary px-4">
            Open pending queue
          </Link>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-warning)]">Queue depth</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {sellerCounts.pending}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  sellers are still waiting for a first review decision
                </div>
              </div>
              <span className="command-badge">{sellerCounts.approved} approved</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Total sellers',
            value: sellerCounts.total,
            helper: `${sellerResult.pagination.total} in current result set`,
            tone: 'brand',
          },
          {
            label: 'Pending review',
            value: sellerCounts.pending,
            helper: 'Waiting for approval or rejection',
            tone: 'warning',
          },
          {
            label: 'Approved',
            value: sellerCounts.approved,
            helper: 'Ready for activation and monitoring',
            tone: 'positive',
          },
          {
            label: 'Rejected',
            value: sellerCounts.rejected,
            helper: 'Applications closed out with notes',
            tone: 'danger',
          },
        ]}
      />

      <FilterToolbar
        action="/sellers"
        tone="review"
        resetHref="/sellers"
        submitLabel="Apply"
        hiddenFields={<input type="hidden" name="limit" value={limit} />}
        resultCount={`${sellerResult.pagination.total} matching sellers`}
        search={
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search seller name, business, email, or GST"
            className="input-base w-full"
          />
        }
        primaryFilters={
          <select name="status" defaultValue={status} className="select-base min-w-[190px]">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
          </select>
        }
        quickFilters={
          <>
            <Link href="/sellers?status=pending" className={status === 'pending' ? 'filter-chip-active' : 'filter-chip'}>
              Pending review
            </Link>
            <Link href="/sellers?status=approved" className={status === 'approved' ? 'filter-chip-active' : 'filter-chip'}>
              Approved
            </Link>
            <Link href="/sellers?status=rejected" className={status === 'rejected' ? 'filter-chip-active' : 'filter-chip'}>
              Rejected
            </Link>
            <Link href="/sellers" className={!status && !search ? 'filter-chip-active' : 'filter-chip'}>
              All sellers
            </Link>
          </>
        }
        activeFilters={
          <>
            {status ? <span className="filter-chip-active">Status: {status}</span> : null}
            {search ? <span className="filter-chip">Search: {search}</span> : null}
          </>
        }
      />

      <DataTable
        data={sellerResult.items}
        getRowKey={(item) => item.id}
        title="Seller records"
        description={`${sellerResult.pagination.total} sellers available from the admin seller endpoints.`}
        tone="review"
        legend={
          <>
            <span className="filter-chip-active">Pending rows are highlighted</span>
            <span className="filter-chip">Actions stay pinned to the right edge</span>
          </>
        }
        resultCount={`Page ${sellerResult.pagination.page} of ${sellerResult.pagination.totalPages}`}
        density="compact"
        stickyLastColumn
        rowTone={(item) => getSellerRowTone(item.sellerStatus)}
        secondaryContent={(item) => (
          <div className="table-secondary-row grid gap-2 text-sm text-secondary md:grid-cols-3">
            <span>{[item.countryCode, item.phone].filter(Boolean).join(' ') || 'Phone unavailable'}</span>
            <span>{item.email || 'No email provided'}</span>
            <span>
              {[item.address.city || item.address.billingAddress, item.address.state, item.address.pincode]
                .filter(Boolean)
                .join(' • ') || 'No location details'}
            </span>
          </div>
        )}
        emptyState={
          <EmptyState
            title="No sellers found"
            description="Try a different search or status filter to widen the result set."
          />
        }
        footer={
          <QueryPagination
            page={sellerResult.pagination.page}
            totalPages={sellerResult.pagination.totalPages}
            totalItems={sellerResult.pagination.total}
            pageSize={sellerResult.pagination.limit}
            params={queryParams}
          />
        }
        columns={[
          {
            key: 'seller',
            header: 'Seller',
            className: 'min-w-[260px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-semibold text-primary">{item.username}</div>
                <div className="mt-1 text-xs text-secondary">{item.businessName}</div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Review status',
            className: 'min-w-[140px]',
            priority: 'secondary',
            render: (item) => <StatusBadge status={item.sellerStatus} />,
          },
          {
            key: 'created',
            header: 'Submitted',
            className: 'min-w-[180px]',
            priority: 'secondary',
            render: (item) => (
              <span className="text-sm text-secondary">
                {item.createdAt ? formatFullDateTime(item.createdAt) : 'Unknown'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Action',
            className: 'min-w-[170px]',
            priority: 'action',
            render: (item) => (
              <div className="flex items-center justify-end gap-2">
                <Link href={`/sellers/${item.id}`} className="btn-ghost px-3 text-xs">
                  Review
                </Link>
                <OverflowMenu>
                  <Link href={`/sellers/${item.id}`} className="menu-action">
                    Open seller record
                  </Link>
                  <SellerStatusActions seller={item} layout="menu" compact />
                </OverflowMenu>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};

export default SellersPage;
