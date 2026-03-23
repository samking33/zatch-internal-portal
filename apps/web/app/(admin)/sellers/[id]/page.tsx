import type { IAuditLog, ISeller, PaginatedResult } from '@zatch/shared';

import { PageHeader } from '../../../../components/PageHeader';
import { SellerDetail } from '../../../../features/sellers/SellerDetail';
import { serverFetch } from '../../../../lib/server-fetch';

const SellerDetailPage = async ({ params }: { params: { id: string } }) => {
  const [sellerResponse, auditResponse] = await Promise.all([
    serverFetch<ISeller>(`/api/sellers/${params.id}`),
    serverFetch<PaginatedResult<IAuditLog>>(`/api/audit/${params.id}?targetCollection=sellers&limit=5`),
  ]);

  return (
    <section>
      <PageHeader
        eyebrow="Seller Detail"
        title={sellerResponse.data.sellerName}
        description="Inspect the application record, verify supporting documents, and review the status timeline before taking action."
      />
      <SellerDetail seller={sellerResponse.data} auditLogs={auditResponse.data.items} />
    </section>
  );
};

export default SellerDetailPage;
