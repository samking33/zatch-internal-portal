import type {
  IAuditLog,
  IAdminUser,
  ISeller,
  ISellerCityStats,
  ISellerPincodeStats,
  ISellerStateStats,
  PaginatedResult,
} from '@zatch/shared';

import { getServerSession, serverFetch } from './server-fetch';

const PAGE_LIMIT = 100;

const fetchAllAuditLogs = async (params: Record<string, string> = {}): Promise<IAuditLog[]> => {
  const search = new URLSearchParams({
    limit: String(PAGE_LIMIT),
    ...params,
  });

  const firstPage = await serverFetch<PaginatedResult<IAuditLog>>(`/api/audit?${search.toString()}`);
  const { totalPages, items } = firstPage.data;

  if (totalPages <= 1) {
    return items;
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      serverFetch<PaginatedResult<IAuditLog>>(
        `/api/audit?${new URLSearchParams({
          ...params,
          limit: String(PAGE_LIMIT),
          page: String(index + 2),
        }).toString()}`,
      ),
    ),
  );

  return [...items, ...rest.flatMap((page) => page.data.items)];
};

const fetchAllSellerPages = async (params: Record<string, string> = {}): Promise<ISeller[]> => {
  const search = new URLSearchParams({
    limit: String(PAGE_LIMIT),
    ...params,
  });

  const firstPage = await serverFetch<PaginatedResult<ISeller>>(`/api/sellers?${search.toString()}`);
  const { totalPages, items } = firstPage.data;

  if (totalPages <= 1) {
    return items;
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      serverFetch<PaginatedResult<ISeller>>(
        `/api/sellers?${new URLSearchParams({
          ...params,
          limit: String(PAGE_LIMIT),
          page: String(index + 2),
        }).toString()}`,
      ),
    ),
  );

  return [...items, ...rest.flatMap((page) => page.data.items)];
};

export const fetchSellerPage = async (
  params: Record<string, string> = {},
): Promise<PaginatedResult<ISeller>> => {
  const response = await serverFetch<PaginatedResult<ISeller>>(
    `/api/sellers?${new URLSearchParams(params).toString()}`,
  );
  return response.data;
};

export const fetchAllSellers = async (): Promise<ISeller[]> =>
  fetchAllSellerPages({
    status: 'all',
  });

export const fetchRecentAuditLogs = async (limit = 10): Promise<IAuditLog[]> => {
  const response = await serverFetch<PaginatedResult<IAuditLog>>(`/api/audit?limit=${limit}`);
  return response.data.items;
};

export const fetchAllAuditHistory = async (): Promise<IAuditLog[]> =>
  fetchAllAuditLogs();

export const fetchAdminUsers = async (): Promise<IAdminUser[]> => {
  const response = await serverFetch<PaginatedResult<IAdminUser>>('/api/admin-users?limit=100');
  return response.data.items;
};

export const fetchSellerStatsByState = async (): Promise<ISellerStateStats[]> => {
  const response = await serverFetch<ISellerStateStats[]>('/api/sellers/stats/by-state');
  return response.data;
};

export const fetchSellerStatsByCity = async (states: string[] = []): Promise<ISellerCityStats[]> => {
  const search = new URLSearchParams();
  if (states.length > 0) {
    search.set('states', states.join(','));
  }

  const response = await serverFetch<ISellerCityStats[]>(
    `/api/sellers/stats/by-city${search.size > 0 ? `?${search.toString()}` : ''}`,
  );
  return response.data;
};

export const fetchSellerStatsByPincode = async (params: {
  city?: string;
  states?: string[];
} = {}): Promise<ISellerPincodeStats[]> => {
  const search = new URLSearchParams();
  if (params.city) {
    search.set('city', params.city);
  }
  if (params.states && params.states.length > 0) {
    search.set('states', params.states.join(','));
  }

  const response = await serverFetch<ISellerPincodeStats[]>(
    `/api/sellers/stats/by-pincode${search.size > 0 ? `?${search.toString()}` : ''}`,
  );
  return response.data;
};

export const getCurrentSession = async () => getServerSession();
