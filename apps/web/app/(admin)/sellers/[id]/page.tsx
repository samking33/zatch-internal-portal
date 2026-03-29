import Link from 'next/link';

import { DataTable } from '../../../../components/DataTable';
import { MetricStrip } from '../../../../components/MetricStrip';
import { PageHeader } from '../../../../components/PageHeader';
import { StatusBadge } from '../../../../components/StatusBadge';
import { SellerStatusActions } from '../../../../features/sellers/SellerStatusActions';
import { fetchOrderPage, fetchSellerDetail, fetchSellerSettlement } from '../../../../lib/admin-data';
import { formatCurrency } from '../../../../lib/admin-api';
import { formatFullDateTime } from '../../../../lib/format';

const SellerDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [seller, sellerOrders, sellerSettlement] = await Promise.all([
    fetchSellerDetail(id),
    fetchOrderPage({ sellerId: id, limit: 5 }),
    fetchSellerSettlement(id),
  ]);

  const settlementPending =
    sellerSettlement.summary.pending &&
    typeof sellerSettlement.summary.pending === 'object' &&
    sellerSettlement.summary.pending !== null &&
    'amount' in sellerSettlement.summary.pending
      ? Number((sellerSettlement.summary.pending as { amount?: unknown }).amount ?? 0)
      : 0;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Seller Detail"
        title={seller.username}
        description="Review the seller payload, supporting documents, and settlement footprint before taking a status action."
        badge={<StatusBadge status={seller.sellerStatus} />}
        tone="review"
        legend={
          <>
            <span className="filter-chip-active">Seller review record</span>
            <span className="filter-chip">{seller.documents.length} supporting files attached</span>
          </>
        }
        actions={
          <Link href={`/settlements?sellerId=${seller.id}`} className="btn-ghost px-4">
            View settlements
          </Link>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta text-[color:var(--metric-warning)]">Commercial risk</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {formatCurrency(settlementPending)}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  is currently sitting in pending payouts for this seller
                </div>
              </div>
              <span className="command-badge">{sellerOrders.pagination.total} orders</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Business',
            value: seller.businessName,
            helper: seller.email || 'No email on record',
            tone: 'neutral',
          },
          {
            label: 'Documents',
            value: seller.documents.length,
            helper: 'Files attached to the seller profile',
            tone: 'brand',
          },
          {
            label: 'Recent orders',
            value: sellerOrders.pagination.total,
            helper: 'Orders linked to this seller',
            tone: 'positive',
          },
          {
            label: 'Pending payouts',
            value: formatCurrency(settlementPending),
            helper: 'Awaiting settlement release',
            tone: 'warning',
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="card-shell card-padding">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="label-meta">Profile summary</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                  Seller profile
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Key commercial and onboarding details returned by the seller detail endpoint.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="label-meta">Phone</div>
                <div className="mt-2 text-sm text-primary">
                  {[seller.countryCode, seller.phone].filter(Boolean).join(' ') || 'Unavailable'}
                </div>
              </div>
              <div>
                <div className="label-meta">Email</div>
                <div className="mt-2 text-sm text-primary">{seller.email || 'Unavailable'}</div>
              </div>
              <div>
                <div className="label-meta">GSTIN</div>
                <div className="mt-2 text-sm text-primary">{seller.gstin || 'Unavailable'}</div>
              </div>
              <div>
                <div className="label-meta">Shipping method</div>
                <div className="mt-2 text-sm text-primary">{seller.shippingMethod || 'Unavailable'}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <div className="label-meta">Pickup address</div>
                <div className="mt-2 text-sm leading-6 text-primary">
                  {seller.address.pickupAddress || 'Unavailable'}
                </div>
              </div>
              <div>
                <div className="label-meta">Billing address</div>
                <div className="mt-2 text-sm leading-6 text-primary">
                  {seller.address.billingAddress || 'Unavailable'}
                </div>
              </div>
              <div>
                <div className="label-meta">Location</div>
                <div className="mt-2 text-sm leading-6 text-primary">
                  {[seller.address.city, seller.address.state, seller.address.pincode]
                    .filter(Boolean)
                    .join(', ') || 'Unavailable'}
                </div>
              </div>
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="label-meta">Verification</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                  Documents
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  KYC and registration files attached to this seller profile.
                </p>
              </div>
              <span className="command-badge">{seller.documents.length} files</span>
            </div>

            {seller.documents.length === 0 ? (
              <div className="table-secondary-row mt-5 text-sm text-secondary">
                No documents were returned by the seller detail API.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {seller.documents.map((document, index) => (
                  <article key={`${document.publicId}-${index}`} className="table-secondary-row">
                    <div className="font-semibold text-primary">{document.type}</div>
                    <div className="mt-2 break-all text-xs text-secondary">
                      {document.publicId || 'No public id'}
                    </div>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-semibold text-brand hover:text-blue-700"
                    >
                      Open document
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>

          <DataTable
            data={sellerOrders.items}
            getRowKey={(item) => item.id}
            title="Recent seller orders"
            description="Recent order traffic related to this seller."
            tone="fulfillment"
            actions={
              <Link href={`/orders?sellerId=${seller.id}`} className="btn-ghost px-4 text-xs">
                View all seller orders
              </Link>
            }
            density="compact"
            secondaryContent={(item) => (
              <div className="table-secondary-row grid gap-2 text-sm text-secondary md:grid-cols-3">
                <span>{item.buyerName}</span>
                <span>{item.orderType || 'Unknown type'}</span>
                <span>{item.paymentStatus || 'Payment unknown'}</span>
              </div>
            )}
            columns={[
              {
                key: 'order',
                header: 'Order',
                className: 'min-w-[160px]',
                priority: 'primary',
                render: (item) => (
                  <div>
                    <div className="font-semibold text-primary">{item.orderId}</div>
                    <div className="mt-1 text-xs text-secondary">{item.buyerName}</div>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                className: 'min-w-[120px]',
                priority: 'secondary',
                render: (item) => <StatusBadge status={item.status} />,
              },
              {
                key: 'amount',
                header: 'Amount',
                className: 'min-w-[120px]',
                priority: 'secondary',
                render: (item) => <span className="text-sm text-primary">{formatCurrency(item.total)}</span>,
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
            ]}
          />
        </div>

        <aside className="space-y-5">
          <section className="card-shell card-padding">
            <div className="label-meta">Seller controls</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">Actions</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Approve, reject, suspend, or reactivate the seller directly from this record.
            </p>
            <SellerStatusActions seller={seller} />
          </section>

          <section className="card-shell card-padding">
            <div className="label-meta">Review notes</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">Recorded messages</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="table-secondary-row">
                <div className="label-meta">Approval message</div>
                <div className="mt-2 text-primary">{seller.approvalMessage || 'None recorded'}</div>
              </div>
              <div className="table-secondary-row">
                <div className="label-meta">Rejection message</div>
                <div className="mt-2 text-primary">{seller.rejectionMessage || 'None recorded'}</div>
              </div>
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="label-meta">Settlement snapshot</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">Commercial status</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="table-secondary-row">
                <div className="label-meta">Pending payout amount</div>
                <div className="mt-2 text-primary">{formatCurrency(settlementPending)}</div>
              </div>
              <div className="table-secondary-row">
                <div className="label-meta">Payout records</div>
                <div className="mt-2 text-primary">{sellerSettlement.payouts.pagination.total}</div>
              </div>
            </div>
            <Link href={`/settlements?sellerId=${seller.id}`} className="btn-ghost mt-4 w-full">
              View seller settlements
            </Link>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default SellerDetailPage;
