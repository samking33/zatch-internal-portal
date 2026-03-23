'use client';

import type { ReactNode } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

import type { IAdminUser } from '@zatch/shared';

import { ToastViewport } from '../../components/ToastViewport';
import { apiClient } from '../../lib/api-client';
import { authStore } from '../../store/auth.store';

type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

type SessionContextValue = {
  user: IAdminUser;
  accessToken: string;
  logout: () => Promise<void>;
  notify: (toast: Omit<Toast, 'id'>) => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  initialUser: IAdminUser;
  initialAccessToken: string;
  children: ReactNode;
};

export const SessionProvider = ({
  initialUser,
  initialAccessToken,
  children,
}: SessionProviderProps) => {
  const [user] = useState(initialUser);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    authStore.setAccessToken(initialAccessToken);
    return () => {
      authStore.clearAccessToken();
    };
  }, [initialAccessToken]);

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      accessToken: initialAccessToken,
      notify: (toast) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current.slice(-2), { ...toast, id }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 4000);
      },
      logout: async () => {
        await apiClient<{ message: string }>('/api/auth/logout', {
          method: 'POST',
        });
        authStore.clearAccessToken();
        document.cookie = 'zatch_portal_session=; Max-Age=0; path=/; SameSite=Strict';
        window.location.href = '/login';
      },
    }),
    [initialAccessToken, user],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </SessionContext.Provider>
  );
};
