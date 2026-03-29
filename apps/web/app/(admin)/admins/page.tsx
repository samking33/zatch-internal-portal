import { redirect } from 'next/navigation';

import { MetricStrip } from '../../../components/MetricStrip';
import { PageHeader } from '../../../components/PageHeader';
import { AdminsManager } from '../../../features/admins/AdminsManager';
import { fetchAdminAccounts, getCurrentSession } from '../../../lib/admin-data';
import { canManageAdmins } from '../../../lib/admin-api';

const AdminsPage = async () => {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  if (!canManageAdmins(session.user)) {
    redirect('/dashboard');
  }

  const admins = await fetchAdminAccounts();
  const activeCount = admins.items.filter((item) => item.active).length;
  const superAdminCount = admins.items.filter((item) => item.role === 'super_admin').length;
  const opsAdminCount = admins.items.filter((item) => item.role === 'operation_admin').length;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Admins"
        description="Keep operational access tight, visible, and clearly separated from protected super-admin accounts."
        tone="administration"
        legend={
          <>
            <span className="filter-chip-system">Protected system access</span>
            <span className="filter-chip">Operational admin provisioning stays inside the shared shell</span>
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Admin accounts',
            value: admins.items.length,
            helper: 'Provisioned through the shared shell',
            tone: 'brand',
          },
          {
            label: 'Active accounts',
            value: activeCount,
            helper: `${admins.items.length - activeCount} inactive`,
            tone: 'positive',
          },
          {
            label: 'Operational admins',
            value: opsAdminCount,
            helper: 'Day-to-day portal operators',
            tone: 'neutral',
          },
          {
            label: 'Super admins',
            value: superAdminCount,
            helper: 'Protected system-level accounts',
            tone: 'warning',
          },
        ]}
      />

      <AdminsManager admins={admins.items} />
    </section>
  );
};

export default AdminsPage;
