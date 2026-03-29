'use client';

import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

const getPageRange = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
};

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-secondary">
        <span className="font-medium">
          Showing {Math.min(totalItems, pageSize)} of {totalItems} results
        </span>
      </div>
    );
  }

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const items = getPageRange(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium">
        Showing {start}-{end} of {totalItems} results
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-ghost gap-1 px-3"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <div className="flex items-center gap-1">
          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-secondary">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={
                  item === page
                    ? 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(37,99,235,0.22)]'
                    : 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-border bg-white/88 px-3 text-sm font-semibold text-primary hover:bg-white'
                }
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className="btn-ghost gap-1 px-3"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
