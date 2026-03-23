import type { IAdminUser } from './user.types';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponseData {
  accessToken: string;
  user: IAdminUser;
}

export interface RefreshResponseData {
  accessToken: string;
}
