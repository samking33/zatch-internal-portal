import { Types, type FilterQuery } from 'mongoose';

import type { IAuditLog } from '@zatch/shared';

import { AuditLog, type AuditLogModelAttributes } from './audit.model';

type AuditListQuery = {
  targetCollection?: string;
  adminUserId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
};

type AuditTargetQuery = {
  targetId: string;
  targetCollection?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
};

type AuditLeanDocument = AuditLogModelAttributes & { _id: Types.ObjectId };

const serializeAuditLog = (auditLog: AuditLeanDocument): IAuditLog => ({
  _id: auditLog._id.toString(),
  action: auditLog.action,
  targetId: auditLog.targetId.toString(),
  targetCollection: auditLog.targetCollection,
  createdAt: auditLog.createdAt,
  ...(auditLog.adminUserId ? { adminUserId: auditLog.adminUserId.toString() } : {}),
  ...(auditLog.adminUserEmail ? { adminUserEmail: auditLog.adminUserEmail } : {}),
  ...(auditLog.note ? { note: auditLog.note } : {}),
  ...(auditLog.ipAddress ? { ipAddress: auditLog.ipAddress } : {}),
  ...(auditLog.metadata ? { metadata: auditLog.metadata } : {}),
});

export class AuditQueryRepository {
  public async findMany(query: AuditListQuery): Promise<{
    items: IAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: FilterQuery<AuditLogModelAttributes> = {};

    if (query.targetCollection) {
      filter.targetCollection = query.targetCollection;
    }

    if (query.adminUserId && Types.ObjectId.isValid(query.adminUserId)) {
      filter.adminUserId = new Types.ObjectId(query.adminUserId);
    }

    if (query.action) {
      filter.action = query.action;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {
        ...(query.startDate ? { $gte: query.startDate } : {}),
        ...(query.endDate ? { $lte: query.endDate } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [rawItems, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean().exec(),
      AuditLog.countDocuments(filter).exec(),
    ]);

    const items = rawItems as AuditLeanDocument[];

    return {
      items: items.map(serializeAuditLog),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  public async findByTarget(query: AuditTargetQuery): Promise<{
    items: IAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: FilterQuery<AuditLogModelAttributes> = {
      targetId: new Types.ObjectId(query.targetId),
    };

    if (query.targetCollection) {
      filter.targetCollection = query.targetCollection;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {
        ...(query.startDate ? { $gte: query.startDate } : {}),
        ...(query.endDate ? { $lte: query.endDate } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [rawItems, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean().exec(),
      AuditLog.countDocuments(filter).exec(),
    ]);

    const items = rawItems as AuditLeanDocument[];

    return {
      items: items.map(serializeAuditLog),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }
}
