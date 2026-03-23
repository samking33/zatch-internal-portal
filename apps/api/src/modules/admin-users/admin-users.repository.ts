import { type FilterQuery } from 'mongoose';

import type { IAdminUser, Role } from '@zatch/shared';

import { AdminUser } from '../auth/auth.model';

type AdminUserListQuery = {
  page: number;
  limit: number;
};

type CreateAdminUserInput = {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
};

type UpdateAdminUserInput = {
  userId: string;
  role?: Role;
  isActive?: boolean;
};

type AdminUserLeanDocument = {
  _id: { toString(): string };
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const serializeAdminUser = (user: AdminUserLeanDocument): IAdminUser => ({
  _id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
});

export class AdminUsersRepository {
  public async list(query: AdminUserListQuery): Promise<{
    items: IAdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: FilterQuery<unknown> = {};
    const skip = (query.page - 1) * query.limit;
    const [rawItems, total] = await Promise.all([
      AdminUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean().exec(),
      AdminUser.countDocuments(filter).exec(),
    ]);
    const items = rawItems as AdminUserLeanDocument[];

    return {
      items: items.map(serializeAdminUser),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  public async findByEmail(email: string): Promise<IAdminUser | null> {
    const user = await AdminUser.findOne({ email }).lean().exec();
    return user ? serializeAdminUser(user as AdminUserLeanDocument) : null;
  }

  public async findById(userId: string): Promise<IAdminUser | null> {
    const user = await AdminUser.findById(userId).lean().exec();
    return user ? serializeAdminUser(user as AdminUserLeanDocument) : null;
  }

  public async create(input: CreateAdminUserInput): Promise<IAdminUser> {
    const user = await AdminUser.create({
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role,
      isActive: true,
    });

    return serializeAdminUser(user.toJSON() as AdminUserLeanDocument);
  }

  public async update(input: UpdateAdminUserInput): Promise<IAdminUser | null> {
    const updatePayload = {
      ...(input.role ? { role: input.role } : {}),
      ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
      ...(input.isActive === false ? { refreshTokenHash: null } : {}),
    };

    const user = await AdminUser.findByIdAndUpdate(input.userId, updatePayload, {
      new: true,
    })
      .lean()
      .exec();

    return user ? serializeAdminUser(user as AdminUserLeanDocument) : null;
  }
}
