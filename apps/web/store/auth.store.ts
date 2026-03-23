'use client';

import { create } from 'zustand';

type AuthState = {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  clearAccessToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearAccessToken: () => {
    set({ accessToken: null });
  },
}));

export const authStore = {
  getAccessToken: (): string | null => useAuthStore.getState().accessToken,
  setAccessToken: (accessToken: string | null): void => {
    useAuthStore.getState().setAccessToken(accessToken);
  },
  clearAccessToken: (): void => {
    useAuthStore.getState().clearAccessToken();
  },
};
