import Link from 'next/link';

import { DataTable } from '../../../../components/DataTable';
import { EmptyState } from '../../../../components/EmptyState';
import { MetricStrip } from '../../../../components/MetricStrip';
import { PageHeader } from '../../../../components/PageHeader';
import { StatusBadge } from '../../../../components/StatusBadge';
import { fetchOrderStats } from '../../../../lib/admin-data';
import { formatCurrency } from '../../../../lib/admin-api';

type OrderInsightsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type TimeRange = 'today' | 'month' | 'year';

type StatusBreakdownRow = {
  status: string;
  count: number;
};

const timeRanges: TimeRange[] = ['today', 'month', 'year'];
const getStatusBreakdown = (value: Record<string, number>): StatusBreakdownRow[] =>
  Object.entries(value)
    .map(([status, count]) => ({
      status,
      count,
    }))
    .sort((left, right) => right.count - left.count);

const OrderInsightsPage = async ({ searchParams }: OrderInsightsPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedTimeRange = typeof resolvedSearchParams.timeRange === 'string' ? resolvedSearchParams.timeRange : 'month';
  const activeTimeRange: TimeRange = timeRanges.includes(requestedTimeRange as TimeRange)
    ? (requestedTimeRange as TimeRange)
    : 'month';

  const [todayStatsPayload, monthStatsPayload, yearStatsPayload] = await Promise.all([
    fetchOrderStats({ timeRange: 'today' }),
    fetchOrderStats({ timeRange: 'month' }),
    fetchOrderStats({ timeRange: 'year' }),
  ]);

  const statsByRange = {
    today: todayStatsPayload,
    month: monthStatsPayload,
    year: yearStatsPayload,
  };

  const selectedStats = statsByRange[activeTimeRange];
  const selectedTopSellers = selectedStats.topSellers;
  const selectedStatusBreakdown = getStatusBreakdown(selectedStats.statusBreakdown);
  const selectedOrderTotal = selectedStats.totalOrders;

  const rangeLabelMap: Record<TimeRange, string> = {
    today: 'Today',
    month: 'This Month',
    year: 'This Year',
  };

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Orders"
        title="Order Insights"
        description="Compare today, month, and year order performance from the dedicated stats endpoints, then move straight into the order ledger when something needs attention."
        tone="fulfillment"
        legend={
          <>
            {timeRanges.map((range) => (
              <Link
                key={range}
                href={`/orders/insights?timeRange=${range}`}
                className={activeTimeRange === range ? 'filter-chip-active' : 'filter-chip'}
              >
                {rangeLabelMap[range]}
              </Link>
            ))}
          </>
        }
        actions={
          <>
            <Link href="/orders" className="btn-ghost px-4">
              Open order ledger
            </Link>
            <Link href="/orders?status=pending" className="btn-primary px-4">
              Review pending orders
            </Link>
          </>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-brand)]">{rangeLabelMap[activeTimeRange]}</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {selectedOrderTotal}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  orders reported for the selected order stats window
                </div>
              </div>
              <span className="command-badge">{selectedStats.totalRevenueFormatted}</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={timeRanges.map((range) => {
          return {
            label: rangeLabelMap[range],
            value: statsByRange[range].totalOrders,
            helper: statsByRange[range].totalRevenueFormatted,
            tone: activeTimeRange === range ? 'brand' : 'neutral',
          };
        })}
      />

      <MetricStrip
        items={[
          {
            label: 'Selected revenue',
            value: selectedStats.totalRevenueFormatted,
            helper: `${rangeLabelMap[activeTimeRange]} gross order value`,
            tone: 'brand',
          },
          {
            label: 'Paid revenue',
            value: selectedStats.paidRevenueFormatted,
            helper: 'Paid revenue inside this stats window',
            tone: 'positive',
          },
          {
            label: 'All-time revenue',
            value: selectedStats.allTimeTotalRevenueFormatted,
            helper: 'Overall revenue reported by the API',
            tone: 'neutral',
          },
          {
            label: 'Tracked statuses',
            value: selectedStatusBreakdown.length,
            helper: 'Distinct order states in the breakdown',
            tone: 'warning',
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <DataTable
          data={selectedStatusBreakdown}
          getRowKey={(item) => item.status}
          title="Status breakdown"
          description={`Status counts returned by the ${rangeLabelMap[activeTimeRange].toLowerCase()} stats route.`}
          tone="fulfillment"
          density="compact"
          emptyState={
            <EmptyState
              title="No status data returned"
              description="The selected order stats window did not include a status breakdown."
            />
          }
          columns={[
            {
              key: 'status',
              header: 'Status',
              className: 'min-w-[180px]',
              priority: 'primary',
              render: (item) => <StatusBadge status={item.status} />,
            },
            {
              key: 'count',
              header: 'Orders',
              className: 'min-w-[120px]',
              priority: 'secondary',
              render: (item) => <span className="font-semibold text-primary">{item.count}</span>,
            },
            {
              key: 'action',
              header: 'Action',
              className: 'min-w-[150px]',
              priority: 'action',
              render: (item) => (
                <div className="flex justify-end">
                  <Link href={`/orders?status=${item.status}`} className="btn-ghost px-3 text-xs">
                    Open ledger
                  </Link>
                </div>
              ),
            },
          ]}
        />

        <DataTable
          data={selectedTopSellers}
          getRowKey={(item) => item.id || item.username}
          title="Top sellers"
          description={`Top seller performance returned by the ${rangeLabelMap[activeTimeRange].toLowerCase()} stats route.`}
          tone="fulfillment"
          density="compact"
          emptyState={
            <EmptyState
              title="No seller performance returned"
              description="The selected order stats window did not include top seller data."
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
                  <div className="font-semibold text-primary">{item.username}</div>
                  <div className="mt-1 text-xs text-secondary">{item.businessName}</div>
                </div>
              ),
            },
            {
              key: 'orders',
              header: 'Orders',
              className: 'min-w-[120px]',
              priority: 'secondary',
              render: (item) => <span className="text-sm text-primary">{item.orderCount}</span>,
            },
            {
              key: 'revenue',
              header: 'Revenue',
              className: 'min-w-[140px]',
              priority: 'secondary',
              render: (item) => <span className="text-sm text-primary">{formatCurrency(item.totalRevenue)}</span>,
            },
            {
              key: 'action',
              header: 'Action',
              className: 'min-w-[150px]',
              priority: 'action',
              render: (item) => (
                <div className="flex justify-end">
                  <Link href={`/orders?sellerId=${item.id}`} className="btn-ghost px-3 text-xs">
                    View seller orders
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
};

export default OrderInsightsPage;
