import { redirect } from 'next/navigation';

import { Role } from '@zatch/shared';

import { PageHeader } from '../../../components/PageHeader';
import { AdminUsersTable } from '../../../features/admin-users/AdminUsersTable';
import { fetchAdminUsers, getCurrentSession } from '../../../lib/admin-data';

const AdminUsersPage = async () => {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== Role.SUPER_ADMIN) {
    redirect('/dashboard');
  }

  const users = await fetchAdminUsers();

  return (
    <section>
      <PageHeader
        eyebrow="Administration"
        title="Admin Users"
        description="Manage operational access, assign roles, and deactivate accounts when needed."
      />
      <AdminUsersTable initialUsers={users} />
    </section>
  );
};

export default AdminUsersPage;
