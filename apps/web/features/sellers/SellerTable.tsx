'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { type ISeller, type PaginatedResult } from '@zatch/shared';

import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { formatRelativeTime, formatShortDate, getInitials } from '../../lib/format';
import { SellerActionModal } from './SellerActionModal';
import { type SellerFilters, buildSellerSearchParams, SellerFilterBar } from './SellerFilterBar';

type SellerTableProps = {
  result: PaginatedResult<ISeller>;
  initialFilters: SellerFilters;
};

export const SellerTable = ({ result, initialFilters }: SellerTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [rows, setRows] = useState(result.items);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedSeller, setSelectedSeller] = useState<ISeller | null>(null);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    setRows(result.items);
  }, [result.items]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    if (normalizedSearch.length === 0) {
      return rows;
    }

    return rows.filter((seller) =>
      [
        seller.sellerName,
        seller.businessName,
        seller.email,
        seller.gstOrEnrollmentId,
        seller.phone,
      ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [filters.search, rows]);

  return (
    <>
      <SellerFilterBar
        filters={filters}
        totalCount={result.total}
        onFiltersChange={setFilters}
      />

      <DataTable
        data={filteredRows}
        getRowKey={(seller) => seller._id}
        title="Seller applications"
        description="Review pending applications and inspect already actioned cases with full location context."
        emptyState={
          result.total === 0 ? (
            <EmptyState
              title="No pending sellers"
              description="Seller submissions will appear here after they come through the mobile intake flow."
            />
          ) : (
            <EmptyState
              title="No results match these filters"
              description="Adjust the search or location filters to widen the result set."
            />
          )
        }
        footer={
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.limit}
            onPageChange={(page) => {
              const params = buildSellerSearchParams(filters, page);
              router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
            }}
          />
        }
        onRowClick={(seller) => {
          router.push(`/sellers/${seller._id}`);
        }}
        columns={[
          {
            key: 'seller',
            header: 'Seller',
            className: 'min-w-[240px]',
            render: (seller) => (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-primary">
                  {getInitials(seller.sellerName)}
                </div>
                <div>
                  <div className="font-medium text-primary">{seller.sellerName}</div>
                  <div className="mt-1 text-sm text-secondary">{seller.businessName}</div>
                </div>
              </div>
            ),
          },
          {
            key: 'gst',
            header: 'GST / Enrollment ID',
            className: 'min-w-[190px]',
            render: (seller) => (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                {seller.gstOrEnrollmentId}
              </span>
            ),
          },
          {
            key: 'contact',
            header: 'Contact',
            className: 'min-w-[220px]',
            render: (seller) => (
              <div>
                <div className="text-sm text-primary">{seller.phone}</div>
                <div className="mt-1 text-sm text-secondary">{seller.email}</div>
              </div>
            ),
          },
          {
            key: 'location',
            header: 'Location',
            className: 'min-w-[220px]',
            render: (seller) => (
              <div>
                <div className="text-sm font-medium text-primary">
                  {seller.location.city || 'Unknown city'}
                  {seller.location.state ? `, ${seller.location.state}` : ''}
                </div>
                <div className="mt-1 text-xs text-muted">{seller.location.pincode || 'No pincode'}</div>
              </div>
            ),
          },
          {
            key: 'received',
            header: 'Date Received',
            className: 'min-w-[170px]',
            render: (seller) => (
              <div>
                <div className="text-sm font-medium text-primary">{formatShortDate(seller.receivedAt)}</div>
                <div className="mt-1 text-xs text-muted">{formatRelativeTime(seller.receivedAt)}</div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            className: 'min-w-[120px]',
            render: (seller) => <StatusBadge status={seller.status} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'min-w-[180px]',
            render: (seller) => (
              <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                <Link href={`/sellers/${seller._id}`} className="btn-ghost text-xs">
                  View
                </Link>
                <button
                  type="button"
                  className="btn-success text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={seller.status !== 'pending'}
                  onClick={() => {
                    setSelectedSeller(seller);
                    setSelectedAction('approve');
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn-danger text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={seller.status !== 'pending'}
                  onClick={() => {
                    setSelectedSeller(seller);
                    setSelectedAction('reject');
                  }}
                >
                  Reject
                </button>
              </div>
            ),
          },
        ]}
      />

      <SellerActionModal
        seller={selectedSeller}
        action={selectedAction}
        onSuccess={(updatedSeller) => {
          setRows((currentRows) => {
            if (filters.status === 'pending' && updatedSeller.status !== 'pending') {
              return currentRows.filter((row) => row._id !== updatedSeller._id);
            }

            return currentRows.map((row) => (row._id === updatedSeller._id ? updatedSeller : row));
          });
        }}
        onClose={() => {
          setSelectedSeller(null);
          setSelectedAction(null);
        }}
      />
    </>
  );
};
