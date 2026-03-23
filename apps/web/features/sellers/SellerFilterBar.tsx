'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
  INDIA_STATES,
  SellerStatus,
  type ISellerCityStats,
  type ISellerStateStats,
} from '@zatch/shared';

import { SearchIcon } from '../../components/Icons';
import { apiClient } from '../../lib/api-client';

export type SellerFilters = {
  search: string;
  states: string[];
  city: string;
  pincode: string;
  status: SellerStatus | 'all';
  from: string;
  to: string;
};

type SellerFilterBarProps = {
  filters: SellerFilters;
  totalCount: number;
  onFiltersChange: (filters: SellerFilters) => void;
};

const stateLabel = (states: string[]): string => {
  if (states.length === 0) {
    return 'All States';
  }

  if (states.length === 1) {
    return states[0] ?? 'All States';
  }

  return `${states.length} states selected`;
};

export const buildSellerSearchParams = (
  filters: SellerFilters,
  page = 1,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.states.length > 0) {
    params.set('states', filters.states.join(','));
  }

  if (filters.city.trim()) {
    params.set('city', filters.city.trim());
  }

  if (filters.pincode.trim()) {
    params.set('pincode', filters.pincode.trim());
  }

  if (filters.status !== SellerStatus.PENDING) {
    params.set('status', filters.status);
  }

  if (filters.from) {
    params.set('from', filters.from);
  }

  if (filters.to) {
    params.set('to', filters.to);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return params;
};

const statusTabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Pending', value: SellerStatus.PENDING },
  { label: 'Approved', value: SellerStatus.APPROVED },
  { label: 'Rejected', value: SellerStatus.REJECTED },
];

const formatDateChip = (from: string, to: string): string => {
  if (!from && !to) {
    return '';
  }

  const format = (value: string): string =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));

  if (from && to) {
    return `${format(from)} - ${format(to)}`;
  }

  if (from) {
    return `From ${format(from)}`;
  }

  return `Until ${format(to)}`;
};

export const SellerFilterBar = ({
  filters,
  totalCount,
  onFiltersChange,
}: SellerFilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [draftFilters, setDraftFilters] = useState<SellerFilters>(filters);
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
  const [stateStats, setStateStats] = useState<ISellerStateStats[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<ISellerCityStats[]>([]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    let active = true;

    void apiClient<ISellerStateStats[]>('/api/sellers/stats/by-state')
      .then((response) => {
        if (active) {
          setStateStats(response.data);
        }
      })
      .catch(() => {
        if (active) {
          setStateStats([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (draftFilters.states.length === 0 || draftFilters.city.trim().length === 0) {
      setCitySuggestions([]);
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(() => {
      void apiClient<ISellerCityStats[]>(
        `/api/sellers/stats/by-city?states=${encodeURIComponent(draftFilters.states.join(','))}`,
      )
        .then((response) => {
          if (!active) {
            return;
          }

          const query = draftFilters.city.trim().toLowerCase();
          setCitySuggestions(
            response.data.filter((item) => item.city.toLowerCase().includes(query)).slice(0, 8),
          );
        })
        .catch(() => {
          if (active) {
            setCitySuggestions([]);
          }
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [draftFilters.city, draftFilters.states]);

  const applyFilters = (nextFilters: SellerFilters, page = 1) => {
    onFiltersChange(nextFilters);
    const params = buildSellerSearchParams(nextFilters, page);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  const clearAll = () => {
    const nextFilters: SellerFilters = {
      search: '',
      states: [],
      city: '',
      pincode: '',
      status: SellerStatus.PENDING,
      from: '',
      to: '',
    };

    setDraftFilters(nextFilters);
    setCitySuggestions([]);
    setIsStateMenuOpen(false);
    applyFilters(nextFilters);
  };

  const pincodeError =
    draftFilters.pincode.length > 0 && !/^\d{6}$/.test(draftFilters.pincode)
      ? 'Must be 6 digits'
      : '';

  const stateCounts = useMemo(() => {
    const counts = new Map(stateStats.map((item) => [item.state, item.total]));
    return INDIA_STATES.map((state) => ({
      state,
      total: counts.get(state) ?? 0,
    }));
  }, [stateStats]);

  const activeChips = [
    ...filters.states.map((state) => ({
      key: `state-${state}`,
      label: state,
      onRemove: () => {
        const next = {
          ...filters,
          states: filters.states.filter((value) => value !== state),
        };
        if (next.states.length === 0) {
          next.city = '';
        }
        setDraftFilters(next);
        applyFilters(next);
      },
    })),
    ...(filters.city
      ? [
          {
            key: 'city',
            label: `City: ${filters.city}`,
            onRemove: () => {
              const next = { ...filters, city: '' };
              setDraftFilters(next);
              applyFilters(next);
            },
          },
        ]
      : []),
    ...(filters.pincode
      ? [
          {
            key: 'pincode',
            label: `Pincode: ${filters.pincode}`,
            onRemove: () => {
              const next = { ...filters, pincode: '' };
              setDraftFilters(next);
              applyFilters(next);
            },
          },
        ]
      : []),
    ...(filters.from || filters.to
      ? [
          {
            key: 'date',
            label: formatDateChip(filters.from, filters.to),
            onRemove: () => {
              const next = { ...filters, from: '', to: '' };
              setDraftFilters(next);
              applyFilters(next);
            },
          },
        ]
      : []),
  ];

  return (
    <div className="mb-5 space-y-4 rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_220px_180px_160px_160px_160px]">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={draftFilters.search}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search name, email, or GST"
              className="input-base pl-11"
            />
          </label>

          <div className="relative">
            <button
              type="button"
              className="input-base flex w-full items-center justify-between text-left"
              onClick={() => setIsStateMenuOpen((current) => !current)}
            >
              <span>{stateLabel(draftFilters.states)}</span>
              <span className="text-xs text-muted">▼</span>
            </button>

            {isStateMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-card border border-border bg-white p-3 shadow-card">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    className="font-medium text-blue-600"
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        states: stateCounts.map((item) => item.state),
                      }))
                    }
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="font-medium text-secondary"
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        states: [],
                        city: '',
                      }))
                    }
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                  {stateCounts.map((item) => (
                    <label
                      key={item.state}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={draftFilters.states.includes(item.state)}
                        onChange={(event) =>
                          setDraftFilters((current) => ({
                            ...current,
                            states: event.target.checked
                              ? [...current.states, item.state]
                              : current.states.filter((value) => value !== item.state),
                            city:
                              !event.target.checked && current.states.length === 1
                                ? ''
                                : current.city,
                          }))
                        }
                      />
                      <span className="text-sm text-primary">{item.state}</span>
                      <span className="ml-auto text-xs text-secondary">{item.total}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="btn-primary h-9 px-4 text-sm"
                    onClick={() => {
                      setIsStateMenuOpen(false);
                      applyFilters(draftFilters);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <input
              value={draftFilters.city}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, city: event.target.value }))
              }
              placeholder={
                draftFilters.states.length > 0 ? 'Filter by city' : 'Select a state first'
              }
              disabled={draftFilters.states.length === 0}
              className="input-base w-full disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            {draftFilters.states.length > 0 &&
            draftFilters.city.trim().length > 0 &&
            citySuggestions.length > 0 ? (
              <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-card border border-border bg-white p-2 shadow-card">
                {citySuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.state}-${suggestion.city}`}
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                    onClick={() => {
                      const next = { ...draftFilters, city: suggestion.city };
                      setDraftFilters(next);
                      setCitySuggestions([]);
                    }}
                  >
                    <span className="text-sm text-primary">{suggestion.city}</span>
                    <span className="text-xs text-secondary">{suggestion.total}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <input
              value={draftFilters.pincode}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  pincode: event.target.value.replace(/\D/g, '').slice(0, 6),
                }))
              }
              placeholder="Pincode"
              inputMode="numeric"
              className={`input-base w-full ${pincodeError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
            />
            {pincodeError ? <div className="mt-1 text-xs text-red-600">{pincodeError}</div> : null}
          </div>

          <input
            type="date"
            value={draftFilters.from}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, from: event.target.value }))
            }
            className="input-base w-full"
          />

          <input
            type="date"
            value={draftFilters.to}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, to: event.target.value }))
            }
            className="input-base w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (!pincodeError) {
                applyFilters(draftFilters);
              }
            }}
          >
            Apply filters
          </button>
          <button type="button" className="btn-ghost" onClick={clearAll}>
            Clear all
          </button>
          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
            {totalCount} results
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const active = draftFilters.status === tab.value;

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                const next = { ...draftFilters, status: tab.value };
                setDraftFilters(next);
                applyFilters(next);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-border bg-white text-secondary hover:bg-slate-50 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1 text-xs font-medium text-primary"
              onClick={chip.onRemove}
            >
              <span className="text-muted">×</span>
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
