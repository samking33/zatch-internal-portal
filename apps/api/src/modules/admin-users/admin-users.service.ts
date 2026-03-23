import bcrypt from 'bcrypt';

import { type IAdminUser, Role } from '@zatch/shared';

import { AppError } from '../../lib/app-error';
import { auditService } from '../audit/audit.service';
import { AdminUsersRepository } from './admin-users.repository';

const BCRYPT_ROUNDS = 12;

type CreateAdminUserInput = {
  email: string;
  name: string;
  password: string;
  role: Role.OPS_ADMIN | Role.VIEWER;
  adminUserId: string;
  adminUserEmail: string;
  ipAddress?: string;
};

type UpdateAdminUserInput = {
  userId: string;
  role?: Role.OPS_ADMIN | Role.VIEWER;
  isActive?: boolean;
  adminUserId: string;
  adminUserEmail: string;
  ipAddress?: string;
};

export class AdminUsersService {
  public constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  public async list(query: {
    page: number;
    limit: number;
  }): Promise<{
    items: IAdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.adminUsersRepository.list(query);
  }

  public async create(input: CreateAdminUserInput): Promise<IAdminUser> {
    const existingUser = await this.adminUsersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, 'Admin user already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.adminUsersRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
    });

    await auditService.log({
      action: 'admin_user.created',
      adminUserId: input.adminUserId,
      adminUserEmail: input.adminUserEmail,
      targetId: user._id,
      targetCollection: 'admin_users',
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      metadata: {
        role: user.role,
        email: user.email,
      },
    });

    return user;
  }

  public async update(input: UpdateAdminUserInput): Promise<IAdminUser> {
    const existingUser = await this.adminUsersRepository.findById(input.userId);

    if (!existingUser) {
      throw new AppError(404, 'Admin user not found');
    }

    const updatedUser = await this.adminUsersRepository.update({
      userId: input.userId,
      ...(input.role ? { role: input.role } : {}),
      ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
    });

    if (!updatedUser) {
      throw new AppError(404, 'Admin user not found');
    }

    await auditService.log({
      action: 'admin_user.updated',
      adminUserId: input.adminUserId,
      adminUserEmail: input.adminUserEmail,
      targetId: updatedUser._id,
      targetCollection: 'admin_users',
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      metadata: {
        ...(input.role ? { role: input.role } : {}),
        ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
      },
    });

    return updatedUser;
  }
}

export const adminUsersService = new AdminUsersService(new AdminUsersRepository());
