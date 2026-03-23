'use client';

import type { ReactNode } from 'react';
import { useState, useTransition } from 'react';

import { Role, type IAdminUser } from '@zatch/shared';

import { ConfirmModal } from '../../components/ConfirmModal';
import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { apiClient } from '../../lib/api-client';
import { formatRelativeTime } from '../../lib/format';
import { useSession } from '../../lib/hooks/useSession';

type AdminUsersTableProps = {
  initialUsers: IAdminUser[];
};

type CreateFormState = {
  name: string;
  email: string;
  password: string;
  role: Role.OPS_ADMIN | Role.VIEWER;
};

type EditFormState = {
  role: Role.OPS_ADMIN | Role.VIEWER;
};

const PAGE_SIZE = 10;

const roleBadgeStyles: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'bg-violet-100 text-violet-800',
  [Role.OPS_ADMIN]: 'bg-blue-100 text-blue-800',
  [Role.VIEWER]: 'bg-slate-100 text-slate-700',
};

const roleLabel: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.OPS_ADMIN]: 'Ops Admin',
  [Role.VIEWER]: 'Viewer',
};

const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const emptyCreateForm = (): CreateFormState => ({
  name: '',
  email: '',
  password: '',
  role: Role.OPS_ADMIN,
});

const FormModal = ({
  title,
  description,
  open,
  children,
  onClose,
}: {
  title: string;
  description: string;
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-primary">{title}</h2>
            <p className="mt-2 text-sm text-secondary">{description}</p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <span className="text-lg leading-none text-slate-500">×</span>
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export const AdminUsersTable = ({ initialUsers }: AdminUsersTableProps) => {
  const { notify } = useSession();
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm());
  const [editForm, setEditForm] = useState<EditFormState>({ role: Role.OPS_ADMIN });
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormState, string>>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<IAdminUser | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const validateCreateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof CreateFormState, string>> = {};

    if (!createForm.name.trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!isEmail(createForm.email)) {
      nextErrors.email = 'A valid email is required';
    }

    if (createForm.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    setCreateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateCreateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await apiClient<IAdminUser>('/api/admin-users', {
          method: 'POST',
          body: JSON.stringify(createForm),
        });

        setUsers((current) =>
          [response.data, ...current].sort(
            (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          ),
        );
        setCreateForm(emptyCreateForm());
        setCreateErrors({});
        setCreateOpen(false);
        notify({
          type: 'success',
          title: 'Admin user created',
          description: `${response.data.email} is ready to sign in.`,
        });
      } catch (error) {
        notify({
          type: 'error',
          title: 'Unable to create user',
          description: error instanceof Error ? error.message : 'Request failed',
        });
      }
    });
  };

  const handleEditRole = () => {
    if (!editingUser) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await apiClient<IAdminUser>(`/api/admin-users/${editingUser._id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            role: editForm.role,
          }),
        });

        setUsers((current) =>
          current.map((user) => (user._id === response.data._id ? response.data : user)),
        );
        setEditingUser(null);
        setEditError(null);
        notify({
          type: 'success',
          title: 'Role updated',
          description: `${response.data.email} is now ${roleLabel[response.data.role]}.`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed';
        setEditError(message);
        notify({
          type: 'error',
          title: 'Unable to update role',
          description: message,
        });
      }
    });
  };

  const handleDeactivate = () => {
    if (!deactivatingUser) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await apiClient<IAdminUser>(`/api/admin-users/${deactivatingUser._id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            isActive: false,
          }),
        });

        setUsers((current) =>
          current.map((user) => (user._id === response.data._id ? response.data : user)),
        );
        setDeactivatingUser(null);
        notify({
          type: 'success',
          title: 'User deactivated',
          description: `${response.data.email} is now inactive.`,
        });
      } catch (error) {
        notify({
          type: 'error',
          title: 'Unable to deactivate user',
          description: error instanceof Error ? error.message : 'Request failed',
        });
      }
    });
  };

  return (
    <>
      <DataTable
        data={pagedUsers}
        getRowKey={(user) => user._id}
        title="Admin team"
        description="Super admins can provision, re-role, and deactivate operational users."
        actions={
          <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
            Add User
          </button>
        }
        emptyState={
          <EmptyState
            title="No admin users"
            description="Create the first admin user to start onboarding review operations."
          />
        }
        footer={
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={users.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
        columns={[
          {
            key: 'identity',
            header: 'Name / Email',
            className: 'min-w-[260px]',
            render: (user) => (
              <div>
                <div className="text-sm font-medium text-primary">{user.name}</div>
                <div className="mt-1 text-sm text-secondary">{user.email}</div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            className: 'min-w-[140px]',
            render: (user) => (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${roleBadgeStyles[user.role]}`}>
                {roleLabel[user.role]}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            className: 'min-w-[120px]',
            render: (user) => (
              <div className="flex items-center gap-2 text-sm text-primary">
                <span className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {user.isActive ? 'Active' : 'Inactive'}
              </div>
            ),
          },
          {
            key: 'lastLogin',
            header: 'Last Login',
            className: 'min-w-[140px]',
            render: (user) => (
              <span className="text-sm text-secondary">
                {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'min-w-[180px]',
            render: (user) => (
              <div className="flex flex-wrap gap-2">
                {user.role !== Role.SUPER_ADMIN ? (
                  <>
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => {
                        setEditingUser(user);
                        setEditForm({ role: user.role as Role.OPS_ADMIN | Role.VIEWER });
                        setEditError(null);
                      }}
                    >
                      Edit Role
                    </button>
                    <button
                      type="button"
                      className="btn-danger text-xs disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!user.isActive}
                      onClick={() => setDeactivatingUser(user)}
                    >
                      Deactivate
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-muted">Protected account</span>
                )}
              </div>
            ),
          },
        ]}
      />

      <FormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateErrors({});
        }}
        title="Add Admin User"
        description="Create a new operational admin account. Super admin accounts remain system-managed."
      >
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">Full Name</label>
            <input
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              className="input-base"
            />
            {createErrors.name ? <p className="mt-2 text-xs text-red-600">{createErrors.name}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">Email</label>
            <input
              value={createForm.email}
              onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
              className="input-base"
            />
            {createErrors.email ? <p className="mt-2 text-xs text-red-600">{createErrors.email}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">Password</label>
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
              className="input-base"
            />
            {createErrors.password ? <p className="mt-2 text-xs text-red-600">{createErrors.password}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">Role</label>
            <select
              value={createForm.role}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  role: event.target.value as Role.OPS_ADMIN | Role.VIEWER,
                }))
              }
              className="select-base"
            >
              <option value={Role.OPS_ADMIN}>Ops Admin</option>
              <option value={Role.VIEWER}>Viewer</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={() => setCreateOpen(false)} disabled={isPending}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={Boolean(editingUser)}
        onClose={() => {
          setEditingUser(null);
          setEditError(null);
        }}
        title="Edit Role"
        description={
          editingUser ? `Change the operational role for ${editingUser.email}.` : 'Update the role for this user.'
        }
      >
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">Role</label>
          <select
            value={editForm.role}
            onChange={(event) =>
              setEditForm({
                role: event.target.value as Role.OPS_ADMIN | Role.VIEWER,
              })
            }
            className="select-base"
          >
            <option value={Role.OPS_ADMIN}>Ops Admin</option>
            <option value={Role.VIEWER}>Viewer</option>
          </select>
          {editError ? <p className="mt-2 text-xs text-red-600">{editError}</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={() => setEditingUser(null)} disabled={isPending}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleEditRole} disabled={isPending}>
            {isPending ? 'Saving...' : 'Update Role'}
          </button>
        </div>
      </FormModal>

      <ConfirmModal
        open={Boolean(deactivatingUser)}
        tone="reject"
        title={deactivatingUser ? `Deactivate ${deactivatingUser.name}?` : 'Deactivate user?'}
        description="This will mark the user inactive immediately. Existing access tokens will stop working after refresh."
        confirmLabel="Deactivate User"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivatingUser(null)}
        loading={isPending}
      />
    </>
  );
};
