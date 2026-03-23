import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { getServerSession } from '../../lib/server-fetch';
import { AdminShell } from './AdminShell';
import { SessionProvider } from './SessionProvider';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <SessionProvider initialUser={session.user} initialAccessToken={session.accessToken}>
      <AdminShell>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AdminShell>
    </SessionProvider>
  );
};

export default AdminLayout;
