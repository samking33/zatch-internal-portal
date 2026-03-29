import { Fragment, type CSSProperties, type ReactNode } from 'react';

type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  priority?: 'primary' | 'secondary' | 'tertiary' | 'action';
  render: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  title?: string;
  description?: string;
  tone?: 'default' | 'overview' | 'review' | 'catalog' | 'fulfillment' | 'finance' | 'administration';
  legend?: ReactNode;
  resultCount?: ReactNode;
  actions?: ReactNode;
  emptyState?: ReactNode;
  footer?: ReactNode;
  onRowClick?: (item: T) => void;
  density?: 'comfortable' | 'compact';
  stickyLastColumn?: boolean;
  rowTone?: (item: T) => 'brand' | 'warning' | 'success' | 'danger' | 'system' | 'neutral' | null;
  secondaryContent?: (item: T) => ReactNode;
};

const priorityClassMap = {
  primary: '',
  secondary: 'hidden md:table-cell',
  tertiary: 'hidden xl:table-cell',
  action: '',
} as const;

const tableToneClass: Record<
  NonNullable<DataTableProps<unknown>['tone']>,
  { kicker: string; accent: string }
> = {
  default: {
    kicker: 'text-secondary',
    accent: 'bg-[rgba(84,101,127,0.72)]',
  },
  overview: {
    kicker: 'tone-overview',
    accent: 'bg-[var(--tone-overview)]',
  },
  review: {
    kicker: 'text-[color:var(--metric-warning)]',
    accent: 'bg-[rgba(185,121,22,0.92)]',
  },
  catalog: {
    kicker: 'tone-operations',
    accent: 'bg-[var(--tone-operations)]',
  },
  fulfillment: {
    kicker: 'text-[color:var(--metric-brand)]',
    accent: 'bg-[color:var(--metric-brand)]',
  },
  finance: {
    kicker: 'text-[color:var(--metric-positive)]',
    accent: 'bg-[color:var(--metric-positive)]',
  },
  administration: {
    kicker: 'tone-administration',
    accent: 'bg-[var(--tone-administration)]',
  },
};

const rowToneStyles: Record<
  NonNullable<NonNullable<DataTableProps<unknown>['rowTone']> extends (item: unknown) => infer R ? Exclude<R, null> : never>,
  CSSProperties
> = {
  brand: {
    boxShadow: 'inset 3px 0 0 rgba(37, 99, 235, 0.75)',
    background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.06), rgba(255, 255, 255, 0))',
  },
  warning: {
    boxShadow: 'inset 3px 0 0 rgba(185, 121, 22, 0.85)',
    background: 'linear-gradient(90deg, rgba(185, 121, 22, 0.08), rgba(255, 255, 255, 0))',
  },
  success: {
    boxShadow: 'inset 3px 0 0 rgba(15, 138, 102, 0.78)',
    background: 'linear-gradient(90deg, rgba(15, 138, 102, 0.07), rgba(255, 255, 255, 0))',
  },
  danger: {
    boxShadow: 'inset 3px 0 0 rgba(179, 63, 74, 0.8)',
    background: 'linear-gradient(90deg, rgba(179, 63, 74, 0.08), rgba(255, 255, 255, 0))',
  },
  system: {
    boxShadow: 'inset 3px 0 0 rgba(95, 111, 190, 0.72)',
    background: 'linear-gradient(90deg, rgba(95, 111, 190, 0.07), rgba(255, 255, 255, 0))',
  },
  neutral: {
    boxShadow: 'inset 3px 0 0 rgba(84, 101, 127, 0.52)',
  },
};

export const DataTable = <T,>({
  columns,
  data,
  getRowKey,
  title,
  description,
  tone = 'default',
  legend,
  resultCount,
  actions,
  emptyState,
  footer,
  onRowClick,
  density = 'compact',
  stickyLastColumn = false,
  rowTone,
  secondaryContent,
}: DataTableProps<T>) => (
  <div className={`table-card ${tone === 'administration' ? 'system-card' : ''}`}>
    <div className={`h-1 ${tableToneClass[tone].accent}`} />
    {title || description || actions || legend || resultCount ? (
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            {title ? <div className={`table-kicker ${tableToneClass[tone].kicker}`}>{title}</div> : null}
          {description ? <div className="mt-2 text-sm leading-6 text-secondary">{description}</div> : null}
          {legend ? <div className="mt-3 flex flex-wrap items-center gap-2">{legend}</div> : null}
        </div>
        {(resultCount || actions) ? (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {resultCount ? <div className="filter-chip">{resultCount}</div> : null}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
        </div>
      </div>
    ) : null}

    {data.length === 0 ? (
      emptyState ?? null
    ) : (
      <>
        <div className="table-wrap scrollbar-thin">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-[rgba(15,23,42,0.035)] backdrop-blur">
              <tr className="border-b border-border">
                {columns.map((column, columnIndex) => (
                  <th
                    key={column.key}
                    className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary ${
                      column.className ?? ''
                    } ${column.headerClassName ?? ''} ${
                      priorityClassMap[column.priority ?? 'primary']
                    } ${
                      stickyLastColumn && columnIndex === columns.length - 1
                        ? 'sticky right-0 bg-[rgba(245,247,249,0.98)]'
                        : ''
                    } ${
                      column.priority === 'action' ? 'text-right' : ''
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const rowKey = getRowKey(item);
                const toneStyle = rowTone?.(item);

                return (
                  <Fragment key={rowKey}>
                    <tr
                      style={toneStyle ? rowToneStyles[toneStyle] : undefined}
                      onClick={onRowClick ? () => onRowClick(item) : undefined}
                      className={`group border-b border-border/80 transition ${
                        onRowClick ? 'cursor-pointer hover:bg-white/70' : 'hover:bg-white/70'
                      } ${secondaryContent ? 'border-b-0' : 'last:border-b-0'}`}
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={column.key}
                          className={`align-top ${
                            density === 'compact' ? 'px-5 py-3.5' : 'px-5 py-4'
                          } ${column.className ?? ''} ${
                            priorityClassMap[column.priority ?? 'primary']
                          } ${
                            stickyLastColumn && columnIndex === columns.length - 1
                              ? 'sticky right-0 bg-[rgba(252,253,250,0.95)] shadow-[-16px_0_24px_-24px_rgba(15,23,42,0.45)]'
                              : ''
                          } ${
                            column.priority === 'action' ? 'text-right' : ''
                          }`}
                        >
                          {column.render(item)}
                        </td>
                      ))}
                    </tr>
                    {secondaryContent ? (
                      <tr className="border-b border-border/80 last:border-b-0">
                        <td colSpan={columns.length} className="px-5 pb-4 pt-0 sm:px-6">
                          {secondaryContent(item)}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {footer}
      </>
    )}
  </div>
);
