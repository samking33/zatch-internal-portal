'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminSeller } from '../../lib/admin-api';
import { ConfirmModal } from '../../components/ConfirmModal';
import { apiClient } from '../../lib/api-client';
import { useSession } from '../../lib/hooks/useSession';

type SellerAction = 'approve' | 'reject' | 'suspend' | 'activate';

type SellerStatusActionsProps = {
  seller: AdminSeller;
  compact?: boolean;
  layout?: 'inline' | 'menu';
};

const getAvailableActions = (seller: AdminSeller): SellerAction[] => {
  const normalizedStatus = seller.sellerStatus.toLowerCase();
  const isActive = seller.active !== false;

  if (normalizedStatus === 'pending') {
    return ['approve', 'reject'];
  }

  if ((normalizedStatus === 'approved' || normalizedStatus === 'active') && isActive) {
    return ['suspend'];
  }

  return ['activate'];
};

export const SellerStatusActions = ({
  seller,
  compact = false,
  layout = 'inline',
}: SellerStatusActionsProps) => {
  const router = useRouter();
  const { notify } = useSession();
  const [selectedAction, setSelectedAction] = useState<SellerAction | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actions = useMemo(() => getAvailableActions(seller), [seller]);

  const closeModal = () => {
    setSelectedAction(null);
    setNote('');
    setError(null);
  };

  const handleAction = () => {
    if (!selectedAction) {
      return;
    }

    if ((selectedAction === 'reject' || selectedAction === 'suspend') && note.trim().length === 0) {
      setError(selectedAction === 'reject' ? 'Rejection message is required' : 'Reason is required');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        if (selectedAction === 'approve' || selectedAction === 'reject') {
          await apiClient(`/api/v1/admin/sellers/${seller.id}/approve`, {
            method: 'PUT',
            body: JSON.stringify(
              selectedAction === 'approve'
                ? {
                    status: 'approved',
                    ...(note.trim() ? { approvalMessage: note.trim() } : {}),
                  }
                : {
                    status: 'rejected',
                    rejectionMessage: note.trim(),
                  },
            ),
          });
        } else {
          await apiClient(`/api/v1/admin/sellers/${seller.id}/toggle`, {
            method: 'PUT',
            body: JSON.stringify(
              selectedAction === 'suspend'
                ? {
                    action: 'suspend',
                    reason: note.trim(),
                  }
                : {
                    action: 'activate',
                  },
            ),
          });
        }

        notify({
          type: 'success',
          title:
            selectedAction === 'approve'
              ? 'Seller approved'
              : selectedAction === 'reject'
                ? 'Seller rejected'
                : selectedAction === 'suspend'
                  ? 'Seller suspended'
                  : 'Seller activated',
          description: `${seller.username} was updated successfully.`,
        });
        closeModal();
        router.refresh();
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Action failed';
        setError(message);
        notify({
          type: 'error',
          title: 'Seller update failed',
          description: message,
        });
      }
    });
  };

  const modalTone =
    selectedAction === 'approve' || selectedAction === 'activate'
      ? 'approve'
      : selectedAction
        ? 'reject'
        : 'default';

  const requiresReason =
    selectedAction === 'reject' || selectedAction === 'suspend' || selectedAction === 'approve';
  const actionClass = (action: SellerAction): string => {
    if (layout === 'menu') {
      if (action === 'approve' || action === 'activate') {
        return 'menu-action-success';
      }

      return 'menu-action-danger';
    }

    return action === 'approve' || action === 'activate'
      ? 'btn-success text-xs'
      : 'btn-danger text-xs';
  };

  return (
    <>
      <div
        className={
          layout === 'menu'
            ? 'flex flex-col gap-1'
            : `flex flex-wrap gap-2 ${compact ? '' : 'pt-2'}`
        }
      >
        {actions.includes('approve') ? (
          <button type="button" className={actionClass('approve')} onClick={() => setSelectedAction('approve')}>
            Approve
          </button>
        ) : null}
        {actions.includes('reject') ? (
          <button type="button" className={actionClass('reject')} onClick={() => setSelectedAction('reject')}>
            Reject
          </button>
        ) : null}
        {actions.includes('suspend') ? (
          <button type="button" className={actionClass('suspend')} onClick={() => setSelectedAction('suspend')}>
            Suspend
          </button>
        ) : null}
        {actions.includes('activate') ? (
          <button type="button" className={actionClass('activate')} onClick={() => setSelectedAction('activate')}>
            Activate
          </button>
        ) : null}
      </div>

      <ConfirmModal
        open={selectedAction !== null}
        title={
          selectedAction
            ? `${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} ${seller.username}?`
            : ''
        }
        description={
          selectedAction === 'approve'
            ? 'Confirm seller approval. You can add an approval message that will be stored with the seller profile.'
            : selectedAction === 'reject'
              ? 'Reject this seller application and record a rejection message for the seller.'
              : selectedAction === 'suspend'
                ? 'Suspend this seller account. Add a reason so the action is traceable.'
                : 'Reactivate this seller account.'
        }
        confirmLabel={
          selectedAction
            ? `${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} Seller`
            : 'Confirm'
        }
        onConfirm={handleAction}
        onCancel={closeModal}
        loading={isPending}
        tone={modalTone}
      >
        {requiresReason ? (
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
              {selectedAction === 'approve'
                ? 'Approval message'
                : selectedAction === 'reject'
                  ? 'Rejection message'
                  : 'Reason'}
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                selectedAction === 'approve'
                  ? 'Welcome aboard!'
                  : selectedAction === 'reject'
                    ? 'Documents incomplete'
                    : 'Fraudulent activity'
              }
              className="textarea-base w-full"
            />
          </div>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </ConfirmModal>
    </>
  );
};
