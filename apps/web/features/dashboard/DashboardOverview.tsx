'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type MouseEvent } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, getElementAtEvent } from 'react-chartjs-2';

import {
  AuditAction,
  SellerStatus,
  type IAuditLog,
  type ISeller,
  type ISellerStateStats,
} from '@zatch/shared';

import { formatRelativeTime } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type DashboardOverviewProps = {
  sellers: ISeller[];
  recentLogs: IAuditLog[];
  stateStats: ISellerStateStats[];
};

const chartPalette = {
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
};

const getThisWeekCount = (sellers: ISeller[]): number => {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return sellers.filter((seller) => new Date(seller.receivedAt).getTime() >= weekAgo).length;
};

const getPreviousWeekCount = (sellers: ISeller[]): number => {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
  return sellers.filter((seller) => {
    const timestamp = new Date(seller.receivedAt).getTime();
    return timestamp >= twoWeeksAgo && timestamp < weekAgo;
  }).length;
};

const buildDailySeries = (sellers: ISeller[]): ChartData<'bar'> => {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' });
  const buckets = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
      value: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sellers.forEach((seller) => {
    const date = new Date(seller.receivedAt);
    const key = date.toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.value += 1;
    }
  });

  return {
    labels: buckets.map((bucket) => bucket.label),
    datasets: [
      {
        label: 'Submissions',
        data: buckets.map((bucket) => bucket.value),
        backgroundColor: chartPalette.blue,
        borderRadius: 6,
        maxBarThickness: 24,
      },
    ],
  };
};

const buildMonthlySeries = (sellers: ISeller[]): ChartData<'bar'> => {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (11 - index));
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatter.format(date),
      value: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sellers.forEach((seller) => {
    const date = new Date(seller.receivedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.value += 1;
    }
  });

  return {
    labels: buckets.map((bucket) => bucket.label),
    datasets: [
      {
        label: 'Submissions',
        data: buckets.map((bucket) => bucket.value),
        backgroundColor: chartPalette.blue,
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };
};

const getActionTone = (action: string): string => {
  if (action.includes('approved')) {
    return 'bg-emerald-500';
  }

  if (action.includes('rejected')) {
    return 'bg-red-500';
  }

  if (action.includes('submitted')) {
    return 'bg-blue-500';
  }

  return 'bg-slate-400';
};

const getActivityText = (log: IAuditLog): string => {
  if (log.action === AuditAction.SELLER_APPROVED) {
    return `Seller ${log.targetId.slice(-6)} was approved`;
  }

  if (log.action === AuditAction.SELLER_REJECTED) {
    return `Seller ${log.targetId.slice(-6)} was rejected`;
  }

  if (log.action === AuditAction.SELLER_SUBMITTED) {
    return `Seller ${log.targetId.slice(-6)} submitted onboarding`;
  }

  if (log.action === AuditAction.USER_LOGIN) {
    return `${log.adminUserEmail ?? 'Admin'} logged in`;
  }

  if (log.action === AuditAction.USER_LOGOUT) {
    return `${log.adminUserEmail ?? 'Admin'} logged out`;
  }

  return log.action;
};

const barOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#111827',
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.16)',
      },
      border: {
        display: false,
      },
      ticks: {
        precision: 0,
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
  },
};

const donutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#111827',
    },
  },
};

const stackedBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        color: '#6b7280',
      },
    },
    tooltip: {
      backgroundColor: '#111827',
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.16)',
      },
      border: {
        display: false,
      },
      ticks: {
        precision: 0,
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
    y: {
      stacked: true,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: '#374151',
        font: {
          size: 11,
        },
      },
    },
  },
};

export const DashboardOverview = ({ sellers, recentLogs, stateStats }: DashboardOverviewProps) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'30d' | '12m'>('30d');
  const locationChartRef = useRef<ChartJS<'bar'> | null>(null);

  const totalSellers = sellers.length;
  const pendingCount = sellers.filter((seller) => seller.status === SellerStatus.PENDING).length;
  const approvedCount = sellers.filter((seller) => seller.status === SellerStatus.APPROVED).length;
  const rejectedCount = sellers.filter((seller) => seller.status === SellerStatus.REJECTED).length;
  const thisWeekCount = getThisWeekCount(sellers);
  const previousWeekCount = getPreviousWeekCount(sellers);
  const trendDelta = thisWeekCount - previousWeekCount;

  const barData = viewMode === '30d' ? buildDailySeries(sellers) : buildMonthlySeries(sellers);
  const donutData: ChartData<'doughnut'> = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [pendingCount, approvedCount, rejectedCount],
        backgroundColor: [chartPalette.amber, chartPalette.green, chartPalette.red],
        borderWidth: 0,
      },
    ],
  };
  const topStates = stateStats.slice(0, 8);
  const locationBreakdownData: ChartData<'bar'> = {
    labels: topStates.map((item) => item.state),
    datasets: [
      {
        label: 'Approved',
        data: topStates.map((item) => item.approved),
        backgroundColor: chartPalette.green,
        borderRadius: 6,
      },
      {
        label: 'Pending',
        data: topStates.map((item) => item.pending),
        backgroundColor: chartPalette.amber,
        borderRadius: 6,
      },
      {
        label: 'Rejected',
        data: topStates.map((item) => item.rejected),
        backgroundColor: chartPalette.red,
        borderRadius: 6,
      },
    ],
  };

  const statCards = [
    {
      label: 'Total sellers',
      value: totalSellers,
      accent: 'border-l-blue-500',
      tone: 'text-blue-600',
      trend: `${thisWeekCount} this week`,
    },
    {
      label: 'Pending',
      value: pendingCount,
      accent: 'border-l-amber-500',
      tone: 'text-amber-600',
      trend: `${pendingCount} awaiting review`,
    },
    {
      label: 'Approved',
      value: approvedCount,
      accent: 'border-l-emerald-500',
      tone: 'text-emerald-600',
      trend: `${approvedCount} cleared so far`,
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      accent: 'border-l-red-500',
      tone: 'text-red-600',
      trend: `${rejectedCount} returned`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`card-shell border-l-4 ${card.accent} p-5`}>
            <div className="label-meta">{card.label}</div>
            <div className={`mt-3 text-[32px] font-semibold leading-none ${card.tone}`}>{card.value}</div>
            <div className="mt-3 text-sm text-secondary">{card.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
        <section className="card-shell card-padding">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-primary">Seller submissions over time</h2>
              <p className="mt-1 text-sm text-secondary">
                {trendDelta >= 0 ? '+' : ''}
                {trendDelta} compared with the previous week
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('30d')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  viewMode === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'border border-border bg-white text-secondary'
                }`}
              >
                Last 30 days
              </button>
              <button
                type="button"
                onClick={() => setViewMode('12m')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  viewMode === '12m'
                    ? 'bg-blue-600 text-white'
                    : 'border border-border bg-white text-secondary'
                }`}
              >
                Last 12 months
              </button>
            </div>
          </div>
          <div className="mt-5 h-[320px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </section>

        <section className="card-shell card-padding">
          <div className="border-b border-border pb-4">
            <h2 className="text-sm font-semibold text-primary">Status breakdown</h2>
            <p className="mt-1 text-sm text-secondary">Current state across all seller applications.</p>
          </div>
          <div className="mt-5 flex flex-col items-center">
            <div className="relative h-[240px] w-full max-w-[260px]">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="label-meta">Total</div>
                <div className="mt-1 text-3xl font-semibold text-primary">{totalSellers}</div>
              </div>
            </div>
            <div className="mt-5 grid w-full gap-3">
              {[
                { label: 'Pending', value: pendingCount, color: 'bg-amber-500' },
                { label: 'Approved', value: approvedCount, color: 'bg-emerald-500' },
                { label: 'Rejected', value: rejectedCount, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    {item.label}
                  </div>
                  <span className="text-sm font-medium text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="card-shell card-padding">
          <div className="border-b border-border pb-4">
            <h2 className="text-sm font-semibold text-primary">Location insights</h2>
            <p className="mt-1 text-sm text-secondary">Top states by seller count and decision breakdown.</p>
          </div>
          <div className="mt-5 h-[320px]">
            <Bar
              ref={locationChartRef}
              data={locationBreakdownData}
              options={stackedBarOptions}
              onClick={(event: MouseEvent<HTMLCanvasElement>) => {
                const chart = locationChartRef.current;
                if (!chart) {
                  return;
                }

                const elements = getElementAtEvent(chart, event);
                const index = elements[0]?.index;
                if (typeof index !== 'number') {
                  return;
                }

                const state = topStates[index]?.state;
                if (state) {
                  router.push(`/sellers?states=${encodeURIComponent(state)}`);
                }
              }}
            />
          </div>
        </section>

        <section className="table-card">
          <div className="border-b border-border px-5 py-4">
            <div className="text-sm font-semibold text-primary">Location breakdown</div>
            <div className="mt-1 text-sm text-secondary">Click any state to jump into the filtered seller queue.</div>
          </div>
          <div className="table-wrap">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-border">
                  {['State', 'Total', 'Pending', 'Approved', 'Rejected'].map((label) => (
                    <th
                      key={label}
                      className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.08em] text-secondary"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stateStats.map((state) => (
                  <tr
                    key={state.state}
                    className="cursor-pointer border-b border-border last:border-b-0 hover:bg-slate-50"
                    onClick={() => router.push(`/sellers?states=${encodeURIComponent(state.state)}`)}
                  >
                    <td className="px-5 py-4 text-sm font-medium text-primary">{state.state}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{state.total}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{state.pending}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{state.approved}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{state.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card-shell card-padding">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-semibold text-primary">Recent activity</h2>
            <p className="mt-1 text-sm text-secondary">Last 10 audit events across submissions, reviews, and sessions.</p>
          </div>
          <Link href="/audit" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {recentLogs.map((log) => (
            <div key={log._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${getActionTone(log.action)}`} />
                <div>
                  <div className="text-sm font-medium text-primary">{getActivityText(log)}</div>
                  <div className="mt-1 text-sm text-secondary">
                    {log.adminUserEmail ?? 'system'} · {log.targetCollection}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted">{formatRelativeTime(log.createdAt)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
