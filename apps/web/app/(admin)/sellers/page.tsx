import { Suspense } from 'react';

import { SellerStatus } from '@zatch/shared';

import { PageHeader } from '../../../components/PageHeader';
import { TableSkeleton } from '../../../components/TableSkeleton';
import { SellerTable } from '../../../features/sellers/SellerTable';
import { fetchSellerPage } from '../../../lib/admin-data';

type SellersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SellersContent = async ({ searchParams }: SellersPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};

  const getValue = (key: string): string | undefined => {
    const value = resolvedSearchParams?.[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  };

  const params: Record<string, string> = {};

  const page = getValue('page');
  const limit = getValue('limit');
  const states = getValue('states');
  const city = getValue('city');
  const pincode = getValue('pincode');
  const status = getValue('status');
  const from = getValue('from');
  const to = getValue('to');
  const search = getValue('search');

  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (states) params.states = states;
  if (city) params.city = city;
  if (pincode) params.pincode = pincode;
  if (status) params.status = status;
  if (from) params.from = from;
  if (to) params.to = to;

  const sellers = await fetchSellerPage(params);

  return (
    <SellerTable
      result={sellers}
      initialFilters={{
        search: search ?? '',
        states: states ? states.split(',').filter(Boolean) : [],
        city: city ?? '',
        pincode: pincode ?? '',
        status: status === 'all' ? 'all' : (status as SellerStatus | undefined) ?? SellerStatus.PENDING,
        from: from ?? '',
        to: to ?? '',
      }}
    />
  );
};

const SellersPage = ({ searchParams }: SellersPageProps) => {
  return (
    <section>
      <PageHeader
        eyebrow="Seller Review"
        title="Seller Boarding"
        description="Review and action pending applications while keeping full visibility into already approved and rejected submissions."
        actions={
          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
            Pending queue
          </div>
        }
      />
      <Suspense
        fallback={
          <div className="space-y-5">
            <div className="card-shell card-padding">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="skeleton h-10 rounded-lg" />
                <div className="skeleton h-10 rounded-lg" />
                <div className="skeleton h-10 rounded-lg" />
                <div className="skeleton h-10 rounded-lg" />
              </div>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="skeleton h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
            <div className="table-card">
              <TableSkeleton columns={6} rows={5} />
            </div>
          </div>
        }
      >
        <SellersContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
};

export default SellersPage;
