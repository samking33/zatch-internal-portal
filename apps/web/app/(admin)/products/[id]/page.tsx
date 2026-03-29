import Link from 'next/link';

import { MetricStrip } from '../../../../components/MetricStrip';
import { PageHeader } from '../../../../components/PageHeader';
import { StatusBadge } from '../../../../components/StatusBadge';
import { ProductStatusActions } from '../../../../features/products/ProductStatusActions';
import { fetchProductDetail } from '../../../../lib/admin-data';
import { formatCurrency } from '../../../../lib/admin-api';
import { formatFullDateTime } from '../../../../lib/format';

const ProductDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const product = await fetchProductDetail(id);

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Product Detail"
        title={product.name}
        description="Inspect the product payload, seller context, and asset set before changing listing status."
        badge={<StatusBadge status={product.status} />}
        tone="catalog"
        legend={
          <>
            <span className="filter-chip-active">Catalog governance record</span>
            <span className="filter-chip">{product.images.length} product assets attached</span>
          </>
        }
        actions={
          <Link href="/products" className="btn-ghost px-4">
            Back to products
          </Link>
        }
        insight={
          <div className="action-band w-full min-w-[280px]">
            <div className="chart-meta tone-operations">Listing health</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                  {product.totalStock}
                </div>
                <div className="mt-2 text-sm text-secondary">
                  units are currently tracked for this listing
                </div>
              </div>
              <span className="command-badge">{formatCurrency(product.price)}</span>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          {
            label: 'Price',
            value: formatCurrency(product.price),
            helper: product.discountedPrice ? `Discounted ${formatCurrency(product.discountedPrice)}` : 'No discount',
            tone: 'brand',
          },
          {
            label: 'Inventory',
            value: product.totalStock,
            helper: 'Units currently tracked',
            tone: 'neutral',
          },
          {
            label: 'Views',
            value: product.viewCount,
            helper: `Likes ${product.likeCount} • Saves ${product.saveCount}`,
            tone: 'positive',
          },
          {
            label: 'Seller',
            value: product.sellerName || 'Unknown seller',
            helper: [product.category, product.subCategory].filter(Boolean).join(' • ') || 'No category',
            tone: 'warning',
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="card-shell card-padding">
            <div className="label-meta">Product overview</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Listing summary
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="label-meta">Seller</div>
                <div className="mt-2 text-sm text-primary">{product.sellerName || 'Unknown seller'}</div>
              </div>
              <div>
                <div className="label-meta">Category</div>
                <div className="mt-2 text-sm text-primary">
                  {[product.category, product.subCategory].filter(Boolean).join(' • ') || 'Uncategorised'}
                </div>
              </div>
              <div>
                <div className="label-meta">Updated</div>
                <div className="mt-2 text-sm text-primary">
                  {product.updatedAt ? formatFullDateTime(product.updatedAt) : 'Unknown'}
                </div>
              </div>
              <div>
                <div className="label-meta">Created</div>
                <div className="mt-2 text-sm text-primary">
                  {product.createdAt ? formatFullDateTime(product.createdAt) : 'Unknown'}
                </div>
              </div>
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="label-meta">Description</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Product narrative
            </h2>
            <p className="mt-4 text-sm leading-7 text-secondary">
              {product.description || 'No product description was returned by the detail endpoint.'}
            </p>
          </section>

          <section className="card-shell card-padding">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="label-meta">Assets</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                  Product imagery
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Images and media metadata currently attached to the product.
                </p>
              </div>
              <span className="command-badge">{product.images.length} assets</span>
            </div>

            {product.images.length === 0 ? (
              <div className="table-secondary-row mt-5 text-sm text-secondary">
                No images were returned by the product detail endpoint.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {product.images.map((image, index) => (
                  <article
                    key={`${image.publicId}-${index}`}
                    className="overflow-hidden rounded-card border border-border bg-[rgba(15,23,42,0.03)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={product.name} className="h-48 w-full object-cover" />
                    <div className="border-t border-border p-3 text-xs text-secondary break-all">
                      {image.publicId || image.url}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card-shell card-padding">
            <div className="label-meta">Listing controls</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Product actions
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Activate or deactivate the listing with a traceable note.
            </p>
            <div className="mt-4">
              <ProductStatusActions product={product} />
            </div>
          </section>

          <section className="card-shell card-padding">
            <div className="label-meta">System snapshot</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Performance signals
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="table-secondary-row">
                <div className="label-meta">Likes</div>
                <div className="mt-2 text-primary">{product.likeCount}</div>
              </div>
              <div className="table-secondary-row">
                <div className="label-meta">Views</div>
                <div className="mt-2 text-primary">{product.viewCount}</div>
              </div>
              <div className="table-secondary-row">
                <div className="label-meta">Saved</div>
                <div className="mt-2 text-primary">{product.saveCount}</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default ProductDetailPage;
