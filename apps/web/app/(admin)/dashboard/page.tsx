import { Suspense } from 'react';

import { PageHeader } from '../../../components/PageHeader';
import { TableSkeleton } from '../../../components/TableSkeleton';
import { DashboardOverview } from '../../../features/dashboard/DashboardOverview';
import { fetchAllSellers, fetchRecentAuditLogs, fetchSellerStatsByState } from '../../../lib/admin-data';

const DashboardContent = async () => {
  const [sellers, recentLogs, stateStats] = await Promise.all([
    fetchAllSellers(),
    fetchRecentAuditLogs(10),
    fetchSellerStatsByState(),
  ]);

  return <DashboardOverview sellers={sellers} recentLogs={recentLogs} stateStats={stateStats} />;
};

const DashboardPage = () => (
  <section>
    <PageHeader
      eyebrow="Overview"
      title="Dashboard"
      description="Operational snapshot of seller onboarding volume, queue health, and the most recent review activity."
    />
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card-shell p-5">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="mt-4 skeleton h-10 w-24 rounded" />
                <div className="mt-4 skeleton h-3 w-28 rounded" />
              </div>
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="table-card">
              <TableSkeleton columns={4} rows={6} />
            </div>
            <div className="card-shell p-5">
              <div className="skeleton h-[320px] rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  </section>
);

export default DashboardPage;
