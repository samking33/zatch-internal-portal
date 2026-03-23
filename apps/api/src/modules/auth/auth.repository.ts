import { AdminUser, type AdminUserDocument } from './auth.model';

export class AuthRepository {
  public async findByEmail(email: string): Promise<AdminUserDocument | null> {
    return AdminUser.findOne({ email }).exec();
  }

  public async findById(id: string): Promise<AdminUserDocument | null> {
    return AdminUser.findById(id).exec();
  }

  public async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<AdminUserDocument | null> {
    return AdminUser.findByIdAndUpdate(userId, { refreshTokenHash }, { new: true }).exec();
  }

  public async updateLoginMetadata(
    userId: string,
    refreshTokenHash: string,
    lastLoginAt: Date,
  ): Promise<AdminUserDocument | null> {
    return AdminUser.findByIdAndUpdate(
      userId,
      {
        refreshTokenHash,
        lastLoginAt,
      },
      { new: true },
    ).exec();
  }
}
