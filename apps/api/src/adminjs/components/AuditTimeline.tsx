import React, { useMemo, useState } from 'react';

import type { AuditTimelinePayload } from '../types';
import {
  ErrorState,
  LoadingState,
  actionColors,
  cardStyle,
  formatDateTime,
  pageStyle,
  sectionHeaderStyle,
  sectionSubtitleStyle,
  sectionTitleStyle,
  usePageData,
} from './shared';

const isInRange = (value: string, fromDate: string, toDate: string): boolean => {
  const timestamp = new Date(value).getTime();

  if (fromDate) {
    const fromTimestamp = new Date(`${fromDate}T00:00:00`).getTime();
    if (timestamp < fromTimestamp) {
      return false;
    }
  }

  if (toDate) {
    const toTimestamp = new Date(`${toDate}T23:59:59`).getTime();
    if (timestamp > toTimestamp) {
      return false;
    }
  }

  return true;
};

const AuditTimeline = () => {
  const { data, loading, error } = usePageData<AuditTimelinePayload>('audit-timeline');
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filteredLogs = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.logs.filter((log) => {
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesAdmin = adminFilter === 'all' || log.actor === adminFilter;
      const matchesDate = isInRange(log.createdAt, fromDate, toDate);

      return matchesAction && matchesAdmin && matchesDate;
    });
  }, [actionFilter, adminFilter, data, fromDate, toDate]);

  const pagedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

  if (loading) {
    return <LoadingState label="Loading audit timeline..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Audit timeline data is unavailable'} />;
  }

  let lastDateLabel = '';

  return (
    <div style={pageStyle}>
      <section style={{ ...cardStyle, padding: 24 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1f2937' }}>Audit Timeline</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
              Visual timeline of audit events across sellers and admin sessions.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value);
              setPage(1);
            }}
            style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}
          >
            <option value="all">All actions</option>
            {data.actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <select
            value={adminFilter}
            onChange={(event) => {
              setAdminFilter(event.target.value);
              setPage(1);
            }}
            style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}
          >
            <option value="all">All admins</option>
            {data.adminOptions.map((admin) => (
              <option key={admin} value={admin}>
                {admin}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
            style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
            style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}
          />
        </div>
      </section>

      <section style={{ ...cardStyle, padding: 24 }}>
        {pagedLogs.map((log) => {
          const dateLabel = new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(log.createdAt));

          const showDate = dateLabel !== lastDateLabel;
          lastDateLabel = dateLabel;

          return (
            <React.Fragment key={log.id}>
              {showDate ? (
                <div style={{ margin: '12px 0 8px', color: '#6b7280', fontWeight: 700, fontSize: 12 }}>
                  {dateLabel}
                </div>
              ) : null}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '18px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'start',
                  padding: '10px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    marginTop: 7,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: actionColors[log.action] ?? '#8b5cf6',
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#1f2937', fontWeight: 600, fontSize: 14 }}>
                    {log.action}
                    <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: 10 }}>{log.sellerName}</span>
                  </div>
                  <div style={{ marginTop: 4, color: '#6b7280', fontSize: 12 }}>
                    {log.actor} · {log.targetCollection} · {log.targetId}
                  </div>
                  {log.note ? <div style={{ marginTop: 6, color: '#374151', fontSize: 13 }}>{log.note}</div> : null}
                </div>
                <div style={{ color: '#9ca3af', fontSize: 12 }}>{formatDateTime(log.createdAt)}</div>
              </div>
            </React.Fragment>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredLogs.length)} of {filteredLogs.length}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              style={{ borderRadius: 8, border: '1px solid #d1d5db', padding: '8px 12px', cursor: 'pointer' }}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              style={{ borderRadius: 8, border: '1px solid #d1d5db', padding: '8px 12px', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuditTimeline;
