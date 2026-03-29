'use client';

type ToastItem = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

const toneClasses: Record<ToastItem['type'], string> = {
  success: 'border-emerald-200 bg-white/95 text-emerald-950',
  error: 'border-red-200 bg-white/95 text-red-950',
  info: 'border-blue-200 bg-white/95 text-blue-950',
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
        className={`pointer-events-auto w-full rounded-2xl border px-4 py-3 text-left shadow-card backdrop-blur ${toneClasses[toast.type]}`}
      >
        <div className="text-sm font-medium">{toast.title}</div>
        {toast.description ? <div className="mt-1 text-xs opacity-80">{toast.description}</div> : null}
      </button>
    ))}
  </div>
);
