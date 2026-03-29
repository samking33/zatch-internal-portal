'use client';

import type { ReactNode } from 'react';
import { createContext, useMemo, useState } from 'react';

import { ToastViewport } from '../../components/ToastViewport';
import type { AdminSessionUser } from '../../lib/admin-api';

type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

type SessionContextValue = {
  user: AdminSessionUser;
  logout: () => Promise<void>;
  notify: (toast: Omit<Toast, 'id'>) => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  initialUser: AdminSessionUser;
  children: ReactNode;
};

export const SessionProvider = ({
  initialUser,
  children,
}: SessionProviderProps) => {
  const [user] = useState(initialUser);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      notify: (toast) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current.slice(-2), { ...toast, id }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 4000);
      },
      logout: async () => {
        await fetch('/api/session/logout', {
          method: 'POST',
          credentials: 'include',
        });
        window.location.href = '/login';
      },
    }),
    [user],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </SessionContext.Provider>
  );
};
