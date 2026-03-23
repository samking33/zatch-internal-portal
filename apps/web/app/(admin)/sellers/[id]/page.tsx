import type { IAuditLog, IManagedSellerDetail, PaginatedResult } from '@zatch/shared';

import { PageHeader } from '../../../../components/PageHeader';
import { SellerDetail } from '../../../../features/sellers/SellerDetail';
import { serverFetch } from '../../../../lib/server-fetch';

const SellerDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [sellerResponse, auditResponse] = await Promise.all([
    serverFetch<IManagedSellerDetail>(`/api/sellers/${id}`),
    serverFetch<PaginatedResult<IAuditLog>>(`/api/audit/${id}?targetCollection=sellers&limit=5`),
  ]);

  return (
    <section>
      <PageHeader
        eyebrow="Seller Detail"
        title={sellerResponse.data.seller.sellerName}
        description="Inspect the application record, verify supporting documents, and review the status timeline before taking action."
      />
      <SellerDetail seller={sellerResponse.data} auditLogs={auditResponse.data.items} />
    </section>
  );
};

export default SellerDetailPage;
