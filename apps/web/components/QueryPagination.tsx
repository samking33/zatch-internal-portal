'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Pagination } from './Pagination';

type QueryPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  params?: Record<string, string>;
};

export const QueryPagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  params = {},
}: QueryPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={(nextPage) => {
        const search = new URLSearchParams(params);

        if (nextPage > 1) {
          search.set('page', String(nextPage));
        } else {
          search.delete('page');
        }

        router.push(search.size > 0 ? `${pathname}?${search.toString()}` : pathname);
      }}
    />
  );
};
