import { Schema, Types, model, models, type HydratedDocument, type Model } from 'mongoose';

export interface AuditLogModelAttributes {
  adminUserId: Types.ObjectId | null;
  adminUserEmail: string;
  action: string;
  targetId: Types.ObjectId;
  targetCollection: string;
  note?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type AuditLogDocument = HydratedDocument<AuditLogModelAttributes>;

const auditLogSchema = new Schema<AuditLogModelAttributes>(
  {
    adminUserId: { type: Schema.Types.ObjectId, ref: 'AdminUser', default: null },
    adminUserEmail: { type: String, default: 'system' },
    action: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetCollection: { type: String, required: true },
    note: { type: String },
    ipAddress: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    collection: 'audit_logs',
    timestamps: true,
  },
);

auditLogSchema.pre('findOneAndUpdate', function auditImmutableFindOneAndUpdate() {
  throw new Error('audit_logs are immutable');
});

auditLogSchema.pre('updateOne', function auditImmutableUpdateOne() {
  throw new Error('audit_logs are immutable');
});

auditLogSchema.pre('updateMany', function auditImmutableUpdateMany() {
  throw new Error('audit_logs are immutable');
});

auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ targetCollection: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ adminUserId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog =
  (models.AuditLog as Model<AuditLogModelAttributes> | undefined) ??
  model<AuditLogModelAttributes>('AuditLog', auditLogSchema);
