'use client';

import type { ReactNode } from 'react';

import { CheckCircleIcon, XCircleIcon } from './Icons';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
  loading?: boolean;
  tone?: 'approve' | 'reject' | 'default';
};

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  children,
  loading = false,
  tone = 'default',
}: ConfirmModalProps) => {
  if (!open) {
    return null;
  }

  const toneClasses =
    tone === 'approve'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'reject'
        ? 'bg-red-100 text-red-700'
        : 'bg-blue-100 text-blue-700';
  const confirmClass =
    tone === 'approve' ? 'btn-success' : tone === 'reject' ? 'btn-danger' : 'btn-primary';
  const Icon = tone === 'reject' ? XCircleIcon : CheckCircleIcon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md rounded-card bg-white p-6 shadow-xl"
      >
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${toneClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h2 id="confirm-modal-title" className="text-lg font-medium text-primary">
          {title}
        </h2>
        <p className="mt-2 text-sm text-secondary">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
