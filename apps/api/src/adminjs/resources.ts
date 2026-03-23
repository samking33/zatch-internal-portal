import mongoose from 'mongoose';
import { z } from 'zod';

import { Role, SellerStatus } from '@zatch/shared';

import { AppError } from '../lib/app-error';
import { auditService } from '../modules/audit/audit.service';
import { AuditLog } from '../modules/audit/audit.model';
import { AdminUser } from '../modules/auth/auth.model';
import { Seller } from '../modules/sellers/seller.model';

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

const forceStatusSchema = z.object({
  status: z.nativeEnum(SellerStatus),
  note: z.string().max(500).optional(),
});

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

const forceStatusChange = {
  actionType: 'record',
  icon: 'Settings',
  guard: 'Force this seller status change?',
  isAccessible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
  isVisible: ({ currentAdmin }: AdminJsActionContext) => isSuperAdmin(currentAdmin),
  handler: async (
    request: AdminJsRequest,
    _response: unknown,
    context: AdminJsActionContext,
  ) => {
    if (!context.currentAdmin || !context.record) {
      throw new AppError(401, 'Unauthorized');
    }

    if (request.method !== 'post') {
      return {
        record: context.record,
      };
    }

    const payload = forceStatusSchema.parse(request.payload ?? {});
    const sellerId = String(context.record.params._id);
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const seller = await Seller.findByIdAndUpdate(
        sellerId,
        {
          $set: { status: payload.status },
          $push: {
            statusHistory: {
              status: payload.status,
              changedBy: context.currentAdmin.id,
              changedAt: new Date(),
              ...(payload.note ? { note: payload.note } : {}),
            },
          },
        },
        {
          new: true,
          session,
        },
      ).exec();

      if (!seller) {
        throw new AppError(404, 'Seller not found');
      }

      await auditService.log({
        action: 'admin.override',
        adminUserId: context.currentAdmin.id,
        adminUserEmail: context.currentAdmin.email,
        targetId: seller._id.toString(),
        targetCollection: 'sellers',
        ...(payload.note ? { note: payload.note } : {}),
        metadata: {
          source: 'adminjs',
          nextStatus: payload.status,
        },
        session,
      });

      await session.commitTransaction();

      return {
        record: context.record.toJSON ? context.record.toJSON(context.currentAdmin) : context.record,
        notice: {
          message: 'Seller status updated',
          type: 'success',
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },
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
    resource: Seller,
    options: {
      navigation: { name: 'Operations', icon: 'Store' },
      properties: {
        documents: {
          isVisible: { list: false, show: true, edit: true, filter: false },
        },
      },
      actions: {
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
        forceStatusChange,
      },
    },
  },
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
