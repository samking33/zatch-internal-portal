import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { DashboardPayload } from '../types';
import {
  ErrorState,
  LoadingState,
  cardStyle,
  formatDateTime,
  pageStyle,
  sectionHeaderStyle,
  sectionSubtitleStyle,
  sectionTitleStyle,
  timeAgo,
  useChartJs,
  useDashboardData,
} from './shared';
import { SellerMapPanel } from './SellerMap';

const chartWrapStyle: React.CSSProperties = {
  ...cardStyle,
  padding: 20,
  minHeight: 360,
};

const DashboardCharts = ({ payload }: { payload: DashboardPayload }) => {
  const chartConstructor = useChartJs();
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'30d' | '12m'>('30d');

  const submissionsSeries = mode === '30d' ? payload.submissions30Days : payload.submissions12Months;

  useEffect(() => {
    if (!chartConstructor || !barCanvasRef.current || !donutCanvasRef.current) {
      return;
    }

    const barContext = barCanvasRef.current.getContext('2d');
    const donutContext = donutCanvasRef.current.getContext('2d');

    if (!barContext || !donutContext) {
      return;
    }

    const barChart = new chartConstructor(barContext, {
      type: 'bar',
      data: {
        labels: submissionsSeries.map((point) => point.label),
        datasets: [
          {
            label: 'Submissions',
            data: submissionsSeries.map((point) => point.count),
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: '#6b7280', font: { size: 11 } },
            grid: { color: 'rgba(148,163,184,0.16)' },
          },
        },
      },
    });

    const donutChart = new chartConstructor(donutContext, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [
          {
            data: [payload.stats.pending, payload.stats.approved, payload.stats.rejected],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      barChart.destroy();
      donutChart.destroy();
    };
  }, [chartConstructor, mode, payload.stats, submissionsSeries]);

  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1.35fr 1fr' }}>
      <section style={chartWrapStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Submissions chart</h2>
            <p style={sectionSubtitleStyle}>Submission volume over the last 30 days or 12 months.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['30d', '12m'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                style={{
                  borderRadius: 999,
                  border: '1px solid #d1d5db',
                  padding: '7px 12px',
                  background: mode === value ? '#3b82f6' : '#ffffff',
                  color: mode === value ? '#ffffff' : '#374151',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {value === '30d' ? '30 days' : '12 months'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 280 }}>
          <canvas ref={barCanvasRef} />
        </div>
      </section>

      <section style={chartWrapStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Status breakdown</h2>
            <p style={sectionSubtitleStyle}>Current mix of pending, approved, and rejected sellers.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={donutCanvasRef} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ color: '#6b7280', fontSize: 12 }}>Total</div>
              <div style={{ color: '#1f2937', fontSize: 30, fontWeight: 700 }}>{payload.stats.total}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { label: 'Pending', value: payload.stats.pending, color: '#f59e0b' },
              { label: 'Approved', value: payload.stats.approved, color: '#10b981' },
              { label: 'Rejected', value: payload.stats.rejected, color: '#ef4444' },
            ].map((item) => {
              const percentage = payload.stats.total > 0 ? Math.round((item.value / payload.stats.total) * 100) : 0;

              return (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#374151', fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    {item.label}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>
                    {item.value} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

const Dashboard = () => {
  const { data, loading, error } = useDashboardData<DashboardPayload>();

  const stats = useMemo(
    () =>
      data
        ? [
            { label: 'Total Sellers', value: data.stats.total, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Pending', value: data.stats.pending, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Approved', value: data.stats.approved, color: '#10b981', bg: '#d1fae5' },
            { label: 'Rejected', value: data.stats.rejected, color: '#ef4444', bg: '#fee2e2' },
          ]
        : [],
    [data],
  );

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Dashboard data is unavailable'} />;
  }

  return (
    <div style={pageStyle}>
      <section style={{ ...cardStyle, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
              {data.greeting}, {data.adminName}
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>Zatch Super Admin Panel</p>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>{data.dateLabel}</div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              ...cardStyle,
              borderLeft: `4px solid ${stat.color}`,
              padding: 20,
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', right: 16, top: 16, color: stat.color }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 13h4v6H5z" />
                <path d="M10 9h4v10h-4z" />
                <path d="M15 5h4v14h-4z" />
              </svg>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#6b7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <DashboardCharts payload={data} />

      <SellerMapPanel
        payload={{
          stats: data.stats,
          sellers: data.map.sellers,
          noLocation: data.map.noLocation,
        }}
      />

      <section style={{ ...cardStyle, padding: 20 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Recent activity feed</h2>
            <p style={sectionSubtitleStyle}>Last 10 audit entries across intake, review, and session actions.</p>
          </div>
        </div>
        <div>
          {data.recentActivity.map((activity) => {
            const actionColor =
              activity.action === 'seller.approved'
                ? '#10b981'
                : activity.action === 'seller.rejected'
                  ? '#ef4444'
                  : activity.action === 'seller.submitted'
                    ? '#3b82f6'
                    : '#8b5cf6';

            const actionLabel = activity.action.split('.').pop() ?? activity.action;

            return (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor }} />
                <div style={{ fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{activity.sellerName}</span>
                  <span style={{ color: '#6b7280' }}> was {actionLabel.replace('-', ' ')}</span>
                  <span style={{ color: '#9ca3af', marginLeft: 8 }}>by {activity.actor}</span>
                </div>
                <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12 }}>
                  <div>{timeAgo(activity.createdAt)}</div>
                  <div style={{ marginTop: 2 }}>{formatDateTime(activity.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
