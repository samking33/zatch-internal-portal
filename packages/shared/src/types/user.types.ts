export enum Role {
  SUPER_ADMIN = 'super_admin',
  OPS_ADMIN = 'ops_admin',
  VIEWER = 'viewer',
}

export interface IAdminUser {
  _id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
