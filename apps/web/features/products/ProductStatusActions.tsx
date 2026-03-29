'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminProduct } from '../../lib/admin-api';
import { ConfirmModal } from '../../components/ConfirmModal';
import { apiClient } from '../../lib/api-client';
import { useSession } from '../../lib/hooks/useSession';

type ProductStatusActionsProps = {
  product: AdminProduct;
  layout?: 'inline' | 'menu';
};

export const ProductStatusActions = ({ product, layout = 'inline' }: ProductStatusActionsProps) => {
  const router = useRouter();
  const { notify } = useSession();
  const [open, setOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<'active' | 'inactive'>(
    product.status === 'active' ? 'inactive' : 'active',
  );
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const launch = (status: 'active' | 'inactive') => {
    setNextStatus(status);
    setAdminNote('');
    setError(null);
    setOpen(true);
  };

  const handleConfirm = () => {
    setError(null);

    startTransition(async () => {
      try {
        await apiClient(`/api/v1/admin/products/${product.id}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            status: nextStatus,
            ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
          }),
        });

        notify({
          type: 'success',
          title: `Product ${nextStatus === 'active' ? 'activated' : 'deactivated'}`,
          description: `${product.name} was updated successfully.`,
        });
        setOpen(false);
        router.refresh();
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Product update failed';
        setError(message);
        notify({
          type: 'error',
          title: 'Product update failed',
          description: message,
        });
      }
    });
  };

  return (
    <>
      <div className={layout === 'menu' ? 'flex flex-col gap-1' : 'flex flex-wrap gap-2'}>
        <button
          type="button"
          className={
            layout === 'menu'
              ? product.status === 'active'
                ? 'menu-action-danger'
                : 'menu-action-success'
              : product.status === 'active'
                ? 'btn-ghost text-xs'
                : 'btn-success text-xs'
          }
          onClick={() => launch(product.status === 'active' ? 'inactive' : 'active')}
        >
          {product.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      <ConfirmModal
        open={open}
        title={`${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${product.name}?`}
        description={
          nextStatus === 'active'
            ? 'This will make the product available again in the admin system.'
            : 'This will deactivate the product. Add an optional admin note for traceability.'
        }
        confirmLabel={nextStatus === 'active' ? 'Activate Product' : 'Deactivate Product'}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        loading={isPending}
        tone={nextStatus === 'active' ? 'approve' : 'reject'}
      >
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Admin note
          </label>
          <textarea
            rows={4}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder={nextStatus === 'active' ? 'Re-approved for listing' : 'Violates policy'}
            className="textarea-base w-full"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </ConfirmModal>
    </>
  );
};
