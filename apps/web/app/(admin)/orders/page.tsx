import Link from 'next/link';

import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { FilterToolbar } from '../../../components/FilterToolbar';
import { MetricStrip } from '../../../components/MetricStrip';
import { PageHeader } from '../../../components/PageHeader';
import { QueryPagination } from '../../../components/QueryPagination';
import { StatusBadge } from '../../../components/StatusBadge';
import { fetchOrderPage, fetchOrderStats } from '../../../lib/admin-data';
import { formatCurrency, getStatusLabel } from '../../../lib/admin-api';
import { formatFullDateTime } from '../../../lib/format';

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getOrderRowTone = (status: string, paymentStatus: string) => {
  const normalizedStatus = status.toLowerCase();
  const normalizedPayment = paymentStatus.toLowerCase();

  if (
    ['cancelled', 'failed', 'refunded'].includes(normalizedStatus) ||
    ['failed', 'refunded'].includes(normalizedPayment)
  ) {
    return 'danger' as const;
  }

  if (['pending', 'processing', 'confirmed'].includes(normalizedStatus)) {
    return 'warning' as const;
  }

  if (normalizedStatus === 'delivered') {
    return 'success' as const;
  }

  return 'neutral' as const;
};

const OrdersPage = async ({ searchParams }: OrdersPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const limit = typeof resolvedSearchParams.limit === 'string' ? resolvedSearchParams.limit : '20';
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : '';
  const paymentStatus =
    typeof resolvedSearchParams.paymentStatus === 'string'
      ? resolvedSearchParams.paymentStatus
      : '';
  const orderType =
    typeof resolvedSearchParams.orderType === 'string' ? resolvedSearchParams.orderType : '';
  const startDate =
    typeof resolvedSearchParams.startDate === 'string' ? resolvedSearchParams.startDate : '';
  const endDate =
    typeof resolvedSearchParams.endDate === 'string' ? resolvedSearchParams.endDate : '';
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
  const sellerId =
    typeof resolvedSearchParams.sellerId === 'string' ? resolvedSearchParams.sellerId : '';

  const [orders, stats] = await Promise.all([
    fetchOrderPage({
      page,
      limit,
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(orderType ? { orderType } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(search ? { search } : {}),
      ...(sellerId ? { sellerId } : {}),
    }),
    fetchOrderStats({
      ...(startDate && endDate ? { timeRange: 'custom', startDate, endDate } : {}),
    }),
  ]);

  const queryParams: Record<string, string> = {};
  if (status) queryParams.status = status;
  if (paymentStatus) queryParams.paymentStatus = paymentStatus;
  if (orderType) queryParams.orderType = orderType;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  if (search) queryParams.search = search;
  if (sellerId) queryParams.sellerId = sellerId;
  if (limit) queryParams.limit = limit;

  const deliveredCount =
    typeof stats.statusCounts === 'object' &&
    stats.statusCounts !== null &&
    'delivered' in stats.statusCounts
      ? Number((stats.statusCounts as Record<string, unknown>).delivered ?? 0)
      : 0;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Fulfillment"
        title="Orders"
        description="Scan the order ledger quickly, then dive deeper only where payment, fulfillment, or seller context demands it."
        tone="fulfillment"
        legend={
          <>
            <span className="filter-chip-active">Fulfillment visibility</span>
            <span className="filter-chip">Payment and delivery context stay close to the row</span>
          </>
        }
        actions={
          <>
            <Link href="/orders/insights?timeRange=month" className="btn-ghost px-4">
              View order insights
            </Link>
            <Link href="/orders" className="btn-primary px-4">
              Open order ledger
            </Link>
          </>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-brand)]">Flow pressure</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {Number(stats.pendingOrders ?? 0)}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  orders are still waiting inside the fulfillment pipeline
                </div>
              </div>
              <span className="command-badge">{deliveredCount} delivered</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Total orders',
            value: Number(stats.totalOrders ?? orders.pagination.total),
            helper: `${orders.pagination.total} in current result set`,
            tone: 'brand',
          },
          {
            label: 'Revenue',
            value: formatCurrency(Number(stats.totalRevenue ?? 0)),
            helper: 'Gross order value',
            tone: 'positive',
          },
          {
            label: 'Pending',
            value: Number(stats.pendingOrders ?? 0),
            helper: 'Orders still waiting in flow',
            tone: 'warning',
          },
          {
            label: 'Delivered',
            value: deliveredCount,
            helper: 'Completed fulfillment',
            tone: 'neutral',
          },
        ]}
      />

      <FilterToolbar
        action="/orders"
        tone="fulfillment"
        resetHref="/orders"
        submitLabel="Apply"
        hiddenFields={<input type="hidden" name="limit" value={limit} />}
        resultCount={`${orders.pagination.total} matching orders`}
        search={
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search order ID or buyer"
            className="input-base w-full"
          />
        }
        primaryFilters={
          <select name="status" defaultValue={status} className="select-base min-w-[170px]">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        }
        secondaryFilters={
          <>
            <select name="paymentStatus" defaultValue={paymentStatus} className="select-base w-full">
              <option value="">Any payment</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select name="orderType" defaultValue={orderType} className="select-base w-full">
              <option value="">Any order type</option>
              <option value="COD">COD</option>
              <option value="Prepaid">Prepaid</option>
            </select>
            <input type="date" name="startDate" defaultValue={startDate} className="input-base w-full" />
            <input type="date" name="endDate" defaultValue={endDate} className="input-base w-full" />
          </>
        }
        quickFilters={
          <>
            <Link href="/orders?status=pending" className={status === 'pending' ? 'filter-chip-active' : 'filter-chip'}>
              Pending
            </Link>
            <Link href="/orders?status=delivered" className={status === 'delivered' ? 'filter-chip-active' : 'filter-chip'}>
              Delivered
            </Link>
            <Link
              href="/orders?paymentStatus=failed"
              className={paymentStatus === 'failed' ? 'filter-chip-active' : 'filter-chip'}
            >
              Failed payment
            </Link>
            <Link href="/orders" className={!status && !paymentStatus && !search ? 'filter-chip-active' : 'filter-chip'}>
              All orders
            </Link>
          </>
        }
        activeFilters={
          <>
            {status ? <span className="filter-chip-active">Status: {status}</span> : null}
            {paymentStatus ? <span className="filter-chip">Payment: {paymentStatus}</span> : null}
            {orderType ? <span className="filter-chip">Type: {orderType}</span> : null}
            {search ? <span className="filter-chip">Search: {search}</span> : null}
            {startDate && endDate ? <span className="filter-chip">{startDate} to {endDate}</span> : null}
          </>
        }
      />

      <DataTable
        data={orders.items}
        getRowKey={(item) => item.id}
        title="Order ledger"
        description={`${orders.pagination.total} orders returned by the admin order APIs.`}
        tone="fulfillment"
        legend={
          <>
            <span className="filter-chip-active">Exception rows surface in amber or red</span>
            <span className="filter-chip">Payment detail stays visible below the main row</span>
          </>
        }
        resultCount={`Page ${orders.pagination.page} of ${orders.pagination.totalPages}`}
        density="compact"
        stickyLastColumn
        rowTone={(item) => getOrderRowTone(item.status, item.paymentStatus)}
        secondaryContent={(item) => (
          <div className="table-secondary-row grid gap-2 text-sm text-secondary md:grid-cols-4">
            <span>{item.buyerName}</span>
            <span>{getStatusLabel(item.paymentStatus || 'unknown')}</span>
            <span>{item.orderType || 'Type unavailable'}</span>
            <span>
              {[item.deliveryCity, item.deliveryState].filter(Boolean).join(', ') || 'Delivery location unavailable'}
            </span>
          </div>
        )}
        emptyState={
          <EmptyState
            title="No orders found"
            description="Try broadening the filters to inspect more order activity."
          />
        }
        footer={
          <QueryPagination
            page={orders.pagination.page}
            totalPages={orders.pagination.totalPages}
            totalItems={orders.pagination.total}
            pageSize={orders.pagination.limit}
            params={queryParams}
          />
        }
        columns={[
          {
            key: 'order',
            header: 'Order',
            className: 'min-w-[220px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-semibold text-primary">{item.orderId}</div>
                <div className="mt-1 text-xs text-secondary">{item.sellerName || 'Unknown seller'}</div>
              </div>
            ),
          },
          {
            key: 'payment',
            header: 'Value',
            className: 'min-w-[130px]',
            priority: 'secondary',
            render: (item) => <span className="text-sm text-primary">{formatCurrency(item.total)}</span>,
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
            key: 'actions',
            header: 'Action',
            className: 'min-w-[140px]',
            priority: 'action',
            render: (item) => (
              <div className="flex justify-end">
                <Link href={`/orders/${item.id}`} className="btn-ghost px-3 text-xs">
                  View order
                </Link>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};

export default OrdersPage;
