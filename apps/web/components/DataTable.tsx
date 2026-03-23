import type { ReactNode } from 'react';

type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  emptyState?: ReactNode;
  footer?: ReactNode;
  onRowClick?: (item: T) => void;
};

export const DataTable = <T,>({
  columns,
  data,
  getRowKey,
  title,
  description,
  actions,
  emptyState,
  footer,
  onRowClick,
}: DataTableProps<T>) => (
  <div className="table-card">
    {title || description || actions ? (
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title ? <div className="text-sm font-semibold text-primary">{title}</div> : null}
          {description ? <div className="mt-1 text-sm text-secondary">{description}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    ) : null}

    {data.length === 0 ? (
      emptyState ?? null
    ) : (
      <>
        <div className="table-wrap scrollbar-thin">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.08em] text-secondary ${column.className ?? ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={getRowKey(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={`border-b border-border last:border-b-0 ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-5 py-4 align-top ${column.className ?? ''}`}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {footer}
      </>
    )}
  </div>
);
