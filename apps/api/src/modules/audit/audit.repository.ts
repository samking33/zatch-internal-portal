import type { ClientSession } from 'mongoose';

import { AuditLog, type AuditLogDocument } from './audit.model';

type InsertLogInput = {
  adminUserId: import('mongoose').Types.ObjectId | null;
  adminUserEmail: string;
  action: string;
  targetId: import('mongoose').Types.ObjectId;
  targetCollection: string;
  note?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

export class AuditRepository {
  public async insertLog(
    input: InsertLogInput,
    session?: ClientSession,
  ): Promise<AuditLogDocument> {
    const auditLogs = session
      ? await AuditLog.create([input], { session })
      : await AuditLog.create([input]);
    const auditLog = auditLogs[0];

    if (!auditLog) {
      throw new Error('Failed to create audit log');
    }

    return auditLog;
  }
}
