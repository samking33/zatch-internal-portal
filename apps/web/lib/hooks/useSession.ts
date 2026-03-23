'use client';

import { useContext } from 'react';

import { SessionContext } from '../../app/(admin)/SessionProvider';

export const useSession = () => {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return session;
};
