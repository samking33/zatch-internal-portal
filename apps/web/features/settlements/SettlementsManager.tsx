'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminListResult, AdminPayout } from '../../lib/admin-api';
import { formatCurrency } from '../../lib/admin-api';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { OverflowMenu } from '../../components/OverflowMenu';
import { QueryPagination } from '../../components/QueryPagination';
import { StatusBadge } from '../../components/StatusBadge';
import { apiClient } from '../../lib/api-client';
import { formatFullDateTime } from '../../lib/format';
import { useSession } from '../../lib/hooks/useSession';

type SettlementsManagerProps = {
  result: AdminListResult<AdminPayout>;
  queryParams: Record<string, string>;
};

type ActionState =
  | { type: 'approve'; payout: AdminPayout }
  | { type: 'hold'; payout: AdminPayout }
  | { type: 'release'; payout: AdminPayout }
  | { type: 'bulk-approve'; payouts: AdminPayout[] }
  | null;

const getPayoutRowTone = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'paid') return 'success' as const;
  if (normalized === 'hold' || normalized === 'failed') return 'danger' as const;
  if (normalized === 'pending') return 'warning' as const;
  if (normalized === 'approved' || normalized === 'processing') return 'brand' as const;

  return 'neutral' as const;
};

export const SettlementsManager = ({ result, queryParams }: SettlementsManagerProps) => {
  const router = useRouter();
  const { notify } = useSession();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionState, setActionState] = useState<ActionState>(null);
  const [mode, setMode] = useState('UPI');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPayouts = useMemo(
    () => result.items.filter((item) => selectedIds.includes(item.id)),
    [result.items, selectedIds],
  );

  const resetModal = () => {
    setActionState(null);
    setMode('UPI');
    setNote('');
    setError(null);
  };

  const submit = () => {
    if (!actionState) {
      return;
    }

    if ((actionState.type === 'hold' || actionState.type === 'release') && note.trim().length === 0) {
      setError(actionState.type === 'hold' ? 'Hold reason is required' : 'Release note is required');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        if (actionState.type === 'approve') {
          await apiClient(`/api/v1/admin/settlements/payouts/approve/${actionState.payout.id}`, {
            method: 'POST',
            body: JSON.stringify({
              mode,
              ...(note.trim() ? { note: note.trim() } : {}),
            }),
          });
        } else if (actionState.type === 'hold') {
          await apiClient(`/api/v1/admin/settlements/payouts/hold/${actionState.payout.id}`, {
            method: 'POST',
            body: JSON.stringify({
              reason: note.trim(),
            }),
          });
        } else if (actionState.type === 'release') {
          await apiClient(`/api/v1/admin/settlements/payouts/release/${actionState.payout.id}`, {
            method: 'POST',
            body: JSON.stringify({
              note: note.trim(),
            }),
          });
        } else if (actionState.type === 'bulk-approve') {
          await apiClient('/api/v1/admin/settlements/payouts/bulk-approve', {
            method: 'POST',
            body: JSON.stringify({
              payoutIds: actionState.payouts.map((item) => item.id),
              mode,
            }),
          });
          setSelectedIds([]);
        }

        notify({
          type: 'success',
          title: 'Settlement updated',
          description: 'The payout action completed successfully.',
        });
        resetModal();
        router.refresh();
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : 'Settlement action failed';
        setError(message);
        notify({
          type: 'error',
          title: 'Settlement action failed',
          description: message,
        });
      }
    });
  };

  const actionLabel =
    actionState?.type === 'approve'
      ? 'Approve payout'
      : actionState?.type === 'hold'
        ? 'Hold payout'
        : actionState?.type === 'release'
          ? 'Release payout'
          : actionState?.type === 'bulk-approve'
            ? 'Bulk approve payouts'
            : 'Confirm';

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );
  };

  return (
    <>
      <div className="action-band flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="chart-meta text-[color:var(--metric-positive)]">Bulk settlement controls</div>
          <div className="mt-2 text-sm text-secondary">
            Select payout rows for controlled bulk approval, or act on individual rows from the table edge.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="filter-chip">
            Selected: {selectedPayouts.length}
          </span>
          <span className="filter-chip">
            Visible records: {result.pagination.total}
          </span>
        </div>
      </div>

      <DataTable
        data={result.items}
        getRowKey={(item) => item.id}
        title="Payout queue"
        description="Approve, hold, release, and bulk approve payouts through the settlement routes without overwhelming the default scan path."
        tone="finance"
        legend={
          <>
            <span className="filter-chip-active">Pending approvals surface in amber</span>
            <span className="filter-chip">Paid records settle into green</span>
          </>
        }
        resultCount={`Page ${result.pagination.page} of ${result.pagination.totalPages}`}
        density="compact"
        stickyLastColumn
        rowTone={(item) => getPayoutRowTone(item.status)}
        secondaryContent={(item) => (
          <div className="table-secondary-row grid gap-2 text-sm text-secondary md:grid-cols-4">
            <span>{item.orderRef || item.orderId || 'Order reference unavailable'}</span>
            <span>{item.adminNote || item.holdReason || item.failureReason || 'No note recorded'}</span>
            <span>{item.payoutMode || 'Payout mode not assigned'}</span>
            <span>{item.createdAt ? formatFullDateTime(item.createdAt) : 'Unknown'}</span>
          </div>
        )}
        actions={
          selectedPayouts.length > 0 ? (
            <button
              type="button"
              className="btn-primary px-4 text-xs"
              onClick={() => setActionState({ type: 'bulk-approve', payouts: selectedPayouts })}
            >
              Bulk approve ({selectedPayouts.length})
            </button>
          ) : null
        }
        emptyState={
          <EmptyState
            title="No payouts found"
            description="Try a different settlement filter to view more payout records."
          />
        }
        footer={
          <QueryPagination
            page={result.pagination.page}
            totalPages={result.pagination.totalPages}
            totalItems={result.pagination.total}
            pageSize={result.pagination.limit}
            params={queryParams}
          />
        }
        columns={[
          {
            key: 'select',
            header: '',
            className: 'w-12',
            headerClassName: 'w-12',
            priority: 'primary',
            render: (item) => (
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(event) => toggleSelection(item.id, event.target.checked)}
                aria-label={`Select payout ${item.id}`}
              />
            ),
          },
          {
            key: 'seller',
            header: 'Seller',
            className: 'min-w-[220px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-semibold text-primary">{item.sellerName || 'Seller'}</div>
                <div className="mt-1 text-xs text-secondary">{item.orderRef || item.orderId}</div>
              </div>
            ),
          },
          {
            key: 'amounts',
            header: 'Amounts',
            className: 'min-w-[180px]',
            priority: 'secondary',
            render: (item) => (
              <div className="space-y-1 text-sm">
                <div className="text-primary">Seller {formatCurrency(item.sellerAmount)}</div>
                <div className="text-secondary">Commission {formatCurrency(item.commission)}</div>
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
            key: 'actions',
            header: 'Action',
            className: 'min-w-[190px]',
            priority: 'action',
            render: (item) => (
              <div className="flex items-center justify-end gap-2">
                {item.status === 'hold' ? (
                  <button
                    type="button"
                    className="btn-ghost px-3 text-xs"
                    onClick={() => setActionState({ type: 'release', payout: item })}
                  >
                    Release
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-success px-3 text-xs"
                    onClick={() => setActionState({ type: 'approve', payout: item })}
                  >
                    Approve
                  </button>
                )}
                <OverflowMenu>
                  {item.orderId ? (
                    <Link href={`/orders/${item.orderId}`} className="menu-action">
                      Open order
                    </Link>
                  ) : null}
                  {item.status === 'hold' ? (
                    <button
                      type="button"
                      className="menu-action"
                      onClick={() => setActionState({ type: 'release', payout: item })}
                    >
                      Release payout
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="menu-action-success"
                      onClick={() => setActionState({ type: 'approve', payout: item })}
                    >
                      Approve payout
                    </button>
                  )}
                  <button
                    type="button"
                    className="menu-action-danger"
                    onClick={() => setActionState({ type: 'hold', payout: item })}
                  >
                    Put on hold
                  </button>
                </OverflowMenu>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal
        open={actionState !== null}
        title={actionLabel}
        description={
          actionState?.type === 'approve'
            ? 'Approve this payout and initiate the settlement flow.'
            : actionState?.type === 'hold'
              ? 'Place this payout on hold with a reason.'
              : actionState?.type === 'release'
                ? 'Release this payout back into the approval queue.'
                : 'Approve all selected payouts using the bulk approve route.'
        }
        confirmLabel={actionLabel}
        onConfirm={submit}
        onCancel={resetModal}
        loading={isPending}
        tone={actionState?.type === 'hold' ? 'reject' : 'approve'}
      >
        {actionState?.type === 'approve' || actionState?.type === 'bulk-approve' ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
                Mode
              </span>
              <select value={mode} onChange={(event) => setMode(event.target.value)} className="select-base w-full">
                <option value="UPI">UPI</option>
                <option value="NEFT">NEFT</option>
                <option value="IMPS">IMPS</option>
                <option value="RTGS">RTGS</option>
              </select>
            </label>
            {actionState.type === 'approve' ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Note
                </span>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Approved for settlement"
                  className="textarea-base w-full"
                />
              </label>
            ) : null}
          </div>
        ) : (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
              {actionState?.type === 'hold' ? 'Reason' : 'Note'}
            </span>
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={actionState?.type === 'hold' ? 'Under investigation' : 'Investigation cleared'}
              className="textarea-base w-full"
            />
          </label>
        )}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </ConfirmModal>
    </>
  );
};
