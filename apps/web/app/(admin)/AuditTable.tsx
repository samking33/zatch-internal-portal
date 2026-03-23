'use client';

import { useState } from 'react';

import { type IAuditLog } from '@zatch/shared';

import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { CopyIcon } from '../../components/Icons';
import { Pagination } from '../../components/Pagination';
import { formatFullDateTime, formatRelativeTime, truncateMiddle } from '../../lib/format';
import { useSession } from '../../lib/hooks/useSession';

const PAGE_SIZE = 12;

const getActionTone = (action: string): string => {
  if (action.includes('approved')) {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (action.includes('rejected')) {
    return 'bg-red-100 text-red-800';
  }

  if (action.includes('submitted')) {
    return 'bg-blue-100 text-blue-800';
  }

  if (action.includes('login') || action.includes('logout')) {
    return 'bg-slate-100 text-slate-700';
  }

  return 'bg-violet-100 text-violet-800';
};

const matchesDateRange = (value: Date | string, fromDate: string, toDate: string): boolean => {
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

const toActionLabel = (value: string): string =>
  value
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const AuditTable = ({ logs }: { logs: IAuditLog[] }) => {
  const { notify } = useSession();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const actionOptions = [...new Set(logs.map((log) => log.action))].sort();
  const filteredLogs = [...logs]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .filter((log) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (log.adminUserEmail ?? 'system').toLowerCase().includes(normalizedSearch) ||
        log.action.toLowerCase().includes(normalizedSearch);

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesDate = matchesDateRange(log.createdAt, fromDate, toDate);

      return matchesSearch && matchesAction && matchesDate;
    });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedLogs = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCurrentView = () => {
    const rows = filteredLogs.map((log) => ({
      action: log.action,
      targetCollection: log.targetCollection,
      targetId: log.targetId,
      performedBy: log.adminUserEmail ?? 'system',
      ipAddress: log.ipAddress ?? '',
      note: log.note ?? '',
      createdAt: new Date(log.createdAt).toISOString(),
    }));

    const header = Object.keys(rows[0] ?? {
      action: '',
      targetCollection: '',
      targetId: '',
      performedBy: '',
      ipAddress: '',
      note: '',
      createdAt: '',
    });
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        header
          .map((key) => `"${String(row[key as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-log.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="card-shell card-padding">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_170px_170px_auto]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by admin email or action"
            className="input-base"
          />
          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value);
              setPage(1);
            }}
            className="select-base"
          >
            <option value="all">All actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {toActionLabel(action)}
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
            className="input-base"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
            className="input-base"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setSearch('');
                setActionFilter('all');
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
            >
              Clear filters
            </button>
            <button type="button" className="btn-primary" onClick={exportCurrentView}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <DataTable
        data={pagedLogs}
        getRowKey={(log) => log._id}
        title="Audit events"
        description="Newest-first operational history across seller reviews, upstream decisions, and admin sessions."
        emptyState={
          <EmptyState
            title="No audit entries found"
            description="Try clearing filters or broadening the date range to see more history."
          />
        }
        footer={
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
        columns={[
          {
            key: 'action',
            header: 'Action',
            className: 'min-w-[160px]',
            render: (log) => (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getActionTone(log.action)}`}>
                {toActionLabel(log.action)}
              </span>
            ),
          },
          {
            key: 'target',
            header: 'Target',
            className: 'min-w-[220px]',
            render: (log) => (
              <div>
                <div className="text-sm font-medium text-primary">{log.targetCollection}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xs text-secondary">{truncateMiddle(log.targetId, 10, 6)}</span>
                  <button
                    type="button"
                    title="Copy target id"
                    className="btn-icon h-7 w-7"
                    onClick={async (event) => {
                      event.stopPropagation();
                      await navigator.clipboard.writeText(log.targetId);
                      notify({
                        type: 'info',
                        title: 'Copied',
                        description: 'Target ID copied to clipboard.',
                      });
                    }}
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
          },
          {
            key: 'performedBy',
            header: 'Performed By',
            className: 'min-w-[200px]',
            render: (log) => (
              <span className="text-sm text-primary">{log.adminUserEmail ?? 'system'}</span>
            ),
          },
          {
            key: 'ipAddress',
            header: 'IP Address',
            className: 'min-w-[150px]',
            render: (log) => (
              <span className="font-mono text-xs text-secondary">{log.ipAddress ?? 'N/A'}</span>
            ),
          },
          {
            key: 'createdAt',
            header: 'Date & Time',
            className: 'min-w-[190px]',
            render: (log) => (
              <div>
                <div className="text-sm font-medium text-primary">{formatFullDateTime(log.createdAt)}</div>
                <div className="mt-1 text-xs text-muted">{formatRelativeTime(log.createdAt)}</div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
