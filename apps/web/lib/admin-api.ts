export const DEFAULT_ADMIN_API_URL = 'https://zatch-i8ln.onrender.com';
export const ADMIN_SESSION_TOKEN_COOKIE = 'zatch_admin_token';
export const ADMIN_SESSION_USER_COOKIE = 'zatch_admin_user';
export const ADMIN_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export type AdminRole = 'super_admin' | 'operation_admin' | 'user' | 'unknown';

export type AdminSessionUser = {
  id: string;
  username: string;
  email: string;
  phone: string;
  countryCode: string;
  role: AdminRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  active: boolean;
  profilePicUrl: string | null;
};

export type AdminDocument = {
  type: string;
  url: string;
  publicId: string;
};

export type AdminSeller = {
  id: string;
  username: string;
  businessName: string;
  email: string;
  phone: string;
  countryCode: string;
  sellerStatus: string;
  active: boolean | null;
  profilePicUrl: string | null;
  approvalMessage: string;
  rejectionMessage: string;
  gstin: string;
  shippingMethod: string;
  createdAt: string;
  updatedAt: string;
  documents: AdminDocument[];
  address: {
    pickupAddress: string;
    billingAddress: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number | null;
    longitude: number | null;
  };
  raw: Record<string, unknown>;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  status: string;
  category: string;
  subCategory: string;
  sellerId: string;
  sellerName: string;
  price: number;
  discountedPrice: number | null;
  totalStock: number;
  likeCount: number;
  viewCount: number;
  saveCount: number;
  images: Array<{ url: string; publicId: string }>;
  createdAt: string;
  updatedAt: string;
  raw: Record<string, unknown>;
};

export type AdminOrder = {
  id: string;
  orderId: string;
  status: string;
  orderType: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  raw: Record<string, unknown>;
};

export type AdminPayout = {
  id: string;
  orderId: string;
  orderRef: string;
  sellerId: string;
  sellerName: string;
  status: string;
  sellerAmount: number;
  commission: number;
  orderTotal: number;
  payoutMode: string;
  adminNote: string;
  holdReason: string;
  failureReason: string;
  createdAt: string;
  approvedAt: string;
  paidAt: string;
  raw: Record<string, unknown>;
};

export type AdminAccount = {
  id: string;
  username: string;
  email: string;
  phone: string;
  countryCode: string;
  role: AdminRole;
  active: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  raw: Record<string, unknown>;
};

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminListResult<T> = {
  items: T[];
  pagination: AdminPagination;
};

export type AdminLoginPayload = {
  accessToken: string;
  user: AdminSessionUser;
};

export type SessionLoginData = {
  user: AdminSessionUser;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const getArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const getValueAtPath = (value: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[segment];
  }, value);

const firstDefined = (value: unknown, paths: string[]): unknown => {
  for (const path of paths) {
    const result = getValueAtPath(value, path);
    if (result !== undefined && result !== null) {
      return result;
    }
  }

  return undefined;
};

export const pickFirstValue = (value: unknown, paths: string[]): unknown => firstDefined(value, paths);

export const pickRecord = (value: unknown, paths: string[]): Record<string, unknown> =>
  getRecord(firstDefined(value, paths));

export const getAdminApiUrl = (): string => {
  const envValue =
    process.env.ADMIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_ADMIN_API_URL;

  return envValue.replace(/\/+$/, '');
};

export const parseJsonResponse = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    return getRecord(parsed);
  } catch {
    return {
      message: text,
    };
  }
};

export const getApiErrorMessage = (
  payload: Record<string, unknown>,
  fallback = 'Request failed',
): string => {
  const messageCandidate = firstDefined(payload, [
    'error',
    'message',
    'details.message',
    'data.message',
  ]);

  if (typeof messageCandidate === 'string' && messageCandidate.trim().length > 0) {
    return messageCandidate;
  }

  return fallback;
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

const toNumberValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toBooleanValue = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizePopulatedName = (value: unknown, fallbackPaths: string[] = []): string => {
  if (typeof value === 'string') {
    return value;
  }

  const record = getRecord(value);
  return toStringValue(
    firstDefined(record, ['username', 'name', 'sellerProfile.businessName', ...fallbackPaths]),
  );
};

const normalizeRoleValue = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

export const normalizeAdminRole = (
  value: unknown,
  fallback: { isAdmin?: boolean; isSuperAdmin?: boolean } = {},
): AdminRole => {
  const roleValue = normalizeRoleValue(toStringValue(value));

  if (roleValue === 'super_admin' || roleValue === 'superadmin' || roleValue === 'owner') {
    return 'super_admin';
  }

  if (
    roleValue === 'operation_admin' ||
    roleValue === 'operational_admin' ||
    roleValue === 'ops_admin' ||
    roleValue === 'opsadmin' ||
    roleValue === 'admin'
  ) {
    return 'operation_admin';
  }

  if (roleValue === 'user' || roleValue === 'viewer') {
    return 'user';
  }

  if (fallback.isSuperAdmin) {
    return 'super_admin';
  }

  if (fallback.isAdmin) {
    return 'operation_admin';
  }

  return 'unknown';
};

export const formatAdminRole = (role: AdminRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'operation_admin':
      return 'Operational Admin';
    case 'user':
      return 'User';
    default:
      return 'Unknown';
  }
};

export const normalizeSessionUser = (value: unknown): AdminSessionUser => {
  const record = getRecord(value);
  const profilePic = getRecord(firstDefined(record, ['profilePic']) ?? {});
  const superAdminFlag = toBooleanValue(
    firstDefined(record, ['isSuperAdmin', 'superAdmin']),
    false,
  );
  const adminFlag = toBooleanValue(firstDefined(record, ['isAdmin', 'admin']), superAdminFlag);
  const role = normalizeAdminRole(firstDefined(record, ['role']), {
    isAdmin: adminFlag,
    isSuperAdmin: superAdminFlag,
  });
  const isSuperAdmin = role === 'super_admin' || superAdminFlag;
  const isAdmin = isSuperAdmin || role === 'operation_admin' || adminFlag;

  return {
    id: toStringValue(firstDefined(record, ['_id', 'id'])),
    username: toStringValue(firstDefined(record, ['username', 'name'])) || 'Admin',
    email: toStringValue(firstDefined(record, ['email'])),
    phone: toStringValue(firstDefined(record, ['phone', 'mobileNumber'])),
    countryCode: toStringValue(firstDefined(record, ['countryCode'])),
    role,
    isAdmin,
    isSuperAdmin,
    active: toBooleanValue(firstDefined(record, ['active', 'isActive']), true),
    profilePicUrl: toStringValue(firstDefined(profilePic, ['url'])) || null,
  };
};

export const canAccessPortal = (user: AdminSessionUser): boolean =>
  user.active && (user.role === 'super_admin' || user.role === 'operation_admin');

export const canManageAdmins = (user: AdminSessionUser): boolean =>
  user.role === 'super_admin';

const normalizeDocument = (value: unknown): AdminDocument => {
  const record = getRecord(value);

  return {
    type: toStringValue(firstDefined(record, ['type'])) || 'document',
    url: toStringValue(firstDefined(record, ['url'])),
    publicId: toStringValue(firstDefined(record, ['public_id', 'publicId'])),
  };
};

export const normalizeSeller = (value: unknown): AdminSeller => {
  const record = getRecord(value);
  const sellerProfile = getRecord(firstDefined(record, ['sellerProfile']));
  const address = getRecord(firstDefined(sellerProfile, ['address']));
  const profilePic = getRecord(firstDefined(record, ['profilePic']));
  const documents = getArray(firstDefined(sellerProfile, ['documents']));
  const billingAddress = toStringValue(firstDefined(address, ['billingAddress']));
  const pickupAddress = toStringValue(firstDefined(address, ['pickupAddress']));
  const city =
    toStringValue(firstDefined(address, ['city'])) ||
    billingAddress ||
    pickupAddress;

  return {
    id: toStringValue(firstDefined(record, ['_id', 'id'])),
    username: toStringValue(firstDefined(record, ['username', 'name'])) || 'Unknown seller',
    businessName:
      toStringValue(firstDefined(sellerProfile, ['businessName'])) ||
      toStringValue(firstDefined(record, ['businessName'])) ||
      'Not provided',
    email: toStringValue(firstDefined(record, ['email'])),
    phone: toStringValue(firstDefined(record, ['phone'])),
    countryCode: toStringValue(firstDefined(record, ['countryCode'])),
    sellerStatus: toStringValue(firstDefined(record, ['sellerStatus', 'status'])) || 'unknown',
    active:
      firstDefined(record, ['active', 'isActive']) === undefined
        ? null
        : toBooleanValue(firstDefined(record, ['active', 'isActive'])),
    profilePicUrl: toStringValue(firstDefined(profilePic, ['url'])) || null,
    approvalMessage: toStringValue(firstDefined(sellerProfile, ['approvalMessage'])),
    rejectionMessage: toStringValue(firstDefined(sellerProfile, ['rejectionMessage'])),
    gstin: toStringValue(firstDefined(sellerProfile, ['gstin'])),
    shippingMethod: toStringValue(firstDefined(sellerProfile, ['shippingMethod'])),
    createdAt: toStringValue(firstDefined(record, ['createdAt'])),
    updatedAt: toStringValue(firstDefined(record, ['updatedAt'])),
    documents: documents.map(normalizeDocument),
    address: {
      pickupAddress,
      billingAddress,
      city,
      state: toStringValue(firstDefined(address, ['state'])),
      pincode: toStringValue(firstDefined(address, ['pinCode', 'pincode'])),
      latitude: toNullableNumber(firstDefined(address, ['latitude', 'lat'])),
      longitude: toNullableNumber(firstDefined(address, ['longitude', 'lng'])),
    },
    raw: record,
  };
};

const normalizeImage = (value: unknown): { url: string; publicId: string } => {
  const record = getRecord(value);

  return {
    url: toStringValue(firstDefined(record, ['url'])),
    publicId: toStringValue(firstDefined(record, ['public_id', 'publicId'])),
  };
};

export const normalizeProduct = (value: unknown): AdminProduct => {
  const record = getRecord(value);
  const seller = firstDefined(record, ['sellerId']);
  const images = getArray(firstDefined(record, ['images']));

  return {
    id: toStringValue(firstDefined(record, ['_id', 'id'])),
    name: toStringValue(firstDefined(record, ['name'])) || 'Untitled product',
    description: toStringValue(firstDefined(record, ['description'])),
    status: toStringValue(firstDefined(record, ['status'])) || 'unknown',
    category: toStringValue(firstDefined(record, ['category'])) || 'uncategorized',
    subCategory: toStringValue(firstDefined(record, ['subCategory'])),
    sellerId: toStringValue(firstDefined(getRecord(seller), ['_id', 'id'])) || toStringValue(seller),
    sellerName: normalizePopulatedName(seller),
    price: toNumberValue(firstDefined(record, ['price'])),
    discountedPrice:
      firstDefined(record, ['discountedPrice']) === undefined
        ? null
        : toNumberValue(firstDefined(record, ['discountedPrice'])),
    totalStock: toNumberValue(firstDefined(record, ['totalStock'])),
    likeCount: toNumberValue(firstDefined(record, ['likeCount'])),
    viewCount: toNumberValue(firstDefined(record, ['viewCount'])),
    saveCount: toNumberValue(firstDefined(record, ['saveCount'])),
    images: images.map(normalizeImage),
    createdAt: toStringValue(firstDefined(record, ['createdAt'])),
    updatedAt: toStringValue(firstDefined(record, ['updatedAt'])),
    raw: record,
  };
};

export const normalizeOrder = (value: unknown): AdminOrder => {
  const record = getRecord(value);
  const buyer = getRecord(firstDefined(record, ['buyerId']));
  const seller = firstDefined(record, ['sellerId']);
  const pricing = getRecord(firstDefined(record, ['pricing']));
  const payment = getRecord(firstDefined(record, ['payment']));
  const deliveryAddress = getRecord(firstDefined(record, ['deliveryAddress']));
  const items = getArray(firstDefined(record, ['items']));

  return {
    id: toStringValue(firstDefined(record, ['_id', 'id'])),
    orderId: toStringValue(firstDefined(record, ['orderId'])) || 'Unknown order',
    status: toStringValue(firstDefined(record, ['status'])) || 'unknown',
    orderType: toStringValue(firstDefined(record, ['orderType'])),
    paymentStatus: toStringValue(firstDefined(payment, ['status'])),
    paymentMethod: toStringValue(firstDefined(payment, ['method'])),
    total: toNumberValue(firstDefined(pricing, ['total'])),
    subtotal: toNumberValue(firstDefined(pricing, ['subtotal'])),
    discount: toNumberValue(firstDefined(pricing, ['discount'])),
    shipping: toNumberValue(firstDefined(pricing, ['shipping'])),
    tax: toNumberValue(firstDefined(pricing, ['tax'])),
    buyerName: toStringValue(firstDefined(buyer, ['username', 'name'])) || 'Buyer',
    buyerPhone: toStringValue(firstDefined(buyer, ['phone'])),
    sellerId: toStringValue(firstDefined(getRecord(seller), ['_id', 'id'])) || toStringValue(seller),
    sellerName: normalizePopulatedName(seller),
    itemCount: items.length,
    createdAt: toStringValue(firstDefined(record, ['createdAt'])),
    updatedAt: toStringValue(firstDefined(record, ['updatedAt'])),
    deliveryCity: toStringValue(firstDefined(deliveryAddress, ['city'])),
    deliveryState: toStringValue(firstDefined(deliveryAddress, ['state'])),
    deliveryPincode: toStringValue(firstDefined(deliveryAddress, ['pincode'])),
    raw: record,
  };
};

export const normalizePayout = (value: unknown): AdminPayout => {
  const record = getRecord(value);
  const seller = firstDefined(record, ['sellerId']);

  return {
    id: toStringValue(firstDefined(record, ['_id', 'id'])),
    orderId:
      toStringValue(firstDefined(getRecord(firstDefined(record, ['orderId'])), ['_id', 'id'])) ||
      toStringValue(firstDefined(record, ['orderId'])),
    orderRef: toStringValue(firstDefined(record, ['orderRef'])),
    sellerId: toStringValue(firstDefined(getRecord(seller), ['_id', 'id'])) || toStringValue(seller),
    sellerName: normalizePopulatedName(seller, ['sellerProfile.businessName']) || 'Seller',
    status: toStringValue(firstDefined(record, ['status'])) || 'unknown',
    sellerAmount: toNumberValue(firstDefined(record, ['sellerAmount'])),
    commission: toNumberValue(firstDefined(record, ['commission'])),
    orderTotal: toNumberValue(firstDefined(record, ['orderTotal'])),
    payoutMode: toStringValue(firstDefined(record, ['payoutMode'])) || 'UPI',
    adminNote: toStringValue(firstDefined(record, ['adminNote'])),
    holdReason: toStringValue(firstDefined(record, ['holdReason'])),
    failureReason: toStringValue(firstDefined(record, ['failureReason'])),
    createdAt: toStringValue(firstDefined(record, ['createdAt'])),
    approvedAt: toStringValue(firstDefined(record, ['approvedAt'])),
    paidAt: toStringValue(firstDefined(record, ['paidAt'])),
    raw: record,
  };
};

export const normalizeAdminAccount = (value: unknown): AdminAccount => {
  const user = normalizeSessionUser(value);
  const record = getRecord(value);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    role: user.role,
    active: user.active,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    createdAt: toStringValue(firstDefined(record, ['createdAt'])),
    raw: record,
  };
};

export const normalizePagination = (
  value: unknown,
  itemCount: number,
  fallbackLimit = itemCount || 20,
): AdminPagination => {
  const record = getRecord(value);
  const page = toNumberValue(firstDefined(record, ['currentPage', 'page'])) || 1;
  const limit = toNumberValue(firstDefined(record, ['limit'])) || fallbackLimit || 20;
  const total = toNumberValue(firstDefined(record, ['total', 'totalOrders'])) || itemCount;
  const totalPages =
    toNumberValue(firstDefined(record, ['totalPages'])) ||
    Math.max(1, Math.ceil((total || itemCount || 1) / Math.max(limit, 1)));

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

export const normalizeListResult = <T>(
  payload: Record<string, unknown>,
  itemPaths: string[],
  paginationPaths: string[],
  normalizeItem: (value: unknown) => T,
): AdminListResult<T> => {
  const items = getArray(firstDefined(payload, itemPaths)).map(normalizeItem);
  const pagination = normalizePagination(firstDefined(payload, paginationPaths), items.length);

  return {
    items,
    pagination,
  };
};

export const normalizeLoginPayload = (payload: Record<string, unknown>): AdminLoginPayload => {
  const accessToken = toStringValue(firstDefined(payload, ['token', 'data.token', 'accessToken']));
  const user =
    firstDefined(payload, ['user', 'data.user', 'admin', 'data.admin']) ??
    {};

  return {
    accessToken,
    user: normalizeSessionUser(user),
  };
};

export const normalizeStatsRecord = (payload: Record<string, unknown>): Record<string, unknown> => {
  const record = getRecord(firstDefined(payload, ['stats', 'summary', 'data.stats', 'data.summary']));
  return Object.keys(record).length > 0 ? record : payload;
};

export const normalizeSellerList = (payload: Record<string, unknown>): AdminListResult<AdminSeller> =>
  normalizeListResult(
    payload,
    ['data.sellers', 'sellers', 'data.items', 'items'],
    ['data.pagination', 'pagination'],
    normalizeSeller,
  );

export const normalizeProductList = (
  payload: Record<string, unknown>,
): AdminListResult<AdminProduct> =>
  normalizeListResult(
    payload,
    ['data.products', 'products', 'data.items', 'items'],
    ['data.pagination', 'pagination'],
    normalizeProduct,
  );

export const normalizeOrderList = (payload: Record<string, unknown>): AdminListResult<AdminOrder> =>
  normalizeListResult(
    payload,
    ['data.orders', 'orders', 'data.items', 'items'],
    ['data.pagination', 'pagination'],
    normalizeOrder,
  );

export const normalizePayoutList = (
  payload: Record<string, unknown>,
): AdminListResult<AdminPayout> =>
  normalizeListResult(
    payload,
    ['data.payouts', 'payouts', 'data.items', 'items'],
    ['data.pagination', 'pagination'],
    normalizePayout,
  );

export const normalizeAdminList = (
  payload: Record<string, unknown>,
): AdminListResult<AdminAccount> =>
  normalizeListResult(
    payload,
    ['data.admins', 'admins', 'data.users', 'users', 'data.items', 'items'],
    ['data.pagination', 'pagination'],
    normalizeAdminAccount,
  );

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

export const getStatusLabel = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const buildSearchParams = (
  params: Record<string, string | number | boolean | undefined | null>,
): string => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    search.set(key, String(value));
  });

  return search.toString();
};
