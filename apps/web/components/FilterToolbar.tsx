import type { ReactNode } from 'react';
import Link from 'next/link';

import { ChevronDownIcon, FilterIcon } from './Icons';

type FilterToolbarProps = {
  action: string;
  tone?: 'default' | 'review' | 'catalog' | 'fulfillment' | 'finance' | 'administration';
  search?: ReactNode;
  primaryFilters?: ReactNode;
  quickFilters?: ReactNode;
  secondaryFilters?: ReactNode;
  activeFilters?: ReactNode;
  resultCount?: ReactNode;
  hiddenFields?: ReactNode;
  submitLabel?: string;
  resetHref: string;
  sticky?: boolean;
};

export const FilterToolbar = ({
  action,
  tone = 'default',
  search,
  primaryFilters,
  quickFilters,
  secondaryFilters,
  activeFilters,
  resultCount,
  hiddenFields,
  submitLabel = 'Apply filters',
  resetHref,
  sticky = true,
}: FilterToolbarProps) => (
  <form
    action={action}
    className={`toolbar-card ${sticky ? 'sticky top-[5.25rem] z-20 backdrop-blur' : ''}`}
  >
    {hiddenFields}
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
            tone === 'review'
              ? 'text-[color:var(--metric-warning)]'
              : tone === 'catalog'
                ? 'text-[var(--tone-operations)]'
                : tone === 'fulfillment'
                  ? 'text-[color:var(--metric-brand)]'
                  : tone === 'finance'
                    ? 'text-[color:var(--metric-positive)]'
                    : tone === 'administration'
                      ? 'tone-administration'
                      : 'text-muted'
          }`}
        >
          <FilterIcon className="h-4 w-4" />
          Filters
        </div>
        {resultCount ? <div className="filter-chip">{resultCount}</div> : null}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {search ? <div className="min-w-0 flex-1">{search}</div> : null}
        {primaryFilters ? <div className="flex flex-col gap-3 sm:flex-row">{primaryFilters}</div> : null}
        <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
          {secondaryFilters ? (
            <details className="menu-disclosure group relative">
              <summary className="btn-ghost gap-2 px-3">
                More filters
                <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="menu-panel left-0 top-[calc(100%+0.5rem)] w-[min(32rem,calc(100vw-2rem))] p-3">
                <div className="grid gap-3 md:grid-cols-2">{secondaryFilters}</div>
              </div>
            </details>
          ) : null}
          <Link href={resetHref} className="btn-ghost px-3">
            Reset
          </Link>
          <button type="submit" className="btn-primary px-4">
            {submitLabel}
          </button>
        </div>
      </div>
      {quickFilters ? <div className="flex flex-wrap items-center gap-2">{quickFilters}</div> : null}
      {activeFilters ? <div className="flex flex-wrap items-center gap-2">{activeFilters}</div> : null}
    </div>
  </form>
);
