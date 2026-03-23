'use client';

type ToastItem = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

const toneClasses: Record<ToastItem['type'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export const ToastViewport = ({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) => (
  <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
    {toasts.map((toast) => (
      <button
        key={toast.id}
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={`pointer-events-auto w-full rounded-lg border px-4 py-3 text-left shadow-card ${toneClasses[toast.type]}`}
      >
        <div className="text-sm font-medium">{toast.title}</div>
        {toast.description ? <div className="mt-1 text-xs opacity-80">{toast.description}</div> : null}
      </button>
    ))}
  </div>
);
