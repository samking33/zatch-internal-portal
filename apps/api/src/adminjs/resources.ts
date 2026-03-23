import { Role } from '@zatch/shared';

import { AppError } from '../lib/app-error';
import { auditService } from '../modules/audit/audit.service';
import { AuditLog } from '../modules/audit/audit.model';
import { AdminUser } from '../modules/auth/auth.model';

type AdminJsCurrentAdmin = {
  id: string;
  email: string;
  role: Role;
};

type AdminJsRecord = {
  params: Record<string, unknown>;
  toJSON?: (currentAdmin?: unknown) => unknown;
};

type AdminJsActionContext = {
  currentAdmin?: AdminJsCurrentAdmin;
  record?: AdminJsRecord;
  records?: AdminJsRecord[];
};

type AdminJsRequest = {
  method: string;
  payload?: Record<string, unknown>;
};

type AdminJsResponse = {
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

const isSuperAdmin = (currentAdmin?: AdminJsCurrentAdmin): boolean =>
  currentAdmin?.role === Role.SUPER_ADMIN;

const buildCsv = (records: AdminJsRecord[]): string => {
  const header = [
    'id',
    'action',
    'targetId',
    'targetCollection',
    'adminUserEmail',
    'note',
    'createdAt',
  ];
  const rows = records.map((record) =>
    [
      String(record.params._id ?? ''),
      String(record.params.action ?? ''),
      String(record.params.targetId ?? ''),
      String(record.params.targetCollection ?? ''),
      String(record.params.adminUserEmail ?? ''),
      String(record.params.note ?? ''),
      String(record.params.createdAt ?? ''),
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
};

const deactivateUser = {
  actionType: 'record',
  icon: 'Pause',
  guard: 'Deactivate this admin user?',
  isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
  isVisible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
  handler: async (
    _request: AdminJsRequest,
    _response: unknown,
    context: AdminJsActionContext,
  ) => {
    if (!context.currentAdmin || !context.record) {
      throw new AppError(401, 'Unauthorized');
    }

    const userId = String(context.record.params._id);

    await AdminUser.findByIdAndUpdate(userId, {
      isActive: false,
      refreshTokenHash: null,
    }).exec();

    await auditService.log({
      action: 'admin_user.deactivated',
      adminUserId: context.currentAdmin.id,
      adminUserEmail: context.currentAdmin.email,
      targetId: userId,
      targetCollection: 'admin_users',
      metadata: {
        source: 'adminjs',
      },
    });

    return {
      record: context.record.toJSON ? context.record.toJSON(context.currentAdmin) : context.record,
      notice: {
        message: 'Admin user deactivated',
        type: 'success',
      },
    };
  },
};

const exportCsv = {
  actionType: 'resource',
  icon: 'Download',
  isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
  isVisible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
  handler: async (
    _request: AdminJsRequest,
    response: unknown,
    context: AdminJsActionContext,
  ) => {
    const expressResponse = response as AdminJsResponse;
    const records = context.records ?? [];
    const csv = buildCsv(records);

    expressResponse.setHeader('Content-Type', 'text/csv');
    expressResponse.setHeader('Content-Disposition', 'attachment; filename=\"audit-logs.csv\"');
    expressResponse.send(csv);

    return {};
  },
};

export const createAdminJsResources = () => [
  {
    resource: AuditLog,
    options: {
      navigation: { name: 'Operations', icon: 'DocumentCheck' },
      sort: {
        sortBy: 'createdAt',
        direction: 'desc',
      },
      actions: {
        new: { isAccessible: false, isVisible: false },
        edit: { isAccessible: false, isVisible: false },
        delete: { isAccessible: false, isVisible: false },
        bulkDelete: { isAccessible: false, isVisible: false },
        exportCsv,
      },
    },
  },
  {
    resource: AdminUser,
    options: {
      navigation: { name: 'Administration', icon: 'User' },
      properties: {
        passwordHash: { isVisible: false },
        refreshTokenHash: { isVisible: false },
      },
      actions: {
        list: {
          isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
        },
        show: {
          isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
        },
        new: {
          isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
        },
        edit: {
          isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
        },
        delete: {
          isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
        },
        bulkDelete: {
          isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
        },
        deactivate: deactivateUser,
      },
    },
  },
];
