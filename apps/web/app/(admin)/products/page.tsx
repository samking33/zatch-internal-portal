import Link from 'next/link';

import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { FilterToolbar } from '../../../components/FilterToolbar';
import { MetricStrip } from '../../../components/MetricStrip';
import { OverflowMenu } from '../../../components/OverflowMenu';
import { PageHeader } from '../../../components/PageHeader';
import { QueryPagination } from '../../../components/QueryPagination';
import { StatusBadge } from '../../../components/StatusBadge';
import { ProductStatusActions } from '../../../features/products/ProductStatusActions';
import { fetchProductPage, fetchProductStats } from '../../../lib/admin-data';
import { formatCurrency } from '../../../lib/admin-api';
import { formatFullDateTime } from '../../../lib/format';

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getProductRowTone = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'active') return 'success' as const;
  if (normalized === 'pending') return 'warning' as const;
  if (normalized === 'inactive') return 'danger' as const;

  return 'neutral' as const;
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const limit = typeof resolvedSearchParams.limit === 'string' ? resolvedSearchParams.limit : '20';
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : '';
  const category =
    typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : '';
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';

  const [products, stats] = await Promise.all([
    fetchProductPage({
      page,
      limit,
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    }),
    fetchProductStats(),
  ]);

  const queryParams: Record<string, string> = {};
  if (status) queryParams.status = status;
  if (category) queryParams.category = category;
  if (search) queryParams.search = search;
  if (limit) queryParams.limit = limit;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Catalog Control"
        title="Products"
        description="Keep the catalog clean and searchable without pushing every product detail into the default scan path."
        tone="catalog"
        legend={
          <>
            <span className="filter-chip-active">Catalog governance</span>
            <span className="filter-chip">Stock and seller context stay visible without cluttering the row</span>
          </>
        }
        actions={
          <Link href="/products?status=active" className="btn-primary px-4">
            View active catalog
          </Link>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta tone-operations">Catalog posture</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {Number(stats.active ?? 0)}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  products are currently active in the live catalog
                </div>
              </div>
              <span className="command-badge">{Number(stats.draft ?? 0)} draft</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Total products',
            value: Number(stats.totalProducts ?? stats.total ?? products.pagination.total),
            helper: `${products.pagination.total} in current result set`,
            tone: 'brand',
          },
          {
            label: 'Active',
            value: Number(stats.active ?? 0),
            helper: 'Live in catalog',
            tone: 'positive',
          },
          {
            label: 'Draft',
            value: Number(stats.draft ?? 0),
            helper: 'Awaiting final review',
            tone: 'neutral',
          },
          {
            label: 'Inactive',
            value: Number(stats.inactive ?? 0),
            helper: 'Removed from active circulation',
            tone: 'warning',
          },
        ]}
      />

      <FilterToolbar
        action="/products"
        tone="catalog"
        resetHref="/products"
        submitLabel="Apply"
        hiddenFields={<input type="hidden" name="limit" value={limit} />}
        resultCount={`${products.pagination.total} matching products`}
        search={
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search product name or SKU"
            className="input-base w-full"
          />
        }
        primaryFilters={
          <select name="status" defaultValue={status} className="select-base min-w-[180px]">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        }
        secondaryFilters={
          <input
            type="text"
            name="category"
            defaultValue={category}
            placeholder="Category slug"
            className="input-base w-full"
          />
        }
        quickFilters={
          <>
            <Link href="/products?status=active" className={status === 'active' ? 'filter-chip-active' : 'filter-chip'}>
              Active
            </Link>
            <Link href="/products?status=pending" className={status === 'pending' ? 'filter-chip-active' : 'filter-chip'}>
              Pending
            </Link>
            <Link href="/products?status=inactive" className={status === 'inactive' ? 'filter-chip-active' : 'filter-chip'}>
              Inactive
            </Link>
            <Link href="/products" className={!status && !category && !search ? 'filter-chip-active' : 'filter-chip'}>
              All catalog
            </Link>
          </>
        }
        activeFilters={
          <>
            {status ? <span className="filter-chip-active">Status: {status}</span> : null}
            {category ? <span className="filter-chip">Category: {category}</span> : null}
            {search ? <span className="filter-chip">Search: {search}</span> : null}
          </>
        }
      />

      <DataTable
        data={products.items}
        getRowKey={(item) => item.id}
        title="Product inventory"
        description={`${products.pagination.total} products returned by the admin product routes.`}
        tone="catalog"
        legend={
          <>
            <span className="filter-chip-active">Live products stay green</span>
            <span className="filter-chip">Pending or inactive rows get stronger separation</span>
          </>
        }
        resultCount={`Page ${products.pagination.page} of ${products.pagination.totalPages}`}
        density="compact"
        stickyLastColumn
        rowTone={(item) => getProductRowTone(item.status)}
        secondaryContent={(item) => (
          <div className="table-secondary-row grid gap-2 text-sm text-secondary md:grid-cols-4">
            <span>{[item.category, item.subCategory].filter(Boolean).join(' • ') || 'No category'}</span>
            <span>Stock {item.totalStock}</span>
            <span>Likes {item.likeCount} • Views {item.viewCount}</span>
            <span>
              {item.discountedPrice ? `Discounted ${formatCurrency(item.discountedPrice)}` : 'No discount'}
            </span>
          </div>
        )}
        emptyState={
          <EmptyState
            title="No products found"
            description="Adjust the status, category, or search filters to find more products."
          />
        }
        footer={
          <QueryPagination
            page={products.pagination.page}
            totalPages={products.pagination.totalPages}
            totalItems={products.pagination.total}
            pageSize={products.pagination.limit}
            params={queryParams}
          />
        }
        columns={[
          {
            key: 'product',
            header: 'Product',
            className: 'min-w-[280px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-semibold text-primary">{item.name}</div>
                <div className="mt-1 text-xs text-secondary">{item.sellerName || 'Unknown seller'}</div>
              </div>
            ),
          },
          {
            key: 'pricing',
            header: 'Price',
            className: 'min-w-[130px]',
            priority: 'secondary',
            render: (item) => <span className="text-sm text-primary">{formatCurrency(item.price)}</span>,
          },
          {
            key: 'status',
            header: 'Status',
            className: 'min-w-[120px]',
            priority: 'secondary',
            render: (item) => <StatusBadge status={item.status} />,
          },
          {
            key: 'updated',
            header: 'Updated',
            className: 'min-w-[180px]',
            priority: 'tertiary',
            render: (item) => (
              <span className="text-sm text-secondary">
                {item.updatedAt ? formatFullDateTime(item.updatedAt) : 'Unknown'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Action',
            className: 'min-w-[170px]',
            priority: 'action',
            render: (item) => (
              <div className="flex items-center justify-end gap-2">
                <Link href={`/products/${item.id}`} className="btn-ghost px-3 text-xs">
                  Inspect
                </Link>
                <OverflowMenu>
                  <Link href={`/products/${item.id}`} className="menu-action">
                    Open product record
                  </Link>
                  <ProductStatusActions product={item} layout="menu" />
                </OverflowMenu>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};

export default ProductsPage;
