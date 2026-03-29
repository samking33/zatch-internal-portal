'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

type TrendPoint = {
  label: string;
  submitted?: number;
  approved?: number;
  orders?: number;
  revenue?: number;
};

type MixPoint = {
  label: string;
  value: number;
};

type DashboardAnalyticsProps = {
  sellerTrend: TrendPoint[];
  payoutMix: MixPoint[];
  orderTrend: TrendPoint[];
};

const formatCurrencyCompact = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);

const baseLineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      intersect: false,
      mode: 'index',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      padding: 12,
    },
  },
  interaction: {
    intersect: false,
    mode: 'nearest',
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#66758b',
        font: {
          family: 'var(--font-plex-mono)',
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.14)',
      },
      ticks: {
        color: '#66758b',
        font: {
          family: 'var(--font-plex-mono)',
          size: 11,
        },
      },
    },
  },
};

const payoutColor = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes('paid')) return 'rgba(15, 138, 102, 0.9)';
  if (normalized.includes('pending') || normalized.includes('approve')) return 'rgba(185, 121, 22, 0.9)';
  if (normalized.includes('hold')) return 'rgba(179, 63, 74, 0.9)';
  if (normalized.includes('fail')) return 'rgba(127, 29, 29, 0.9)';

  return 'rgba(84, 101, 127, 0.82)';
};

const payoutColorSoft = (label: string) => payoutColor(label).replace('0.9', '0.18').replace('0.82', '0.15');

export const DashboardAnalytics = ({
  sellerTrend,
  payoutMix,
  orderTrend,
}: DashboardAnalyticsProps) => {
  const sellerLabels = sellerTrend.map((point) => point.label);
  const orderLabels = orderTrend.map((point) => point.label);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
      <div className="analytics-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="chart-meta tone-overview">Seller intake / approval trend</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Onboarding velocity
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Recent submission volume compared with records that moved into approved status.
            </p>
          </div>
          <span className="tone-chip tone-overview">
            <span className="tone-chip-dot bg-[var(--tone-overview)]" />
            Recent flow
          </span>
        </div>
        <div className="chart-wrap h-[280px]">
          <Bar
            data={{
              labels: sellerLabels,
              datasets: [
                {
                  label: 'Submitted',
                  data: sellerTrend.map((point) => point.submitted ?? 0),
                  backgroundColor: 'rgba(23, 162, 184, 0.8)',
                  borderColor: 'rgba(23, 162, 184, 1)',
                  borderRadius: 6,
                  maxBarThickness: 24,
                },
                {
                  label: 'Approved',
                  data: sellerTrend.map((point) => point.approved ?? 0),
                  backgroundColor: 'rgba(40, 167, 69, 0.78)',
                  borderColor: 'rgba(40, 167, 69, 1)',
                  borderRadius: 6,
                  maxBarThickness: 24,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(33, 37, 41, 0.92)',
                  titleColor: '#f8f9fa',
                  bodyColor: '#e9ecef',
                  padding: 12,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#6c757d',
                    font: {
                      family: 'var(--font-plex-mono)',
                      size: 11,
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(108, 117, 125, 0.12)',
                  },
                  ticks: {
                    precision: 0,
                    color: '#6c757d',
                    font: {
                      family: 'var(--font-plex-mono)',
                      size: 11,
                    },
                  },
                },
              },
            }}
          />
        </div>
        <div className="insight-band md:grid-cols-2">
          <div className="insight-card">
            <div className="chart-meta">Submitted</div>
            <div className="mt-2 text-lg font-semibold text-primary">
              {sellerTrend.reduce((sum, point) => sum + (point.submitted ?? 0), 0)}
            </div>
            <div className="mt-1 text-sm text-secondary">Recent sellers added to the review pool.</div>
          </div>
          <div className="insight-card">
            <div className="chart-meta">Approved</div>
            <div className="mt-2 text-lg font-semibold text-primary">
              {sellerTrend.reduce((sum, point) => sum + (point.approved ?? 0), 0)}
            </div>
            <div className="mt-1 text-sm text-secondary">Approvals recorded within the same recent window.</div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="analytics-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="chart-meta text-[color:var(--metric-positive)]">Payout status mix</div>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                Settlement mix
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                The current payout distribution across paid, pending, hold, and exception states.
              </p>
            </div>
            <span className="tone-chip text-[color:var(--metric-positive)]">
              <span className="tone-chip-dot bg-[color:var(--metric-positive)]" />
              Finance
            </span>
          </div>
          <div className="chart-wrap h-[280px]">
            <Doughnut
              data={{
                labels: payoutMix.map((point) => point.label),
                datasets: [
                  {
                    data: payoutMix.map((point) => point.value),
                    backgroundColor: payoutMix.map((point) => payoutColorSoft(point.label)),
                    borderColor: payoutMix.map((point) => payoutColor(point.label)),
                    borderWidth: 1.5,
                    hoverOffset: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    padding: 12,
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 grid gap-2">
            {payoutMix.map((point) => (
              <div key={point.label} className="flex items-center justify-between rounded-2xl border border-border px-3 py-2 text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: payoutColor(point.label) }}
                  />
                  {point.label}
                </div>
                <span className="font-semibold text-primary">{point.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="chart-meta text-[color:var(--metric-brand)]">Order volume / revenue trend</div>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
                Commerce momentum
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Track order throughput and booked revenue across the recent operating window.
              </p>
            </div>
            <span className="tone-chip text-[color:var(--metric-brand)]">
              <span className="tone-chip-dot bg-[color:var(--metric-brand)]" />
              Throughput
            </span>
          </div>
          <div className="chart-wrap h-[280px]">
            <Line
              data={{
                labels: orderLabels,
                datasets: [
                  {
                    label: 'Orders',
                    data: orderTrend.map((point) => point.orders ?? 0),
                    borderColor: 'rgba(37, 99, 235, 0.92)',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 2.2,
                    yAxisID: 'y',
                  },
                  {
                    label: 'Revenue',
                    data: orderTrend.map((point) => point.revenue ?? 0),
                    borderColor: 'rgba(15, 138, 102, 0.92)',
                    backgroundColor: 'rgba(15, 138, 102, 0.1)',
                    borderWidth: 2.2,
                    tension: 0.32,
                    pointRadius: 3,
                    yAxisID: 'y1',
                  },
                ],
              }}
              options={{
                ...baseLineOptions,
                scales: {
                  x: baseLineOptions.scales?.x,
                  y: {
                    ...(baseLineOptions.scales?.y ?? {}),
                    position: 'left',
                  },
                  y1: {
                    position: 'right',
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      color: '#66758b',
                      callback: (value) => formatCurrencyCompact(Number(value)),
                      font: {
                        family: 'var(--font-plex-mono)',
                        size: 11,
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="insight-band md:grid-cols-2">
            <div className="insight-card">
              <div className="chart-meta">Orders</div>
              <div className="mt-2 text-lg font-semibold text-primary">
                {orderTrend.reduce((sum, point) => sum + (point.orders ?? 0), 0)}
              </div>
              <div className="mt-1 text-sm text-secondary">Orders represented in the recent chart window.</div>
            </div>
            <div className="insight-card">
              <div className="chart-meta">Revenue</div>
              <div className="mt-2 text-lg font-semibold text-primary">
                {formatCurrencyCompact(orderTrend.reduce((sum, point) => sum + (point.revenue ?? 0), 0))}
              </div>
              <div className="mt-1 text-sm text-secondary">Revenue captured from the same recent order set.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
