import Link from 'next/link';

import { DashboardAnalytics } from '../../../components/DashboardAnalytics';
import { DataTable } from '../../../components/DataTable';
import { MetricStrip } from '../../../components/MetricStrip';
import { PageHeader } from '../../../components/PageHeader';
import { StatusBadge } from '../../../components/StatusBadge';
import {
  type DashboardSummary,
  fetchDashboardSummary,
  fetchOrderPage,
  fetchPayoutPage,
  fetchRecentProducts,
  fetchSellerPage,
} from '../../../lib/admin-data';
import {
  formatCurrency,
  getStatusLabel,
  type AdminListResult,
  type AdminPagination,
  type AdminOrder,
  type AdminPayout,
  type AdminSeller,
} from '../../../lib/admin-api';
import { formatRelativeTime } from '../../../lib/format';

const emptyPagination: AdminPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const emptyListResult = <T,>(
  overrides: Partial<AdminPagination> = {},
): AdminListResult<T> => ({
  items: [],
  pagination: {
    ...emptyPagination,
    ...overrides,
  },
});

const emptyDashboardSummary: DashboardSummary = {
  sellerCounts: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
  productStats: {
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    inactiveProducts: 0,
    outOfStock: 0,
    totalSold: 0,
    topCategories: [],
    raw: {},
  },
  orderStats: {
    timeRange: 'week',
    totalOrders: 0,
    totalRevenue: 0,
    totalRevenueFormatted: formatCurrency(0),
    paidRevenue: 0,
    paidRevenueFormatted: formatCurrency(0),
    allTimeTotalRevenue: 0,
    allTimeTotalRevenueFormatted: formatCurrency(0),
    pendingOrders: 0,
    deliveredOrders: 0,
    statusBreakdown: {},
    topSellers: [],
    raw: {},
    periodRaw: {},
    allTimeRaw: {},
  },
  settlementSummary: {
    pending: { count: 0, amount: 0, formatted: formatCurrency(0) },
    approved: { count: 0, amount: 0, formatted: formatCurrency(0) },
    processing: { count: 0, amount: 0, formatted: formatCurrency(0) },
    paid: { count: 0, amount: 0, formatted: formatCurrency(0) },
    failed: { count: 0, amount: 0, formatted: formatCurrency(0) },
    hold: { count: 0, amount: 0, formatted: formatCurrency(0) },
    totalCommission: 0,
    totalCommissionFormatted: formatCurrency(0),
    totalPayoutsDone: 0,
    totalPayoutsDoneFormatted: formatCurrency(0),
    raw: {},
  },
};

const trendFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

const buildTimeline = (days: number) =>
  Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));

    return {
      key: date.toISOString().slice(0, 10),
      label: trendFormatter.format(date),
    };
  });

const normalizeDateKey = (value: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .slice(0, 10);
};

const buildSellerTrend = (items: AdminSeller[]) => {
  const timeline = buildTimeline(7);
  const counters = new Map(
    timeline.map((point) => [point.key, { submitted: 0, approved: 0 }]),
  );

  items.forEach((item) => {
    const createdKey = normalizeDateKey(item.createdAt);
    if (!createdKey || !counters.has(createdKey)) {
      return;
    }

    const bucket = counters.get(createdKey)!;
    bucket.submitted += 1;

    if (['approved', 'active'].includes(item.sellerStatus.toLowerCase())) {
      bucket.approved += 1;
    }
  });

  return timeline.map((point) => ({
    label: point.label,
    submitted: counters.get(point.key)?.submitted ?? 0,
    approved: counters.get(point.key)?.approved ?? 0,
  }));
};

const buildOrderTrend = (items: AdminOrder[]) => {
  const timeline = buildTimeline(7);
  const counters = new Map(
    timeline.map((point) => [point.key, { orders: 0, revenue: 0 }]),
  );

  items.forEach((item) => {
    const createdKey = normalizeDateKey(item.createdAt);
    if (!createdKey || !counters.has(createdKey)) {
      return;
    }

    const bucket = counters.get(createdKey)!;
    bucket.orders += 1;
    bucket.revenue += item.total;
  });

  return timeline.map((point) => ({
    label: point.label,
    orders: counters.get(point.key)?.orders ?? 0,
    revenue: counters.get(point.key)?.revenue ?? 0,
  }));
};

const buildPayoutMix = (items: AdminPayout[]) => {
  const grouped = items.reduce<Record<string, number>>((accumulator, item) => {
    const label = getStatusLabel(item.status || 'unknown');
    accumulator[label] = (accumulator[label] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .sort((left, right) => right[1] - left[1])
    .map(([label, value]) => ({ label, value }));
};

const isOrderException = (order: AdminOrder) => {
  const status = order.status.toLowerCase();
  const paymentStatus = order.paymentStatus.toLowerCase();

  return (
    ['cancelled', 'failed', 'refunded'].includes(status) ||
    ['failed', 'refunded'].includes(paymentStatus) ||
    ['pending', 'processing'].includes(status)
  );
};

const getSellerRowTone = (seller: AdminSeller) => {
  const status = seller.sellerStatus.toLowerCase();

  if (status === 'pending') return 'warning' as const;
  if (status === 'approved' || status === 'active') return 'success' as const;
  if (status === 'rejected') return 'danger' as const;

  return 'neutral' as const;
};

const getOrderRowTone = (order: AdminOrder) => {
  const status = order.status.toLowerCase();
  const paymentStatus = order.paymentStatus.toLowerCase();

  if (['cancelled', 'failed', 'refunded'].includes(status) || ['failed', 'refunded'].includes(paymentStatus)) {
    return 'danger' as const;
  }

  if (['pending', 'processing'].includes(status)) {
    return 'warning' as const;
  }

  if (status === 'delivered') {
    return 'success' as const;
  }

  return 'neutral' as const;
};

const DashboardPage = async () => {
  const [summary, pendingSellers, payoutFlow, recentOrders, recentProducts, sellerActivity] =
    await Promise.all([
      fetchDashboardSummary().catch(() => emptyDashboardSummary),
      fetchSellerPage({ status: 'pending', limit: 5 }).catch(() => emptyListResult<AdminSeller>({ limit: 5 })),
      fetchPayoutPage({ limit: 18 }).catch(() => ({
        ...emptyListResult<AdminPayout>({ limit: 18 }),
        stats: {},
      })),
      fetchOrderPage({ limit: 18 }).catch(() => ({
        ...emptyListResult<AdminOrder>({ limit: 18 }),
        stats: {},
      })),
      fetchRecentProducts().catch(() => []),
      fetchSellerPage({ limit: 24 }).catch(() => emptyListResult<AdminSeller>({ limit: 24 })),
    ]);

  const pendingSummary = summary.settlementSummary.pending;
  const activeProducts = summary.productStats.activeProducts;
  const totalProducts = summary.productStats.totalProducts;
  const totalRevenue = summary.orderStats.totalRevenue;
  const pendingOrders = summary.orderStats.pendingOrders;

  const sellerTrend = buildSellerTrend(sellerActivity.items);
  const orderTrend = buildOrderTrend(recentOrders.items);
  const payoutMix = buildPayoutMix(payoutFlow.items);
  const payoutWatchlist = payoutFlow.items
    .filter((item) => ['pending', 'approved', 'hold', 'failed'].includes(item.status))
    .slice(0, 5);
  const orderExceptions = recentOrders.items.filter(isOrderException).slice(0, 5);
  const orderExceptionRows =
    orderExceptions.length > 0 ? orderExceptions : recentOrders.items.slice(0, 5);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Operations Command Center"
        description="Monitor seller review, catalog health, payout approvals, and order exceptions from one clear dashboard."
        tone="overview"
        showToneChip={false}
        actions={
          <Link href="/sellers?status=pending" className="btn-primary px-4">
            Review pending sellers
          </Link>
        }
        footer={
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="action-band">
              <div className="chart-meta text-[color:var(--metric-warning)]">Seller queue</div>
              <div className="mt-2 text-2xl font-semibold text-primary">{summary.sellerCounts.pending}</div>
              <div className="mt-1 text-sm text-secondary">pending seller reviews</div>
            </div>
            <div className="action-band">
              <div className="chart-meta text-[color:var(--metric-brand)]">Order flow</div>
              <div className="mt-2 text-2xl font-semibold text-primary">{pendingOrders}</div>
              <div className="mt-1 text-sm text-secondary">orders still in progress</div>
            </div>
            <div className="action-band">
              <div className="chart-meta text-[color:var(--metric-positive)]">Settlement queue</div>
              <div className="mt-2 text-2xl font-semibold text-primary">{pendingSummary.count}</div>
              <div className="mt-1 text-sm text-secondary">
                {pendingSummary.formatted} pending payout value
              </div>
            </div>
            <div className="action-band">
              <div className="chart-meta tone-operations">Catalog</div>
              <div className="mt-2 text-2xl font-semibold text-primary">{activeProducts}</div>
              <div className="mt-1 text-sm text-secondary">{totalProducts} products in catalog</div>
            </div>
          </div>
        }
      />

      <MetricStrip
        variant="compact"
        items={[
          {
            label: 'Seller review queue',
            value: summary.sellerCounts.pending,
            helper: `${summary.sellerCounts.total} total sellers`,
            tone: 'warning',
          },
          {
            label: 'Catalog health',
            value: activeProducts,
            helper: `${totalProducts} products in catalog`,
            tone: 'brand',
          },
          {
            label: 'Revenue throughput',
            value: formatCurrency(totalRevenue),
            helper: `${summary.orderStats.totalOrders || recentOrders.pagination.total} total orders`,
            tone: 'positive',
          },
          {
            label: 'Settlement pressure',
            value: pendingSummary.count,
            helper: pendingSummary.formatted,
            tone: 'warning',
          },
        ]}
      />

      <DashboardAnalytics
        sellerTrend={sellerTrend}
        payoutMix={payoutMix}
        orderTrend={orderTrend}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
        <DataTable
          data={pendingSellers.items}
          getRowKey={(item) => item.id}
          title="Pending seller review queue"
          description="The newest seller applications that still need approval, rejection, or follow-up before onboarding can move forward."
          tone="review"
          legend={
            <>
              <span className="filter-chip-active">Amber rows need action</span>
              <span className="filter-chip">Secondary details stay collapsed</span>
            </>
          }
          resultCount={`${pendingSellers.items.length} urgent seller records`}
          actions={
            <Link href="/sellers?status=pending" className="btn-ghost px-4 text-xs">
              Open full queue
            </Link>
          }
          rowTone={getSellerRowTone}
          density="compact"
          secondaryContent={(item) => (
            <div className="table-secondary-row flex flex-col gap-2 text-sm text-secondary md:flex-row md:items-center md:justify-between">
              <span>
                {[item.countryCode, item.phone].filter(Boolean).join(' ') || 'Contact unavailable'}
              </span>
              <span>{item.email || 'No email on record'}</span>
              <span>
                {[item.address.city, item.address.state].filter(Boolean).join(', ') || 'Location unavailable'}
              </span>
            </div>
          )}
          columns={[
            {
              key: 'seller',
              header: 'Seller',
              className: 'min-w-[240px]',
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
              header: 'Status',
              className: 'min-w-[120px]',
              priority: 'secondary',
              render: (item) => <StatusBadge status={item.sellerStatus} />,
            },
            {
              key: 'created',
              header: 'Submitted',
              className: 'min-w-[160px]',
              priority: 'secondary',
              render: (item) => (
                <span className="text-sm text-secondary">
                  {item.createdAt ? formatRelativeTime(item.createdAt) : 'Unknown'}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'Action',
              className: 'min-w-[140px]',
              priority: 'action',
              render: (item) => (
                <Link href={`/sellers/${item.id}`} className="btn-ghost px-3 text-xs">
                  Review
                </Link>
              ),
            },
          ]}
        />

        <div className="space-y-5">
          <section className="analytics-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="chart-meta text-[color:var(--metric-warning)]">Payout watchlist</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                  Finance exceptions
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Holds, pending approvals, and settlement records that may delay seller cashflow.
                </p>
              </div>
              <Link href="/settlements?status=pending" className="btn-ghost px-4 text-xs">
                Open settlements
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {payoutWatchlist.length === 0 ? (
                <div className="table-secondary-row text-sm text-secondary">
                  No settlement exceptions are waiting right now.
                </div>
              ) : (
                payoutWatchlist.map((payout) => (
                  <article
                    key={payout.id}
                    className="table-secondary-row flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="font-semibold text-primary">{payout.sellerName || 'Seller payout'}</div>
                      <div className="mt-1 text-xs text-secondary">
                        {payout.orderRef || payout.orderId || 'Order reference unavailable'}
                      </div>
                    </div>
                    <div className="text-sm text-secondary">
                      Seller {formatCurrency(payout.sellerAmount)} • Commission {formatCurrency(payout.commission)}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={payout.status} />
                      {payout.orderId ? (
                        <Link href={`/orders/${payout.orderId}`} className="btn-ghost px-3 text-xs">
                          View order
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <DataTable
            data={orderExceptionRows}
            getRowKey={(item) => item.id}
            title="Recent order exceptions"
            description="Orders with risk signals in payment or fulfillment, surfaced before the broader ledger."
            tone="fulfillment"
            resultCount={`${orderExceptionRows.length} flagged rows`}
            rowTone={getOrderRowTone}
            actions={
              <Link href="/orders" className="btn-ghost px-4 text-xs">
                Open order ledger
              </Link>
            }
            density="compact"
            secondaryContent={(item) => (
              <div className="table-secondary-row flex flex-col gap-2 text-sm text-secondary md:flex-row md:items-center md:justify-between">
                <span>{item.buyerName}</span>
                <span>{item.paymentStatus || 'Payment unknown'}</span>
                <span>{item.orderType || 'Type unavailable'}</span>
              </div>
            )}
            columns={[
              {
                key: 'order',
                header: 'Order',
                className: 'min-w-[170px]',
                priority: 'primary',
                render: (item) => (
                  <div>
                    <div className="font-semibold text-primary">{item.orderId}</div>
                    <div className="mt-1 text-xs text-secondary">{item.sellerName || 'Unknown seller'}</div>
                  </div>
                ),
              },
              {
                key: 'value',
                header: 'Value',
                className: 'min-w-[120px]',
                priority: 'secondary',
                render: (item) => <span className="text-sm text-primary">{formatCurrency(item.total)}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                className: 'min-w-[130px]',
                priority: 'secondary',
                render: (item) => <StatusBadge status={item.status} />,
              },
              {
                key: 'actions',
                header: 'Action',
                className: 'min-w-[140px]',
                priority: 'action',
                render: (item) => (
                  <Link href={`/orders/${item.id}`} className="btn-ghost px-3 text-xs">
                    Inspect
                  </Link>
                ),
              },
            ]}
          />

          <section className="analytics-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="chart-meta tone-operations">Recent catalog activity</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                  Product movement
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  New catalog entries and updated listings that may need moderation follow-through.
                </p>
              </div>
              <Link href="/products" className="btn-ghost px-4 text-xs">
                Open products
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentProducts.slice(0, 4).map((product) => (
                <article
                  key={product.id}
                  className="table-secondary-row flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="font-semibold text-primary">{product.name}</div>
                    <div className="mt-1 text-xs text-secondary">
                      {[product.category, product.subCategory].filter(Boolean).join(' • ') || 'Category unavailable'}
                    </div>
                  </div>
                  <div className="text-sm text-secondary">
                    {product.sellerName || 'Unknown seller'} • {formatCurrency(product.price)}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={product.status} />
                    <Link href={`/products/${product.id}`} className="btn-ghost px-3 text-xs">
                      Inspect
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
