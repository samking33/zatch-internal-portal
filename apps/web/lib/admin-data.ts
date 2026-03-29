import {
  type AdminAccount,
  type AdminListResult,
  type AdminOrder,
  type AdminPagination,
  type AdminPayout,
  type AdminProduct,
  type AdminSeller,
  buildSearchParams,
  formatCurrency,
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
  productStats: ProductStats;
  orderStats: OrderStats;
  settlementSummary: SettlementSummary;
};

export type SettlementOverview = {
  pendingPayouts: AdminPayout[];
  heldPayouts: AdminPayout[];
  stats: SettlementSummary;
};

export type SellerSettlementSummary = {
  totalEarned: number;
  totalEarnedFormatted: string;
  totalPending: number;
  totalPendingFormatted: string;
  totalHeld: number;
  totalHeldFormatted: string;
  raw: Record<string, unknown>;
};

export type ProductCategoryStat = {
  label: string;
  count: number;
};

export type ProductStats = {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  totalSold: number;
  topCategories: ProductCategoryStat[];
  raw: Record<string, unknown>;
};

export type OrderTopSeller = {
  id: string;
  username: string;
  businessName: string;
  orderCount: number;
  totalRevenue: number;
};

export type OrderStats = {
  timeRange: string;
  totalOrders: number;
  totalRevenue: number;
  totalRevenueFormatted: string;
  paidRevenue: number;
  paidRevenueFormatted: string;
  allTimeTotalRevenue: number;
  allTimeTotalRevenueFormatted: string;
  pendingOrders: number;
  deliveredOrders: number;
  statusBreakdown: Record<string, number>;
  topSellers: OrderTopSeller[];
  raw: Record<string, unknown>;
  periodRaw: Record<string, unknown>;
  allTimeRaw: Record<string, unknown>;
};

export type SettlementBucket = {
  count: number;
  amount: number;
  formatted: string;
};

export type SettlementSummary = {
  pending: SettlementBucket;
  approved: SettlementBucket;
  processing: SettlementBucket;
  paid: SettlementBucket;
  failed: SettlementBucket;
  hold: SettlementBucket;
  totalCommission: number;
  totalCommissionFormatted: string;
  totalPayoutsDone: number;
  totalPayoutsDoneFormatted: string;
  raw: Record<string, unknown>;
};

export type CommissionOverview = {
  commissionRate: number;
  commissionPercent: string;
  sellerReceives: string;
  raw: Record<string, unknown>;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toNumberValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toStringValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

const getRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const createEmptySettlementBucket = (): SettlementBucket => ({
  count: 0,
  amount: 0,
  formatted: formatCurrency(0),
});

const normalizeSettlementBucket = (value: unknown): SettlementBucket => {
  const record = getRecord(value);
  const amount = toNumberValue(record.amount);

  return {
    count: toNumberValue(record.count),
    amount,
    formatted: toStringValue(record.formatted) || formatCurrency(amount),
  };
};

const normalizeProductStats = (payload: Record<string, unknown>): ProductStats => {
  const stats = normalizeStatsRecord(payload);
  const totalProducts = toNumberValue(
    pickFirstValue(stats, ['totalProducts', 'total', 'counts.total']),
  );
  const activeProducts = toNumberValue(
    pickFirstValue(stats, ['activeProducts', 'active', 'counts.active']),
  );
  const draftProducts = toNumberValue(
    pickFirstValue(stats, ['draftProducts', 'draft', 'counts.draft']),
  );
  const outOfStock = toNumberValue(
    pickFirstValue(stats, ['outOfStock', 'out_of_stock', 'counts.out_of_stock']),
  );
  const inactiveSource = pickFirstValue(stats, ['inactiveProducts', 'inactive', 'counts.inactive']);
  const inactiveProducts =
    inactiveSource === undefined || inactiveSource === null
      ? Math.max(totalProducts - activeProducts - draftProducts - outOfStock, 0)
      : toNumberValue(inactiveSource);
  const topCategoriesSource = pickFirstValue(stats, ['topCategories']);
  const topCategories = (Array.isArray(topCategoriesSource) ? topCategoriesSource : []).map((item) => {
    const record = getRecord(item);

    return {
      label: toStringValue(record._id || record.name || record.label) || 'Unknown',
      count: toNumberValue(record.count),
    };
  });

  return {
    totalProducts,
    activeProducts,
    draftProducts,
    inactiveProducts,
    outOfStock,
    totalSold: toNumberValue(pickFirstValue(stats, ['totalSold'])),
    topCategories,
    raw: stats,
  };
};

const normalizeOrderStats = (payload: Record<string, unknown>): OrderStats => {
  const stats = normalizeStatsRecord(payload);
  const periodRaw = getRecord(pickFirstValue(stats, ['period']) ?? stats);
  const allTimeRaw = getRecord(pickFirstValue(stats, ['allTime']));
  const statusBreakdownSource = getRecord(
    pickFirstValue(stats, ['statusBreakdown', 'statusCounts']),
  );

  const statusBreakdown = Object.fromEntries(
    Object.entries(statusBreakdownSource).map(([status, count]) => [status, toNumberValue(count)]),
  );

  const pendingStatuses = [
    'pending',
    'confirmed',
    'processing',
    'ready_to_ship',
    'packed',
    'shipped',
    'out_for_delivery',
  ];

  const pendingOrders = pendingStatuses.reduce(
    (total, status) => total + (statusBreakdown[status] ?? 0),
    0,
  );
  const totalRevenue = toNumberValue(
    pickFirstValue(periodRaw, ['totalRevenue']) ?? pickFirstValue(stats, ['totalRevenue']),
  );
  const paidRevenue = toNumberValue(
    pickFirstValue(periodRaw, ['paidRevenue']) ?? pickFirstValue(stats, ['paidRevenue']),
  );
  const allTimeTotalRevenue = toNumberValue(
    pickFirstValue(allTimeRaw, ['totalRevenue']) ?? pickFirstValue(stats, ['allTimeTotalRevenue']),
  );
  const topSellerSource = pickFirstValue(stats, ['topSellers']);
  const topSellers = (Array.isArray(topSellerSource) ? topSellerSource : []).map((item) => {
    const record = getRecord(item);

    return {
      id: toStringValue(record._id),
      username: toStringValue(record.username) || 'Unknown seller',
      businessName: toStringValue(record.businessName) || 'No business name',
      orderCount: toNumberValue(record.orderCount),
      totalRevenue: toNumberValue(record.totalRevenue),
    };
  });

  return {
    timeRange: toStringValue(pickFirstValue(periodRaw, ['timeRange'])) || 'week',
    totalOrders: toNumberValue(
      pickFirstValue(periodRaw, ['totalOrders']) ?? pickFirstValue(stats, ['totalOrders']),
    ),
    totalRevenue,
    totalRevenueFormatted:
      toStringValue(pickFirstValue(periodRaw, ['totalRevenue'])) || formatCurrency(totalRevenue),
    paidRevenue,
    paidRevenueFormatted:
      toStringValue(pickFirstValue(periodRaw, ['paidRevenue'])) || formatCurrency(paidRevenue),
    allTimeTotalRevenue,
    allTimeTotalRevenueFormatted:
      toStringValue(pickFirstValue(allTimeRaw, ['totalRevenue'])) ||
      formatCurrency(allTimeTotalRevenue),
    pendingOrders,
    deliveredOrders: statusBreakdown.delivered ?? 0,
    statusBreakdown,
    topSellers,
    raw: stats,
    periodRaw,
    allTimeRaw,
  };
};

const normalizeSettlementSummary = (payload: Record<string, unknown>): SettlementSummary => {
  const stats = normalizeStatsRecord(payload);
  const totalCommission = toNumberValue(
    pickFirstValue(stats, ['totalCommission', 'totalCommissionEarned']),
  );
  const totalPayoutsDone = toNumberValue(pickFirstValue(stats, ['totalPayoutsDone']));

  return {
    pending: normalizeSettlementBucket(pickFirstValue(stats, ['pending'])),
    approved: normalizeSettlementBucket(pickFirstValue(stats, ['approved'])),
    processing: normalizeSettlementBucket(pickFirstValue(stats, ['processing'])),
    paid: normalizeSettlementBucket(pickFirstValue(stats, ['paid'])),
    failed: normalizeSettlementBucket(pickFirstValue(stats, ['failed'])),
    hold: normalizeSettlementBucket(pickFirstValue(stats, ['hold'])),
    totalCommission,
    totalCommissionFormatted:
      toStringValue(pickFirstValue(stats, ['totalCommissionFormatted'])) ||
      formatCurrency(totalCommission),
    totalPayoutsDone,
    totalPayoutsDoneFormatted:
      toStringValue(pickFirstValue(stats, ['totalPayoutsDoneFormatted'])) ||
      formatCurrency(totalPayoutsDone),
    raw: stats,
  };
};

const normalizeCommissionOverview = (payload: Record<string, unknown>): CommissionOverview => {
  const stats = normalizeStatsRecord(payload);
  const commissionRate = toNumberValue(pickFirstValue(stats, ['commissionRate']));

  return {
    commissionRate,
    commissionPercent:
      toStringValue(pickFirstValue(stats, ['commissionPercent'])) ||
      `${Math.round(commissionRate * 100)}%`,
    sellerReceives:
      toStringValue(pickFirstValue(stats, ['sellerReceives'])) ||
      `${Math.max(100 - Math.round(commissionRate * 100), 0)}%`,
    raw: stats,
  };
};

const normalizeSellerSettlementSummary = (
  payload: Record<string, unknown>,
): SellerSettlementSummary => {
  const stats = getRecord(pickFirstValue(payload, ['summary', 'data.summary']) ?? payload);
  const totalEarned = toNumberValue(pickFirstValue(stats, ['totalEarned']));
  const totalPending = toNumberValue(pickFirstValue(stats, ['totalPending']));
  const totalHeld = toNumberValue(pickFirstValue(stats, ['totalHeld']));

  return {
    totalEarned,
    totalEarnedFormatted:
      toStringValue(pickFirstValue(stats, ['totalEarned'])) || formatCurrency(totalEarned),
    totalPending,
    totalPendingFormatted:
      toStringValue(pickFirstValue(stats, ['totalPending'])) || formatCurrency(totalPending),
    totalHeld,
    totalHeldFormatted:
      toStringValue(pickFirstValue(stats, ['totalHeld'])) || formatCurrency(totalHeld),
    raw: stats,
  };
};

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

export const fetchProductStats = async (): Promise<ProductStats> => {
  const payload = await tryGetPayload('/api/v1/admin/products/stats');

  if (!payload) {
    return normalizeProductStats({});
  }

  return normalizeProductStats(payload);
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
): Promise<OrderStats> => {
  const payload = await tryGetPayload(buildPath('/api/v1/admin/orders/stats', params));

  if (!payload) {
    return normalizeOrderStats({});
  }

  return normalizeOrderStats(payload);
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
        ? normalizeSettlementSummary({ stats: rawStats as Record<string, unknown> })
        : normalizeSettlementSummary({}),
  };
};

export const fetchPayoutSummary = async (): Promise<SettlementSummary> => {
  const payload = await tryGetPayload('/api/v1/admin/settlements/summary');

  if (!payload) {
    return normalizeSettlementSummary({});
  }

  return normalizeSettlementSummary(payload);
};

export const fetchCommissionOverview = async (): Promise<CommissionOverview> => {
  const payload = await tryGetPayload('/api/v1/admin/settlements/commission');

  if (!payload) {
    return normalizeCommissionOverview({});
  }

  return normalizeCommissionOverview(payload);
};

export const fetchSellerSettlement = async (
  sellerId: string,
): Promise<{
  seller: AdminSeller | null;
  payouts: AdminListResult<AdminPayout>;
  summary: SellerSettlementSummary;
}> => {
  const sellerPayload = await tryGetPayload(`/api/v1/admin/settlements/seller/${sellerId}`);

  if (sellerPayload) {
    return {
      seller: pickFirstValue(sellerPayload, ['seller', 'data.seller'])
        ? normalizeSingle(sellerPayload, ['seller', 'data.seller'], normalizeSeller)
        : null,
      payouts: normalizePayoutList(sellerPayload),
      summary: normalizeSellerSettlementSummary(sellerPayload),
    };
  }

  const payouts = await fetchPayoutPage({ sellerId });
  return {
    seller: null,
    payouts,
    summary: normalizeSellerSettlementSummary({}),
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
