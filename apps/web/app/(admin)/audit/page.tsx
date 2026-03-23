import { Suspense } from 'react';

import { PageHeader } from '../../../components/PageHeader';
import { TableSkeleton } from '../../../components/TableSkeleton';
import { fetchAllAuditHistory } from '../../../lib/admin-data';
import { AuditTable } from '../AuditTable';

const AuditContent = async () => {
  const logs = await fetchAllAuditHistory();
  return <AuditTable logs={logs} />;
};

const AuditPage = () => (
  <section>
    <PageHeader
      eyebrow="Compliance"
      title="Audit Log"
      description="Complete action history across seller intake, review decisions, and admin account activity."
    />
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="card-shell card-padding">
            <div className="grid gap-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="table-card">
            <TableSkeleton columns={5} rows={6} />
          </div>
        </div>
      }
    >
      <AuditContent />
    </Suspense>
  </section>
);

export default AuditPage;
