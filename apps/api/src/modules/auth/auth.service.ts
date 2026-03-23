import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { AuditAction, accessTokenPayloadSchema, type IAdminUser } from '@zatch/shared';

import { getEnv } from '../../config/env';
import { AppError } from '../../lib/app-error';
import { auditService } from '../audit/audit.service';
import { AuthRepository } from './auth.repository';
import type { AdminUserDocument } from './auth.model';

const BCRYPT_ROUNDS = 12;

type LoginInput = {
  email: string;
  password: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: IAdminUser;
};

type AuthActionContext = {
  ipAddress?: string;
};

const sanitizeUser = (user: AdminUserDocument): IAdminUser => {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
  };
};

export class AuthService {
  public constructor(private readonly authRepository: AuthRepository) {}

  public async login(input: LoginInput, context: AuthActionContext = {}): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(403, 'User account is inactive');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const updatedUser = await this.authRepository.updateLoginMetadata(
      user._id.toString(),
      refreshTokenHash,
      new Date(),
    );

    if (!updatedUser) {
      throw new AppError(500, 'Failed to update login session');
    }

    await auditService.log({
      action: AuditAction.USER_LOGIN,
      adminUserId: updatedUser._id.toString(),
      adminUserEmail: updatedUser.email,
      targetId: updatedUser._id.toString(),
      targetCollection: 'admin_users',
      ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
    });

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(updatedUser),
    };
  }

  public async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findById(payload.userId);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new AppError(401, 'Unauthorized');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!tokenMatches) {
      throw new AppError(401, 'Unauthorized');
    }

    return {
      accessToken: this.signAccessToken(user),
    };
  }

  public async logout(userId: string, context: AuthActionContext = {}): Promise<void> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await this.authRepository.updateRefreshTokenHash(userId, null);
    await auditService.log({
      action: AuditAction.USER_LOGOUT,
      adminUserId: user._id.toString(),
      adminUserEmail: user.email,
      targetId: user._id.toString(),
      targetCollection: 'admin_users',
      ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
    });
  }

  public async getCurrentUser(userId: string): Promise<IAdminUser> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return sanitizeUser(user);
  }

  private signAccessToken(user: AdminUserDocument): string {
    const env = getEnv();
    const expiresIn = env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>;
    const options: SignOptions = { expiresIn };

    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      env.JWT_ACCESS_SECRET,
      options,
    );
  }

  private signRefreshToken(user: AdminUserDocument): string {
    const env = getEnv();
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>;
    const options: SignOptions = { expiresIn };

    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      env.JWT_REFRESH_SECRET,
      options,
    );
  }

  private verifyRefreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, getEnv().JWT_REFRESH_SECRET);
      return accessTokenPayloadSchema.parse(decoded);
    } catch {
      throw new AppError(401, 'Unauthorized');
    }
  }
}

export const authService = new AuthService(new AuthRepository());
