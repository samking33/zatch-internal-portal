export enum AuditAction {
  SELLER_SUBMITTED = 'seller.submitted',
  SELLER_APPROVED = 'seller.approved',
  SELLER_REJECTED = 'seller.rejected',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  ADMIN_OVERRIDE = 'admin.override',
}

export interface IAuditLog {
  _id: string;
  adminUserId?: string;
  adminUserEmail?: string;
  action: AuditAction | string;
  targetId: string;
  targetCollection: string;
  note?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
