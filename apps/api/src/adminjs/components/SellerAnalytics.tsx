import React, { useEffect, useMemo, useRef } from 'react';

import type { AnalyticsPayload } from '../types';
import {
  ErrorState,
  LoadingState,
  cardStyle,
  pageStyle,
  sectionHeaderStyle,
  sectionSubtitleStyle,
  sectionTitleStyle,
  useChartJs,
  usePageData,
} from './shared';

const AnalyticsCharts = ({ payload }: { payload: AnalyticsPayload }) => {
  const chartConstructor = useChartJs();
  const statesCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const approvalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoursCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartConstructor || !statesCanvasRef.current || !approvalCanvasRef.current || !hoursCanvasRef.current) {
      return;
    }

    const stateContext = statesCanvasRef.current.getContext('2d');
    const approvalContext = approvalCanvasRef.current.getContext('2d');
    const hoursContext = hoursCanvasRef.current.getContext('2d');

    if (!stateContext || !approvalContext || !hoursContext) {
      return;
    }

    const statesChart = new chartConstructor(stateContext, {
      type: 'bar',
      data: {
        labels: payload.topStates.map((item) => item.label),
        datasets: [
          {
            data: payload.topStates.map((item) => item.count),
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
      },
    });

    const approvalChart = new chartConstructor(approvalContext, {
      type: 'line',
      data: {
        labels: payload.approvalRate.map((item) => item.label),
        datasets: [
          {
            label: 'Submitted',
            data: payload.approvalRate.map((item) => item.submitted),
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            tension: 0.35,
          },
          {
            label: 'Approved',
            data: payload.approvalRate.map((item) => item.approved),
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            tension: 0.35,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });

    const hoursChart = new chartConstructor(hoursContext, {
      type: 'bar',
      data: {
        labels: payload.busiestHours.map((item) => item.label),
        datasets: [
          {
            data: payload.busiestHours.map((item) => item.count),
            backgroundColor: '#f59e0b',
            borderRadius: 4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    return () => {
      statesChart.destroy();
      approvalChart.destroy();
      hoursChart.destroy();
    };
  }, [chartConstructor, payload]);

  return (
    <>
      <section style={{ ...cardStyle, padding: 20 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Top states by seller count</h2>
            <p style={sectionSubtitleStyle}>Seller concentration by state from available location metadata.</p>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <canvas ref={statesCanvasRef} />
        </div>
      </section>

      <section style={{ ...cardStyle, padding: 20 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Approval rate over time</h2>
            <p style={sectionSubtitleStyle}>Submitted vs approved sellers across the last 12 months.</p>
          </div>
        </div>
        <div style={{ height: 320 }}>
          <canvas ref={approvalCanvasRef} />
        </div>
      </section>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '320px 1fr' }}>
        <section style={{ ...cardStyle, padding: 20 }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Average time to action</h2>
              <p style={sectionSubtitleStyle}>Time from submission to first approval or rejection.</p>
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#1f2937' }}>
            {payload.averageActionHours === null ? '—' : `${payload.averageActionHours.toFixed(1)}h`}
          </div>
        </section>

        <section style={{ ...cardStyle, padding: 20 }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Rejection reasons</h2>
              <p style={sectionSubtitleStyle}>Most common words extracted from rejection notes.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {payload.rejectionWords.map((item) => (
              <span
                key={item.word}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: '#eef2ff',
                  color: '#4338ca',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {item.word}
                <span style={{ opacity: 0.75 }}>{item.count}</span>
              </span>
            ))}
            {payload.rejectionWords.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: 13 }}>No rejection notes available yet.</div>
            ) : null}
          </div>
        </section>
      </div>

      <section style={{ ...cardStyle, padding: 20 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Busiest submission hours</h2>
            <p style={sectionSubtitleStyle}>What time of day sellers submit most often.</p>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <canvas ref={hoursCanvasRef} />
        </div>
      </section>
    </>
  );
};

const SellerAnalytics = () => {
  const { data, loading, error } = usePageData<AnalyticsPayload>('seller-analytics');

  const statPills = useMemo(
    () =>
      data
        ? [
            { label: 'Total', value: data.stats.total, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Pending', value: data.stats.pending, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Approved', value: data.stats.approved, color: '#10b981', bg: '#d1fae5' },
            { label: 'Rejected', value: data.stats.rejected, color: '#ef4444', bg: '#fee2e2' },
          ]
        : [],
    [data],
  );

  if (loading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Analytics data is unavailable'} />;
  }

  return (
    <div style={pageStyle}>
      <section style={{ ...cardStyle, padding: 24 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1f2937' }}>Seller Analytics</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
              Operational trends across seller account volume, approvals, and review behavior.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {statPills.map((item) => (
            <span
              key={item.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 999,
                background: item.bg,
                color: item.color,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      </section>
      <AnalyticsCharts payload={data} />
    </div>
  );
};

export default SellerAnalytics;
