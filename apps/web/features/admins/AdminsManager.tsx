'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { canManageAdmins, formatAdminRole, type AdminAccount } from '../../lib/admin-api';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { PlusIcon } from '../../components/Icons';
import { formatFullDateTime } from '../../lib/format';
import { apiClient } from '../../lib/api-client';
import { useSession } from '../../lib/hooks/useSession';

type AdminsManagerProps = {
  admins: AdminAccount[];
};

type CreateForm = {
  username: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
};

const emptyForm: CreateForm = {
  username: '',
  email: '',
  phone: '',
  countryCode: '+91',
  password: '',
};

const getAdminRowTone = (admin: AdminAccount) => {
  if (admin.role === 'super_admin') return 'system' as const;
  if (!admin.active) return 'neutral' as const;

  return 'success' as const;
};

export const AdminsManager = ({ admins }: AdminsManagerProps) => {
  const router = useRouter();
  const { notify, user } = useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canManage = canManageAdmins(user);
  const isProtectedAccount = (item: AdminAccount) => item.role === 'super_admin';

  const handleCreate = () => {
    if (!canManage) {
      setError('Only super admins can create operational admin accounts');
      return;
    }

    if (!form.username || !form.email || !form.phone || !form.countryCode || !form.password) {
      setError('All admin fields are required');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await apiClient('/api/v1/admin/admins/create', {
          method: 'POST',
          body: JSON.stringify(form),
        });

        notify({
          type: 'success',
          title: 'Admin created',
          description: `${form.username} now has portal access.`,
        });
        setForm(emptyForm);
        setCreateOpen(false);
        router.refresh();
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Admin creation failed';
        setError(message);
        notify({
          type: 'error',
          title: 'Admin creation failed',
          description: message,
        });
      }
    });
  };

  const handleToggle = () => {
    if (!toggleTarget) {
      return;
    }

    if (!canManage) {
      setError('Only super admins can update admin access');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await apiClient(`/api/v1/admin/admins/${toggleTarget.id}/toggle`, {
          method: 'PUT',
          body: JSON.stringify({
            active: !toggleTarget.active,
          }),
        });

        notify({
          type: 'success',
          title: toggleTarget.active ? 'Admin deactivated' : 'Admin activated',
          description: `${toggleTarget.username} was updated successfully.`,
        });
        setToggleTarget(null);
        router.refresh();
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Admin update failed';
        setError(message);
        notify({
          type: 'error',
          title: 'Admin update failed',
          description: message,
        });
      }
    });
  };

  return (
    <>
      <section className="system-card card-shell card-padding">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="chart-meta tone-administration">System access controls</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-primary">
              Protected administration layer
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Super-admin records stay visible but protected. Only operational admin accounts can be provisioned or toggled from this screen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="filter-chip-system">Super-admin accounts are protected</span>
            <span className="filter-chip">Ops access can be activated or revoked</span>
          </div>
        </div>
      </section>

      <DataTable
        data={admins}
        getRowKey={(item) => item.id}
        title="Admin accounts"
        description="Super admins can create operational admins and toggle their access without leaving the portal."
        tone="administration"
        legend={
          <>
            <span className="filter-chip-system">System records highlighted in indigo</span>
            <span className="filter-chip">Inactive ops accounts stay visually quiet</span>
          </>
        }
        resultCount={`${admins.length} total admin records`}
        density="compact"
        stickyLastColumn
        rowTone={getAdminRowTone}
        secondaryContent={(item) => (
          <div className="table-secondary-row grid gap-2 text-sm text-secondary md:grid-cols-3">
            <span>{item.email || 'No email provided'}</span>
            <span>{[item.countryCode, item.phone].filter(Boolean).join(' ') || 'Phone unavailable'}</span>
            <span>{item.isSuperAdmin ? 'Protected super-admin account' : 'Operational admin account'}</span>
          </div>
        )}
        actions={
          canManage ? (
            <button type="button" className="btn-primary gap-2" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Create Ops Admin
            </button>
          ) : null
        }
        emptyState={
          <EmptyState
            title="No admins found"
            description="Create the first operational admin account to grant access to the ops portal."
          />
        }
        columns={[
          {
            key: 'username',
            header: 'Admin',
            className: 'min-w-[220px]',
            priority: 'primary',
            render: (item) => (
              <div>
                <div className="font-medium text-primary">{item.username}</div>
                <div className="mt-1 text-xs text-secondary">
                  {item.isSuperAdmin ? 'Protected account' : 'Operational access'}
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            className: 'min-w-[140px]',
            priority: 'secondary',
            render: (item) => (
              <span className={item.role === 'super_admin' ? 'filter-chip-system' : 'filter-chip'}>
                {formatAdminRole(item.role)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            className: 'min-w-[120px]',
            priority: 'secondary',
            render: (item) => <StatusBadge status={item.active ? 'active' : 'inactive'} />,
          },
          {
            key: 'created',
            header: 'Created',
            className: 'min-w-[180px]',
            priority: 'tertiary',
            render: (item) => (
              <span className="text-sm text-secondary">
                {item.createdAt ? formatFullDateTime(item.createdAt) : 'Unknown'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'min-w-[140px]',
            priority: 'action',
            render: (item) =>
              isProtectedAccount(item) ? (
                <span className="filter-chip-system">
                  Protected
                </span>
              ) : (
                <button
                  type="button"
                  className={item.active ? 'btn-danger text-xs' : 'btn-success text-xs'}
                  onClick={() => setToggleTarget(item)}
                  disabled={!canManage}
                >
                  {item.active ? 'Deactivate' : 'Activate'}
                </button>
              ),
          },
        ]}
      />

      <ConfirmModal
        open={createOpen}
        title="Create Ops Admin"
        description="Provision a new operational admin account using the documented super-admin endpoint."
        confirmLabel="Create Ops Admin"
        onConfirm={handleCreate}
        onCancel={() => setCreateOpen(false)}
        loading={isPending}
      >
        <div className="grid gap-3">
          <input
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="ops_admin_1"
            className="input-base w-full"
          />
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="ops@zatch.shop"
            type="email"
            className="input-base w-full"
          />
          <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
            <input
              value={form.countryCode}
              onChange={(event) =>
                setForm((current) => ({ ...current, countryCode: event.target.value }))
              }
              placeholder="+91"
              className="input-base w-full"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="9876543210"
              className="input-base w-full"
            />
          </div>
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Admin@123"
            type="password"
            className="input-base w-full"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </ConfirmModal>

      <ConfirmModal
        open={toggleTarget !== null}
        title={`${toggleTarget?.active ? 'Deactivate' : 'Activate'} ${toggleTarget?.username ?? 'admin'}?`}
        description={
          toggleTarget?.active
            ? 'This will remove their access to the admin portal.'
            : 'This will restore their access to the admin portal.'
        }
        confirmLabel={toggleTarget?.active ? 'Deactivate Admin' : 'Activate Admin'}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
        loading={isPending}
        tone={toggleTarget?.active ? 'reject' : 'approve'}
      >
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </ConfirmModal>
    </>
  );
};
