import {
  type AdminAccount,
  type AdminListResult,
  type AdminOrder,
  type AdminPagination,
  type AdminPayout,
  type AdminProduct,
  type AdminSeller,
  buildSearchParams,
  normalizeAdminAccount,
  normalizeAdminList,
  normalizeOrder,
  normalizeOrderList,
  normalizePayout,
  normalizePayoutList,
  normalizeProduct,
  normalizeProductList,
  normalizeSeller,
  normalizeSellerList,
  normalizeStatsRecord,
  pickFirstValue,
} from './admin-api';
import { getServerSession, serverFetch } from './server-fetch';

export type DashboardSummary = {
  sellerCounts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  productStats: Record<string, unknown>;
  orderStats: Record<string, unknown>;
  settlementSummary: Record<string, unknown>;
};

export type SettlementOverview = {
  pendingPayouts: AdminPayout[];
  heldPayouts: AdminPayout[];
  stats: Record<string, unknown>;
};

type QueryValue = string | number | boolean | undefined | null;

const emptyPagination: AdminPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const emptyListResult = <T,>(): AdminListResult<T> => ({
  items: [],
  pagination: emptyPagination,
});

const getPayload = async (path: string): Promise<Record<string, unknown>> => {
  const response = await serverFetch<Record<string, unknown>>(path);
  return response.data;
};

const tryGetPayload = async (path: string): Promise<Record<string, unknown> | null> => {
  try {
    return await getPayload(path);
  } catch {
    return null;
  }
};

const buildPath = (path: string, params: Record<string, QueryValue> = {}): string => {
  const query = buildSearchParams(params);
  return query ? `${path}?${query}` : path;
};

const normalizeSingle = <T,>(
  payload: Record<string, unknown>,
  paths: string[],
  normalize: (value: unknown) => T,
): T => normalize(pickFirstValue(payload, paths) ?? payload);

export const fetchSellerPage = async (
  params: Record<string, QueryValue> = {},
): Promise<AdminListResult<AdminSeller>> => {
  const payload = await getPayload(buildPath('/api/v1/admin/sellers', params));
  return normalizeSellerList(payload);
};

export const fetchSellerDetail = async (sellerId: string): Promise<AdminSeller> => {
  const payload = await getPayload(`/api/v1/admin/sellers/${sellerId}`);
  return normalizeSingle(payload, ['data.seller', 'seller', 'data'], normalizeSeller);
};

const fetchSellerCountForStatus = async (status?: string): Promise<number> => {
  const result = await fetchSellerPage({
    status,
    page: 1,
    limit: 1,
  });

  return result.pagination.total;
};

export const fetchSellerCounts = async (): Promise<DashboardSummary['sellerCounts']> => {
  const [all, pending, approved, rejected] = await Promise.all([
    fetchSellerCountForStatus(undefined),
    fetchSellerCountForStatus('pending'),
    fetchSellerCountForStatus('approved'),
    fetchSellerCountForStatus('rejected'),
  ]);

  return {
    total: all,
    pending,
    approved,
    rejected,
  };
};

export const fetchProductPage = async (
  params: Record<string, QueryValue> = {},
): Promise<AdminListResult<AdminProduct>> => {
  const payload = await getPayload(buildPath('/api/v1/admin/products', params));
  return normalizeProductList(payload);
};

export const fetchProductDetail = async (productId: string): Promise<AdminProduct> => {
  const payload = await getPayload(`/api/v1/admin/products/${productId}`);
  return normalizeSingle(payload, ['data.product', 'product', 'data'], normalizeProduct);
};

export const fetchProductStats = async (): Promise<Record<string, unknown>> => {
  const payload = await tryGetPayload('/api/v1/admin/products/stats');

  if (!payload) {
    return {};
  }

  return normalizeStatsRecord(payload);
};

export const fetchOrderPage = async (
  params: Record<string, QueryValue> = {},
): Promise<AdminListResult<AdminOrder> & { stats: Record<string, unknown> }> => {
  const sellerId = typeof params.sellerId === 'string' ? params.sellerId : undefined;
  const resolvedParams = { ...params };
  delete resolvedParams.sellerId;

  const path = sellerId
    ? buildPath(`/api/v1/admin/orders/seller/${sellerId}`, resolvedParams)
    : buildPath('/api/v1/admin/orders', resolvedParams);

  const payload = await getPayload(path);
  const list = normalizeOrderList(payload);

  return {
    ...list,
    stats: normalizeStatsRecord(payload),
  };
};

export const fetchOrderDetail = async (orderId: string): Promise<AdminOrder> => {
  const payload = await getPayload(`/api/v1/admin/orders/${orderId}`);
  return normalizeSingle(payload, ['data.order', 'order', 'data'], normalizeOrder);
};

export const fetchOrderStats = async (
  params: Record<string, QueryValue> = {},
): Promise<Record<string, unknown>> => {
  const payload = await tryGetPayload(buildPath('/api/v1/admin/orders/stats', params));

  if (!payload) {
    return {};
  }

  return normalizeStatsRecord(payload);
};

export const fetchPayoutPage = async (
  params: Record<string, QueryValue> = {},
): Promise<AdminListResult<AdminPayout> & { stats: Record<string, unknown> }> => {
  const payload = await getPayload(buildPath('/api/v1/admin/settlements/payouts', params));
  const list = normalizePayoutList(payload);

  return {
    ...list,
    stats: normalizeStatsRecord(payload),
  };
};

export const fetchSettlementOverview = async (): Promise<SettlementOverview> => {
  const payload = await getPayload('/api/v1/admin/settlements');
  const pendingPayoutsSource = pickFirstValue(payload, ['pendingPayouts', 'data.pendingPayouts']);
  const heldPayoutsSource = pickFirstValue(payload, ['heldPayouts', 'data.heldPayouts']);
  const rawStats = pickFirstValue(payload, ['stats', 'data.stats']);

  return {
    pendingPayouts: (Array.isArray(pendingPayoutsSource) ? pendingPayoutsSource : []).map(normalizePayout),
    heldPayouts: (Array.isArray(heldPayoutsSource) ? heldPayoutsSource : []).map(normalizePayout),
    stats:
      rawStats && typeof rawStats === 'object'
        ? normalizeStatsRecord({ stats: rawStats as Record<string, unknown> })
        : {},
  };
};

export const fetchPayoutSummary = async (): Promise<Record<string, unknown>> => {
  const payload = await tryGetPayload('/api/v1/admin/settlements/summary');

  if (!payload) {
    return {};
  }

  return normalizeStatsRecord(payload);
};

export const fetchCommissionOverview = async (): Promise<Record<string, unknown>> => {
  const payload = await tryGetPayload('/api/v1/admin/settlements/commission');

  if (!payload) {
    return {};
  }

  return normalizeStatsRecord(payload);
};

export const fetchSellerSettlement = async (
  sellerId: string,
): Promise<{
  seller: AdminSeller | null;
  payouts: AdminListResult<AdminPayout>;
  summary: Record<string, unknown>;
}> => {
  const sellerPayload = await tryGetPayload(`/api/v1/admin/settlements/seller/${sellerId}`);

  if (sellerPayload) {
    return {
      seller: pickFirstValue(sellerPayload, ['seller', 'data.seller'])
        ? normalizeSingle(sellerPayload, ['seller', 'data.seller'], normalizeSeller)
        : null,
      payouts: normalizePayoutList(sellerPayload),
      summary: normalizeStatsRecord(sellerPayload),
    };
  }

  const payouts = await fetchPayoutPage({ sellerId });
  return {
    seller: null,
    payouts,
    summary: payouts.stats,
  };
};

export const fetchAdminAccounts = async (): Promise<AdminListResult<AdminAccount>> => {
  const payload = await getPayload('/api/v1/admin/admins');
  return normalizeAdminList(payload);
};

export const fetchAdminAccount = async (adminId: string): Promise<AdminAccount | null> => {
  const admins = await fetchAdminAccounts();
  return admins.items.find((item) => item.id === adminId) ?? null;
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const [sellerCounts, productStats, orderStats, settlementSummary] = await Promise.all([
    fetchSellerCounts(),
    fetchProductStats(),
    fetchOrderStats(),
    fetchPayoutSummary(),
  ]);

  return {
    sellerCounts,
    productStats,
    orderStats,
    settlementSummary,
  };
};

export const fetchRecentProducts = async (): Promise<AdminProduct[]> => {
  const products = await fetchProductPage({ limit: 8 });
  return products.items;
};

export const fetchRecentOrders = async (): Promise<AdminOrder[]> => {
  const orders = await fetchOrderPage({ limit: 8 });
  return orders.items;
};

export const fetchRecentSellers = async (): Promise<AdminSeller[]> => {
  const sellers = await fetchSellerPage({ limit: 8 });
  return sellers.items;
};

export const fetchAllSellers = async (): Promise<AdminSeller[]> => {
  const sellers = await fetchSellerPage({ limit: 100 });
  return sellers.items;
};

export const fetchAllAdmins = async (): Promise<AdminAccount[]> => {
  const admins = await fetchAdminAccounts();
  return admins.items;
};

export const getCurrentSession = async () => getServerSession();

export const normalizeAdminFromUnknown = (value: unknown): AdminAccount =>
  normalizeAdminAccount(value);

export const normalizeSellerFromUnknown = (value: unknown): AdminSeller =>
  normalizeSeller(value);

export const normalizeProductFromUnknown = (value: unknown): AdminProduct =>
  normalizeProduct(value);

export const normalizeOrderFromUnknown = (value: unknown): AdminOrder =>
  normalizeOrder(value);

export const normalizePayoutFromUnknown = (value: unknown): AdminPayout =>
  normalizePayout(value);

export const getEmptySellerList = (): AdminListResult<AdminSeller> => emptyListResult<AdminSeller>();
