import Link from 'next/link';

import { MetricStrip } from '../../../../components/MetricStrip';
import { PageHeader } from '../../../../components/PageHeader';
import { StatusBadge } from '../../../../components/StatusBadge';
import { fetchOrderDetail } from '../../../../lib/admin-data';
import { formatCurrency } from '../../../../lib/admin-api';
import { formatFullDateTime } from '../../../../lib/format';

const OrderDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const order = await fetchOrderDetail(id);

  const rawItems = Array.isArray(order.raw.items) ? order.raw.items : [];
  const statusHistory = Array.isArray(order.raw.statusHistory) ? order.raw.statusHistory : [];

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Order Detail"
        title={order.orderId}
        description="Inspect payment, fulfillment, and status movement without forcing every raw detail into a single long dump."
        badge={<StatusBadge status={order.status} />}
        tone="fulfillment"
        legend={
          <>
            <span className="filter-chip-active">Order record</span>
            <span className="filter-chip">{order.itemCount} line items</span>
          </>
        }
        actions={
          <Link href="/orders" className="btn-ghost px-4">
            Back to orders
          </Link>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-brand)]">Payment posture</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {formatCurrency(order.total)}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  total order value across payment and fulfillment
                </div>
              </div>
              <span className="command-badge">{order.paymentStatus || 'Unknown payment'}</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Total',
            value: formatCurrency(order.total),
            helper: `Subtotal ${formatCurrency(order.subtotal)}`,
            tone: 'brand',
          },
          {
            label: 'Items',
            value: order.itemCount,
            helper: 'Line items in this order',
            tone: 'neutral',
          },
          {
            label: 'Payment',
            value: order.paymentStatus || 'Unknown',
            helper: order.paymentMethod || 'Method unavailable',
            tone: 'positive',
          },
          {
            label: 'Order type',
            value: order.orderType || 'Unknown',
            helper: order.sellerName || 'Unknown seller',
            tone: 'warning',
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="card-shell card-padding">
            <div className="label-meta">Order summary</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Fulfillment overview
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="label-meta">Buyer</div>
                <div className="mt-2 text-sm text-primary">{order.buyerName}</div>
              </div>
              <div>
                <div className="label-meta">Seller</div>
                <div className="mt-2 text-sm text-primary">{order.sellerName || 'Unknown seller'}</div>
              </div>
              <div>
                <div className="label-meta">Created</div>
                <div className="mt-2 text-sm text-primary">
                  {order.createdAt ? formatFullDateTime(order.createdAt) : 'Unknown'}
                </div>
              </div>
              <div>
                <div className="label-meta">Updated</div>
                <div className="mt-2 text-sm text-primary">
                  {order.updatedAt ? formatFullDateTime(order.updatedAt) : 'Unknown'}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="label-meta">Discount</div>
                <div className="mt-2 text-sm text-primary">{formatCurrency(order.discount)}</div>
              </div>
              <div>
                <div className="label-meta">Shipping</div>
                <div className="mt-2 text-sm text-primary">{formatCurrency(order.shipping)}</div>
              </div>
              <div>
                <div className="label-meta">Tax</div>
                <div className="mt-2 text-sm text-primary">{formatCurrency(order.tax)}</div>
              </div>
              <div>
                <div className="label-meta">Buyer phone</div>
                <div className="mt-2 text-sm text-primary">{order.buyerPhone || 'Unavailable'}</div>
              </div>
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="label-meta">Line items</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Order composition
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">Items returned in the order payload.</p>

            {rawItems.length === 0 ? (
              <div className="table-secondary-row mt-5 text-sm text-secondary">
                No line items were returned by the order detail route.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {rawItems.map((item, index) => {
                  const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};

                  return (
                    <article key={`${record.product ?? index}-${index}`} className="table-secondary-row">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="font-semibold text-primary">{record.name?.toString() ?? 'Unnamed item'}</div>
                          <div className="mt-1 text-xs text-secondary">
                            Qty {record.qty?.toString() ?? '0'} • {formatCurrency(Number(record.total ?? 0))}
                          </div>
                        </div>
                        <div className="text-sm text-secondary">
                          {record.variant && typeof record.variant === 'object'
                            ? Object.entries(record.variant as Record<string, unknown>)
                                .map(([key, value]) => `${key}: ${String(value)}`)
                                .join(' • ')
                            : 'No variant details'}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card-shell card-padding">
            <div className="label-meta">Delivery</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Delivery context
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="table-secondary-row">
                <div className="label-meta">City / State</div>
                <div className="mt-2 text-primary">
                  {[order.deliveryCity, order.deliveryState].filter(Boolean).join(', ') || 'Unavailable'}
                </div>
              </div>
              <div className="table-secondary-row">
                <div className="label-meta">Pincode</div>
                <div className="mt-2 text-primary">{order.deliveryPincode || 'Unavailable'}</div>
              </div>
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="label-meta">History</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Status timeline
            </h2>
            {statusHistory.length === 0 ? (
              <div className="table-secondary-row mt-5 text-sm text-secondary">
                No status history was returned.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {statusHistory.map((entry, index) => {
                  const record =
                    typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>) : {};

                  return (
                    <div key={index} className="table-secondary-row">
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge status={record.status?.toString() ?? 'unknown'} />
                        <span className="text-xs text-secondary">
                          {record.timestamp ? formatFullDateTime(String(record.timestamp)) : 'Unknown'}
                        </span>
                      </div>
                      {record.note ? <div className="mt-3 text-sm text-secondary">{String(record.note)}</div> : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetailPage;
