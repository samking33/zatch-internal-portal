import { Types, type ClientSession } from 'mongoose';

import type { IAuditLog } from '@zatch/shared';

import { AppError } from '../../lib/app-error';
import { AuditQueryRepository } from './audit.query.repository';
import { AuditRepository } from './audit.repository';
import type { AuditLogDocument } from './audit.model';

type AuditLogInput = {
  action: string;
  adminUserId: string | null;
  adminUserEmail: string;
  targetId: string;
  targetCollection: string;
  note?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  session?: ClientSession;
};

const toOptionalObjectId = (value: string | null): Types.ObjectId | null => {
  if (value === null) {
    return null;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(500, 'Invalid audit admin user id');
  }

  return new Types.ObjectId(value);
};

const toRequiredObjectId = (value: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(500, 'Invalid audit target id');
  }

  return new Types.ObjectId(value);
};

const serializeAuditLog = (auditLog: AuditLogDocument): IAuditLog => ({
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

export class AuditService {
  public constructor(
    private readonly auditRepository: AuditRepository,
    private readonly auditQueryRepository: AuditQueryRepository,
  ) {}

  public async log(input: AuditLogInput): Promise<IAuditLog> {
    const auditLog = await this.auditRepository.insertLog(
      {
        adminUserId: toOptionalObjectId(input.adminUserId),
        adminUserEmail: input.adminUserEmail,
        action: input.action,
        targetId: toRequiredObjectId(input.targetId),
        targetCollection: input.targetCollection,
        ...(input.note ? { note: input.note } : {}),
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
      input.session,
    );

    return serializeAuditLog(auditLog);
  }

  public async list(query: {
    targetCollection?: string;
    adminUserId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }): Promise<{
    items: IAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.auditQueryRepository.findMany(query);
  }

  public async listByTarget(query: {
    targetId: string;
    targetCollection?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }): Promise<{
    items: IAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!Types.ObjectId.isValid(query.targetId)) {
      throw new AppError(400, 'Invalid audit target id');
    }

    return this.auditQueryRepository.findByTarget(query);
  }
}

export const auditService = new AuditService(new AuditRepository(), new AuditQueryRepository());
