import { Schema, model, models, type HydratedDocument, type Model } from 'mongoose';

import { Role } from '@zatch/shared';

export interface AdminUserModelAttributes {
  email: string;
  name: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminUserDocument = HydratedDocument<AdminUserModelAttributes>;

const adminUserSchema = new Schema<AdminUserModelAttributes>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: { type: String, default: null },
    role: { type: String, enum: Object.values(Role), default: Role.OPS_ADMIN },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    collection: 'admin_users',
    timestamps: true,
  },
);

adminUserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const normalized = ret as Partial<{
      passwordHash: string;
      refreshTokenHash: string | null;
      __v: number;
    }> & {
      _id: { toString(): string };
    };

    normalized._id = normalized._id.toString() as unknown as typeof normalized._id;

    delete normalized.passwordHash;
    delete normalized.refreshTokenHash;
    delete normalized.__v;

    return normalized;
  },
});

export const AdminUser =
  (models.AdminUser as Model<AdminUserModelAttributes> | undefined) ??
  model<AdminUserModelAttributes>('AdminUser', adminUserSchema);
