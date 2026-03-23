'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  type IAuditLog,
  type IManagedSellerDetail,
  type IUpstreamBitSummary,
  type IUpstreamFollowRecord,
  type IUpstreamProductSummary,
} from '@zatch/shared';

import { StatusBadge } from '../../components/StatusBadge';
import { formatFullDateTime, getInitials, truncateMiddle } from '../../lib/format';
import { DocumentsPanel } from './DocumentsPanel';
import { SellerActionModal } from './SellerActionModal';
import { StatusTimeline } from './StatusTimeline';

type SellerDetailProps = {
  seller: IManagedSellerDetail;
  auditLogs: IAuditLog[];
};

const formatCurrency = (value: number | null | undefined): string => {
  const amount = typeof value === 'number' ? value : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const maskAccountNumber = (value: string): string => {
  if (!value) {
    return 'Not available';
  }

  if (value.length <= 4) {
    return value;
  }

  return `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
};

const getAuditCopy = (log: IAuditLog): string => {
  if (log.action === 'seller.approved') {
    return 'Seller approved';
  }

  if (log.action === 'seller.rejected') {
    return 'Seller rejected';
  }

  if (log.action === 'seller.submitted') {
    return 'Seller submitted';
  }

  return log.action;
};

const InfoField = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <div className="label-meta">{label}</div>
    <div className={`mt-1 text-sm text-primary ${mono ? 'font-mono' : ''}`}>{value || 'Not available'}</div>
  </div>
);

const SmallMetric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-card border border-border bg-slate-50 px-4 py-3">
    <div className="text-lg font-semibold text-primary">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-[0.08em] text-muted">{label}</div>
  </div>
);

const PeopleList = ({
  title,
  people,
}: {
  title: string;
  people: IUpstreamFollowRecord[];
}) => (
  <section className="card-shell card-padding">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-secondary">Live social graph details from the upstream profile.</p>
    </div>

    {people.length === 0 ? (
      <div className="rounded-card border border-dashed border-border px-4 py-5 text-sm text-secondary">
        No records available.
      </div>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <div key={`${title}-${person.id}-${person.username}`} className="rounded-card border border-border bg-slate-50 px-4 py-3">
            <div className="font-medium text-primary">{person.username}</div>
            <div className="mt-1 text-sm text-secondary">
              {person.isSeller ? 'Seller account' : 'Buyer account'}
            </div>
            <div className="mt-2 text-xs text-muted">{person.productsCount} products</div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const ProductGrid = ({
  title,
  description,
  products,
}: {
  title: string;
  description: string;
  products: IUpstreamProductSummary[];
}) => (
  <section className="card-shell card-padding">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-secondary">{description}</p>
    </div>

    {products.length === 0 ? (
      <div className="rounded-card border border-dashed border-border px-4 py-5 text-sm text-secondary">
        No products available in this section.
      </div>
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => (
          <article key={`${title}-${product.id}`} className="overflow-hidden rounded-card border border-border bg-white">
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="h-28 w-full shrink-0 overflow-hidden rounded-card bg-slate-100 sm:w-28">
                {product.images[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-primary">{product.name}</h4>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {product.category || 'Uncategorised'}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-secondary">{product.description || 'No description provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                  <span>{formatCurrency(product.discountedPrice ?? product.price)}</span>
                  <span>{product.condition || 'Condition unknown'}</span>
                  <span>{product.likeCount} likes</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);

const BitGrid = ({
  title,
  description,
  bits,
}: {
  title: string;
  description: string;
  bits: IUpstreamBitSummary[];
}) => (
  <section className="card-shell card-padding">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-secondary">{description}</p>
    </div>

    {bits.length === 0 ? (
      <div className="rounded-card border border-dashed border-border px-4 py-5 text-sm text-secondary">
        No bits available in this section.
      </div>
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        {bits.map((bit) => (
          <article key={`${title}-${bit.id}`} className="overflow-hidden rounded-card border border-border bg-white">
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="h-28 w-full shrink-0 overflow-hidden rounded-card bg-slate-100 sm:w-28">
                {bit.thumbnail?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bit.thumbnail.url} alt={bit.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">No thumbnail</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-primary">{bit.title}</div>
                <p className="mt-2 line-clamp-3 text-sm text-secondary">{bit.description || 'No description provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                  <span>{bit.viewCount} views</span>
                  <span>{bit.likeCount} likes</span>
                  <span>{bit.shareCount} shares</span>
                </div>
                {bit.hashtags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bit.hashtags.slice(0, 5).map((tag: string) => (
                      <span key={`${bit.id}-${tag}`} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);

const BargainList = ({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: IManagedSellerDetail['bargainsWithSeller'];
}) => (
  <section className="card-shell card-padding">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        <p className="mt-1 text-sm text-secondary">Negotiation history pulled from the seller account.</p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{count} records</span>
    </div>

    {items.length === 0 ? (
      <div className="rounded-card border border-dashed border-border px-4 py-5 text-sm text-secondary">
        No bargain records available.
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((item: IManagedSellerDetail['bargainsWithSeller'][number]) => (
          <div key={item.id} className="rounded-card border border-border bg-slate-50 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">{item.product.name}</div>
                <div className="mt-1 text-sm text-secondary">{item.statusLabel || item.status}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                  <span>{formatCurrency(item.pricing.currentPrice)}</span>
                  <span>{item.role}</span>
                  <span>{item.quantity} qty</span>
                </div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {item.isExpired ? 'Expired' : 'Open'}
              </div>
            </div>
            {(item.notes.buyer || item.notes.seller) ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="label-meta">Buyer note</div>
                  <div className="mt-1 text-sm text-primary">{item.notes.buyer || 'No note'}</div>
                </div>
                <div>
                  <div className="label-meta">Seller note</div>
                  <div className="mt-1 text-sm text-primary">{item.notes.seller || 'No note'}</div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    )}
  </section>
);

export const SellerDetail = ({ seller, auditLogs }: SellerDetailProps) => {
  const [detail, setDetail] = useState(seller);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);

  const currentSeller = detail.seller;
  const receivedDate = useMemo(() => formatFullDateTime(currentSeller.receivedAt), [currentSeller.receivedAt]);
  const sellerLocation = detail.sellerProfile.address;
  const profileImage = detail.profilePic?.url;

  return (
    <>
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <section className="card-shell card-padding">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-blue-100">
                    {profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profileImage} alt={currentSeller.sellerName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-blue-700">
                        {getInitials(currentSeller.sellerName)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-primary">{currentSeller.sellerName}</h2>
                      <StatusBadge status={currentSeller.status} />
                    </div>
                    <p className="mt-1 text-sm text-secondary">{detail.sellerProfile.businessName || currentSeller.businessName}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{detail.username ? `@${detail.username}` : 'Username unavailable'}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{detail.sellerStatusRaw || currentSeller.status}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{detail.categoryType || 'Category unavailable'}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-card border border-border bg-slate-50 px-4 py-3">
                  <div className="label-meta">Profile Created</div>
                  <div className="mt-1 text-sm text-primary">{receivedDate}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SmallMetric label="Followers" value={detail.followerCount} />
                <SmallMetric label="Following" value={detail.following.length} />
                <SmallMetric label="Products Sold" value={detail.productsSoldCount} />
                <SmallMetric label="Customer Rating" value={detail.customerRating} />
              </div>

              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-4">
                <InfoField label="Phone" value={`${detail.countryCode || ''} ${detail.phone}`.trim() || currentSeller.phone} />
                <InfoField label="Email" value={detail.email || currentSeller.email} />
                <InfoField label="GST / Enrollment ID" value={currentSeller.gstOrEnrollmentId || 'Not provided'} mono />
                <InfoField label="Date of birth" value={detail.dob ? formatFullDateTime(detail.dob) : 'Not available'} />
              </div>
            </section>

            <section className="card-shell card-padding">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-primary">Location & Fulfilment</h3>
                <p className="mt-1 text-sm text-secondary">Address, shipping method, and verification readiness from the seller profile.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField label="Billing Address" value={sellerLocation.billingAddress || 'Not available'} />
                <InfoField label="Pickup Address" value={sellerLocation.pickupAddress || 'Not available'} />
                <InfoField label="State" value={sellerLocation.state || 'Not available'} />
                <InfoField label="Pincode" value={sellerLocation.pinCode || 'Not available'} mono />
                <InfoField label="Shipping Method" value={detail.sellerProfile.shippingMethod || 'Not available'} />
                <InfoField label="Terms Accepted" value={detail.sellerProfile.tcAccepted ? 'Accepted' : 'Pending'} />
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-border">
                {typeof sellerLocation.latitude === 'number' && typeof sellerLocation.longitude === 'number' ? (
                  <iframe
                    title="Seller location"
                    width="100%"
                    height="220"
                    className="block border-0"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${sellerLocation.longitude - 0.05},${sellerLocation.latitude - 0.05},${sellerLocation.longitude + 0.05},${sellerLocation.latitude + 0.05}&layer=mapnik&marker=${sellerLocation.latitude},${sellerLocation.longitude}`}
                  />
                ) : (
                  <div className="px-4 py-6 text-sm text-muted">Map unavailable - coordinates not yet resolved</div>
                )}
              </div>
            </section>

            <section className="card-shell card-padding">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-primary">Bank Details</h3>
                <p className="mt-1 text-sm text-secondary">Settlement details currently stored against the seller account.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField label="Account Holder" value={detail.sellerProfile.bankDetails.accountHolderName || 'Not available'} />
                <InfoField label="Account Number" value={maskAccountNumber(detail.sellerProfile.bankDetails.accountNumber)} mono />
                <InfoField label="Bank Name" value={detail.sellerProfile.bankDetails.bankName || 'Not available'} />
                <InfoField label="IFSC" value={detail.sellerProfile.bankDetails.ifscCode || 'Not available'} mono />
                <InfoField label="UPI ID" value={detail.sellerProfile.bankDetails.upiId || 'Not available'} />
              </div>
            </section>

            <section className="card-shell card-padding">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-primary">Submitted Documents</h3>
                <p className="mt-1 text-sm text-secondary">Documents currently attached to the seller profile in the upstream system.</p>
              </div>
              <DocumentsPanel documents={currentSeller.documents} />
            </section>

            <section className="card-shell card-padding">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-primary">Status Timeline</h3>
                <p className="mt-1 text-sm text-secondary">Portal-visible status milestones derived from the upstream seller record.</p>
              </div>
              <StatusTimeline seller={currentSeller} />
            </section>
          </div>

          <aside className="space-y-5">
            <section className="card-shell card-padding">
              <h3 className="text-sm font-semibold text-primary">Quick Actions</h3>
              <p className="mt-1 text-sm text-secondary">Approve or reject from the detail view without leaving the record.</p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  disabled={currentSeller.status !== 'pending'}
                  className="btn-success w-full disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setSelectedAction('approve')}
                >
                  Approve Seller
                </button>
                <button
                  type="button"
                  disabled={currentSeller.status !== 'pending'}
                  className="btn-danger w-full disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setSelectedAction('reject')}
                >
                  Reject Seller
                </button>
                {currentSeller.status !== 'pending' ? (
                  <div className="rounded-lg border border-border bg-slate-50 px-3 py-3 text-sm text-secondary">
                    Already actioned. This seller is currently marked as {currentSeller.status}.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="card-shell card-padding">
              <h3 className="text-sm font-semibold text-primary">Profile Snapshot</h3>
              <div className="mt-4 space-y-4">
                <InfoField label="Username" value={detail.username ? `@${detail.username}` : 'Not available'} />
                <InfoField label="Gender" value={detail.gender || 'Not available'} />
                <InfoField label="Category Type" value={detail.categoryType || 'Not available'} />
                <InfoField label="Following Seller" value={detail.isFollowing ? 'Yes' : 'No'} />
                <InfoField label="Saved Products" value={`${detail.savedProducts.length}`} />
                <InfoField label="Uploaded Bits" value={`${detail.uploadedBits.length}`} />
              </div>
            </section>

            <section className="card-shell card-padding">
              <h3 className="text-sm font-semibold text-primary">Preferences & Bargain Rules</h3>
              <div className="mt-4 space-y-4">
                <InfoField
                  label="Shopping Categories"
                  value={detail.shoppingPreferences?.categories.join(', ') || 'Not configured'}
                />
                <InfoField
                  label="Auto Bargain"
                  value={detail.globalBargainSettings?.enabled ? 'Enabled' : 'Disabled'}
                />
                <InfoField
                  label="Auto Accept Discount"
                  value={`${detail.globalBargainSettings?.autoAcceptDiscount ?? 0}%`}
                />
                <InfoField
                  label="Maximum Discount"
                  value={`${detail.globalBargainSettings?.maximumDiscount ?? 0}%`}
                />
              </div>
            </section>

            <section className="card-shell card-padding">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-primary">Audit Trail</h3>
                  <p className="mt-1 text-sm text-secondary">Latest actions for this seller.</p>
                </div>
                <Link href="/audit" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  View full audit
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {auditLogs.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-secondary">
                    No audit entries for this seller yet.
                  </div>
                ) : (
                  auditLogs.slice(0, 5).map((log) => (
                    <div key={log._id} className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-primary">{getAuditCopy(log)}</div>
                          <div className="mt-1 text-xs text-secondary">{log.adminUserEmail ?? 'system'}</div>
                        </div>
                        <div className="text-right text-xs text-muted">
                          <div>{formatFullDateTime(log.createdAt)}</div>
                          <div className="mt-1">{truncateMiddle(log.targetId, 8, 4)}</div>
                        </div>
                      </div>
                      {log.note ? <div className="mt-2 text-sm text-secondary">{log.note}</div> : null}
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>

        <ProductGrid
          title="Selling Products"
          description="All currently visible products attached to this seller account."
          products={detail.sellingProducts}
        />

        <ProductGrid
          title="Saved Products"
          description="Products the seller has saved in the main application."
          products={detail.savedProducts}
        />

        <BitGrid
          title="Uploaded Bits"
          description="Short-form content currently published by the seller."
          bits={detail.uploadedBits}
        />

        <BitGrid
          title="Saved Bits"
          description="Short-form content the seller has bookmarked."
          bits={detail.savedBits}
        />

        <BargainList
          title="Bargains With Seller"
          count={detail.bargainsWithSeller.length}
          items={detail.bargainsWithSeller}
        />

        <div className="grid gap-5 xl:grid-cols-2">
          <PeopleList title="Followers" people={detail.followers} />
          <PeopleList title="Following" people={detail.following} />
        </div>
      </div>

      <SellerActionModal
        seller={currentSeller}
        action={selectedAction}
        onClose={() => setSelectedAction(null)}
        onSuccess={(updatedSeller) => {
          const latestNote = updatedSeller.statusHistory[updatedSeller.statusHistory.length - 1]?.note;
          setDetail((current: IManagedSellerDetail) => ({
            ...current,
            seller: updatedSeller,
            sellerStatusRaw: updatedSeller.status,
            sellerProfile: {
              ...current.sellerProfile,
              ...(updatedSeller.status === 'approved' ? {} : {}),
              ...(updatedSeller.status === 'rejected' && latestNote
                ? { rejectionMessage: latestNote }
                : {}),
            },
          }));
          setSelectedAction(null);
        }}
      />
    </>
  );
};
