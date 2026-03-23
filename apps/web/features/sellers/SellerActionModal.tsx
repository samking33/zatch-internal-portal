'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import type { ISeller } from '@zatch/shared';

import { ConfirmModal } from '../../components/ConfirmModal';
import { apiClient } from '../../lib/api-client';
import { useSession } from '../../lib/hooks/useSession';

type SellerActionModalProps = {
  seller: ISeller | null;
  action: 'approve' | 'reject' | null;
  onClose: () => void;
  onSuccess: (seller: ISeller) => void;
};

export const SellerActionModal = ({
  seller,
  action,
  onClose,
  onSuccess,
}: SellerActionModalProps) => {
  const router = useRouter();
  const { notify } = useSession();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!seller || !action) {
      setNote('');
      setError(null);
    }
  }, [seller, action]);

  if (!seller || !action) {
    return null;
  }

  const isReject = action === 'reject';

  const handleConfirm = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await apiClient<ISeller>(`/api/sellers/${seller._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            action,
            ...(note.trim() ? { note: note.trim() } : {}),
          }),
        });

        onSuccess(response.data);
        notify({
          type: 'success',
          title: isReject ? 'Seller rejected' : 'Seller approved',
          description: `${seller.sellerName} was ${isReject ? 'rejected' : 'approved'} successfully.`,
        });
        setNote('');
        onClose();
        router.refresh();
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Action failed';
        setError(message);
        notify({
          type: 'error',
          title: 'Action failed',
          description: message,
        });
      }
    });
  };

  return (
    <ConfirmModal
      open
      tone={isReject ? 'reject' : 'approve'}
      title={isReject ? `Reject ${seller.sellerName}?` : `Approve ${seller.sellerName}?`}
      description={
        isReject
          ? 'This will reject the seller. Add a review note if you need the reason captured in the audit trail.'
          : 'This will approve the seller and remove the application from the pending review queue.'
      }
      confirmLabel={isReject ? 'Reject Seller' : 'Approve Seller'}
      onConfirm={handleConfirm}
      onCancel={onClose}
      loading={isPending}
    >
      {isReject ? (
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Rejection note
          </label>
          <textarea
            rows={4}
            placeholder="Describe what is missing or incorrect"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="textarea-base"
          />
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </ConfirmModal>
  );
};
