import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { canAccessPortal } from '../../lib/admin-api';
import { getServerSession } from '../../lib/server-fetch';
import { AdminShell } from './AdminShell';
import { SessionProvider } from './SessionProvider';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (!canAccessPortal(session.user)) {
    redirect('/login');
  }

  return (
    <SessionProvider initialUser={session.user}>
      <AdminShell>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AdminShell>
    </SessionProvider>
  );
};

export default AdminLayout;
