'use client';

import Link from 'next/link';
import { useState } from 'react';

import { type IAuditLog, type ISeller } from '@zatch/shared';

import { StatusBadge } from '../../components/StatusBadge';
import { formatFullDateTime, getInitials, truncateMiddle } from '../../lib/format';
import { SellerActionModal } from './SellerActionModal';
import { DocumentsPanel } from './DocumentsPanel';
import { StatusTimeline } from './StatusTimeline';

type SellerDetailProps = {
  seller: ISeller;
  auditLogs: IAuditLog[];
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

export const SellerDetail = ({ seller, auditLogs }: SellerDetailProps) => {
  const [currentSeller, setCurrentSeller] = useState(seller);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="card-shell card-padding">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                  {getInitials(currentSeller.sellerName)}
                </div>
                <div>
                  <h2 className="text-xl font-medium text-primary">{currentSeller.sellerName}</h2>
                  <p className="mt-1 text-sm text-secondary">{currentSeller.businessName}</p>
                  <div className="mt-3">
                    <StatusBadge status={currentSeller.status} />
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-600">
                {currentSeller.source.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="label-meta">Phone</div>
                <div className="mt-1 text-sm text-primary">{currentSeller.phone}</div>
              </div>
              <div>
                <div className="label-meta">Email</div>
                <div className="mt-1 break-all text-sm text-primary">{currentSeller.email}</div>
              </div>
              <div>
                <div className="label-meta">GST / Enrollment ID</div>
                <div className="mt-1 font-mono text-sm text-primary">{currentSeller.gstOrEnrollmentId}</div>
              </div>
              <div>
                <div className="label-meta">Received</div>
                <div className="mt-1 text-sm text-primary">{formatFullDateTime(currentSeller.receivedAt)}</div>
              </div>
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-primary">Location</h3>
              <p className="mt-1 text-sm text-secondary">Full address collected from the mobile onboarding flow.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="label-meta">Street</div>
                <div className="mt-1 text-sm text-primary">{currentSeller.location.street || 'Not available'}</div>
              </div>
              <div>
                <div className="label-meta">City</div>
                <div className="mt-1 text-sm text-primary">{currentSeller.location.city || 'Not available'}</div>
              </div>
              <div>
                <div className="label-meta">State</div>
                <div className="mt-1 text-sm text-primary">{currentSeller.location.state || 'Not available'}</div>
              </div>
              <div>
                <div className="label-meta">Pincode</div>
                <div className="mt-1 text-sm text-primary">{currentSeller.location.pincode || 'Not available'}</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-border">
              {typeof currentSeller.location.lat === 'number' && typeof currentSeller.location.lng === 'number' ? (
                <iframe
                  title="Seller location"
                  width="100%"
                  height="200"
                  className="block border-0"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentSeller.location.lng - 0.05},${currentSeller.location.lat - 0.05},${currentSeller.location.lng + 0.05},${currentSeller.location.lat + 0.05}&layer=mapnik&marker=${currentSeller.location.lat},${currentSeller.location.lng}`}
                />
              ) : (
                <div className="px-4 py-6 text-sm text-muted">
                  Map unavailable - coordinates not yet resolved
                </div>
              )}
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-primary">Submitted Documents</h3>
              <p className="mt-1 text-sm text-secondary">Cloudinary-hosted files attached during seller intake.</p>
            </div>
            <DocumentsPanel documents={currentSeller.documents} />
          </section>

          <section className="card-shell card-padding">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-primary">Status Timeline</h3>
              <p className="mt-1 text-sm text-secondary">Every status transition captured in append-only order.</p>
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

      <SellerActionModal
        seller={currentSeller}
        action={selectedAction}
        onClose={() => setSelectedAction(null)}
        onSuccess={(updatedSeller) => {
          setCurrentSeller(updatedSeller);
          setSelectedAction(null);
        }}
      />
    </>
  );
};
