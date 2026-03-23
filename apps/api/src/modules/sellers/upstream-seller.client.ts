import mongoose, { type Connection } from 'mongoose';
import type { Collection } from 'mongodb';

import {
  SellerStatus,
  type IManagedSellerDetail,
  type ISeller,
  type ISellerDocument,
  type ISellerLocation,
  type IUpstreamBargainSummary,
  type IUpstreamBitSummary,
  type IUpstreamFollowRecord,
  type IUpstreamMediaAsset,
  type IUpstreamProductImage,
  type IUpstreamProductSummary,
  type IUpstreamSellerDocument,
  type PaginatedResult,
  type SellerListStatus,
} from '@zatch/shared';

import { getEnv } from '../../config/env';
import { AppError } from '../../lib/app-error';

type ExternalSellerStatus = 'buyer' | 'pending' | 'approved' | 'rejected' | 'active';

type ExternalMediaAsset = {
  public_id?: string;
  url?: string;
};

type ExternalSellerDocument = {
  type?: string;
  url?: string;
  public_id?: string;
};

type ExternalSellerAddress = {
  pickupAddress?: string;
  billingAddress?: string;
  pinCode?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
};

type ExternalSellerProfile = {
  businessName?: string;
  gstin?: string;
  address?: ExternalSellerAddress;
  shippingMethod?: string;
  documents?: ExternalSellerDocument[];
  approvalMessage?: string;
  rejectionMessage?: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    upiId?: string;
  };
  tcAccepted?: boolean;
};

type ExternalSellerListRecord = {
  _id: string | { toString(): string };
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  sellerProfile?: ExternalSellerProfile;
  sellerStatus?: ExternalSellerStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  profilePic?: ExternalMediaAsset;
  gender?: string;
  categoryType?: string;
  followerCount?: number;
  reviewsCount?: number;
  productsSoldCount?: number;
  customerRating?: number;
  isAdmin?: boolean;
};

type ExternalFollowRecord = {
  id?: string;
  username?: string;
  profilePicUrl?: string | null;
  productsCount?: number;
  isSeller?: boolean;
};

type ExternalProductImage = {
  public_id?: string;
  url?: string;
  _id?: string;
};

type ExternalProductSummary = {
  _id?: string;
  categoryType?: string;
  likeCount?: number;
  condition?: string;
  images?: ExternalProductImage[];
  name?: string;
  description?: string;
  price?: number;
  discountedPrice?: number | null;
  category?: string;
  isLiked?: boolean;
  isSaved?: boolean;
};

type ExternalBitSummary = {
  _id?: string;
  title?: string;
  description?: string;
  video?: ExternalMediaAsset;
  thumbnail?: ExternalMediaAsset;
  hashtags?: string[];
  products?: string[];
  userId?: string;
  likes?: string[];
  likeCount?: number;
  shareLink?: string;
  viewCount?: number;
  shareCount?: number;
  revenue?: number;
  orders?: number;
  isActive?: boolean;
  comments?: unknown[];
  createdAt?: string;
  isTrending?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
};

type ExternalBargainSummary = {
  _id?: string;
  product?: {
    id?: string;
    name?: string;
    image?: string;
    originalPrice?: number;
    discountedPrice?: number | null;
    stock?: number;
    isSold?: boolean;
  };
  pricing?: {
    originalPrice?: number;
    offeredPrice?: number;
    currentPrice?: number;
    discountPercentage?: number;
    totalValue?: number;
  };
  variant?: Record<string, string | number | boolean | null>;
  quantity?: number;
  status?: string;
  statusLabel?: string;
  role?: string;
  requiresAction?: boolean;
  isExpired?: boolean;
  notes?: {
    buyer?: string;
    seller?: string;
  };
  counterOffer?: unknown;
  buyerCounter?: unknown;
  autoAccepted?: boolean;
  orderPlaced?: boolean;
  orderId?: string | null;
  dates?: {
    created?: string;
    expires?: string;
    responded?: string | null;
    updated?: string;
  };
};

type ExternalSellerDetailRecord = ExternalSellerListRecord & {
  globalBargainSettings?: {
    enabled?: boolean;
    autoAcceptDiscount?: number;
    maximumDiscount?: number;
  };
  shoppingPreferences?: {
    categories?: string[];
    savedAt?: string;
    updatedAt?: string;
  };
  followers?: ExternalFollowRecord[];
  following?: ExternalFollowRecord[];
  savedBits?: ExternalBitSummary[];
  savedProducts?: ExternalProductSummary[];
  likedProducts?: string[];
  createdAt?: string;
  dob?: string;
  isFollowing?: boolean;
  sellingProducts?: ExternalProductSummary[];
  uploadedBits?: ExternalBitSummary[];
  upcomingLives?: unknown[];
  reviews?: unknown[];
  bargainsWithSeller?: ExternalBargainSummary[];
  searchHistory?: Array<{ query?: string; createdAt?: string } | string>;
};

type ExternalProfileResponse = {
  success: boolean;
  message?: string;
  user?: ExternalSellerDetailRecord;
};

type ExternalApprovalResponse = {
  success: boolean;
  message?: string;
};

type UpstreamListFilters = {
  status?: SellerListStatus;
  states?: string[];
  city?: string;
  pincode?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
};

let upstreamConnectionPromise: Promise<Connection> | null = null;

const getUpstreamBaseUrl = (): string => {
  const { ZATCH_UPSTREAM_API_URL } = getEnv();

  if (!ZATCH_UPSTREAM_API_URL) {
    throw new AppError(500, 'Upstream seller API URL is not configured');
  }

  return ZATCH_UPSTREAM_API_URL.replace(/\/+$/, '');
};

const getUpstreamToken = (): string => {
  const { ZATCH_UPSTREAM_API_TOKEN } = getEnv();

  if (!ZATCH_UPSTREAM_API_TOKEN) {
    throw new AppError(500, 'Upstream seller API token is not configured');
  }

  return ZATCH_UPSTREAM_API_TOKEN;
};

const getUpstreamConnection = async (): Promise<Connection> => {
  if (upstreamConnectionPromise) {
    return upstreamConnectionPromise;
  }

  const env = getEnv();

  if (!env.ZATCH_UPSTREAM_MONGODB_URI) {
    throw new AppError(500, 'Upstream seller MongoDB URI is not configured');
  }

  upstreamConnectionPromise = mongoose
    .createConnection(env.ZATCH_UPSTREAM_MONGODB_URI, {
      dbName: env.ZATCH_UPSTREAM_MONGODB_DB_NAME,
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10_000,
      autoIndex: false,
    })
    .asPromise()
    .catch((error: unknown) => {
      upstreamConnectionPromise = null;
      throw error;
    });

  return upstreamConnectionPromise;
};

const getUsersCollection = async (): Promise<Collection<ExternalSellerListRecord>> => {
  const connection = await getUpstreamConnection();
  return connection.collection<ExternalSellerListRecord>('users');
};

const toIsoDate = (value: string | Date | undefined): Date => {
  if (!value) {
    return new Date();
  }

  return value instanceof Date ? value : new Date(value);
};

const toStringId = (value: string | { toString(): string }): string =>
  typeof value === 'string' ? value : value.toString();

const normalizeDocumentType = (value?: string): ISellerDocument['type'] => {
  if (value === 'pan' || value === 'gst_certificate' || value === 'other') {
    return value;
  }

  if (value === 'aadhaar' || value === 'aadhar') {
    return 'aadhaar';
  }

  return 'other';
};

const normalizeStatus = (value?: ExternalSellerStatus): SellerStatus => {
  if (value === 'pending') {
    return SellerStatus.PENDING;
  }

  if (value === 'rejected') {
    return SellerStatus.REJECTED;
  }

  return SellerStatus.APPROVED;
};

const mapMediaAsset = (asset?: ExternalMediaAsset): IUpstreamMediaAsset | undefined => {
  if (!asset?.url && !asset?.public_id) {
    return undefined;
  }

  return {
    publicId: asset.public_id ?? '',
    url: asset.url ?? '',
  };
};

const buildLocation = (profile?: ExternalSellerProfile): ISellerLocation => {
  const address = profile?.address;
  const latitude = typeof address?.latitude === 'number' ? address.latitude : null;
  const longitude = typeof address?.longitude === 'number' ? address.longitude : null;
  const primaryAddress = address?.pickupAddress || address?.billingAddress || '';

  return {
    street: primaryAddress,
    city: address?.billingAddress || address?.pickupAddress || '',
    state: address?.state || '',
    pincode: address?.pinCode || '',
    lat: latitude,
    lng: longitude,
  };
};

const buildStatusHistory = (seller: ExternalSellerListRecord | ExternalSellerDetailRecord) => {
  const changedAt = toIsoDate(seller.createdAt);
  const status = normalizeStatus(seller.sellerStatus);
  const note =
    status === SellerStatus.APPROVED
      ? seller.sellerProfile?.approvalMessage
      : status === SellerStatus.REJECTED
        ? seller.sellerProfile?.rejectionMessage
        : undefined;

  return [
    {
      status,
      changedBy: null,
      changedAt,
      ...(note ? { note } : {}),
    },
  ];
};

const mapSeller = (seller: ExternalSellerListRecord | ExternalSellerDetailRecord): ISeller => {
  const location = buildLocation(seller.sellerProfile);
  const createdAt = toIsoDate(seller.createdAt);
  const updatedAt = toIsoDate(seller.updatedAt ?? seller.createdAt);
  const documents = (seller.sellerProfile?.documents ?? []).map((document) => ({
    type: normalizeDocumentType(document.type),
    url: document.url ?? '',
    publicId: document.public_id ?? '',
    uploadedAt: createdAt,
  }));

  return {
    _id: toStringId(seller._id),
    sellerName: seller.name || seller.username || seller.sellerProfile?.businessName || 'Unknown Seller',
    businessName: seller.sellerProfile?.businessName || seller.username || 'Unknown Business',
    email: seller.email || '',
    phone: `${seller.countryCode || ''}${seller.phone || ''}` || seller.phone || '',
    gstOrEnrollmentId: seller.sellerProfile?.gstin || '',
    location,
    documents,
    status: normalizeStatus(seller.sellerStatus),
    source: 'manual',
    statusHistory: buildStatusHistory(seller),
    receivedAt: createdAt,
    updatedAt,
    metadata: {
      upstream: {
        username: seller.username,
        profilePic: mapMediaAsset(seller.profilePic),
        sellerStatus: seller.sellerStatus,
        shippingMethod: seller.sellerProfile?.shippingMethod,
      },
    },
  };
};

const buildDetailPath = (userId: string): string =>
  getEnv().ZATCH_UPSTREAM_SELLER_DETAIL_PATH.replace(':userId', userId);

const buildApprovalPath = (): string => getEnv().ZATCH_UPSTREAM_SELLER_APPROVAL_PATH;

const parseJson = async <T>(response: Response): Promise<T> => response.json() as Promise<T>;

const requestUpstream = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${getUpstreamBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getUpstreamToken()}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const payload = await parseJson<T & { success?: boolean; message?: string }>(response);

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'Upstream seller request failed';
    throw new AppError(response.status, message);
  }

  return payload;
};

const buildStatusFilter = (status?: SellerListStatus): Record<string, unknown> => {
  if (!status || status === SellerStatus.PENDING) {
    return { sellerStatus: 'pending' };
  }

  if (status === SellerStatus.REJECTED) {
    return { sellerStatus: 'rejected' };
  }

  if (status === SellerStatus.APPROVED) {
    return { sellerStatus: { $in: ['approved', 'active'] } };
  }

  return {
    sellerStatus: {
      $in: ['pending', 'approved', 'rejected', 'active'],
    },
  };
};

const mapFollowRecord = (value: ExternalFollowRecord): IUpstreamFollowRecord => ({
  id: value.id ?? '',
  username: value.username ?? 'Unknown user',
  profilePicUrl: value.profilePicUrl ?? null,
  productsCount: value.productsCount ?? 0,
  isSeller: value.isSeller ?? false,
});

const mapProductImage = (image: ExternalProductImage): IUpstreamProductImage => ({
  publicId: image.public_id ?? '',
  url: image.url ?? '',
  ...(image._id ? { id: image._id } : {}),
});

const mapProductSummary = (product: ExternalProductSummary): IUpstreamProductSummary => ({
  id: product._id ?? '',
  categoryType: product.categoryType ?? '',
  likeCount: product.likeCount ?? 0,
  condition: product.condition ?? '',
  images: (product.images ?? []).map(mapProductImage),
  name: product.name ?? 'Untitled product',
  description: product.description ?? '',
  price: product.price ?? 0,
  discountedPrice: product.discountedPrice ?? null,
  category: product.category ?? '',
  isLiked: product.isLiked ?? false,
  ...(typeof product.isSaved === 'boolean' ? { isSaved: product.isSaved } : {}),
});

const mapBitSummary = (bit: ExternalBitSummary): IUpstreamBitSummary => {
  const video = bit.video ? mapMediaAsset(bit.video) : undefined;
  const thumbnail = bit.thumbnail ? mapMediaAsset(bit.thumbnail) : undefined;

  return {
    id: bit._id ?? '',
    title: bit.title ?? 'Untitled bit',
    description: bit.description ?? '',
    ...(video ? { video } : {}),
    ...(thumbnail ? { thumbnail } : {}),
    hashtags: bit.hashtags ?? [],
    products: bit.products ?? [],
    ...(bit.userId ? { userId: bit.userId } : {}),
    likes: bit.likes ?? [],
    likeCount: bit.likeCount ?? 0,
    ...(bit.shareLink ? { shareLink: bit.shareLink } : {}),
    viewCount: bit.viewCount ?? 0,
    shareCount: bit.shareCount ?? 0,
    ...(typeof bit.revenue === 'number' ? { revenue: bit.revenue } : {}),
    ...(typeof bit.orders === 'number' ? { orders: bit.orders } : {}),
    ...(typeof bit.isActive === 'boolean' ? { isActive: bit.isActive } : {}),
    ...(bit.comments ? { comments: bit.comments } : {}),
    ...(bit.createdAt ? { createdAt: bit.createdAt } : {}),
    ...(typeof bit.isTrending === 'boolean' ? { isTrending: bit.isTrending } : {}),
    ...(typeof bit.isLiked === 'boolean' ? { isLiked: bit.isLiked } : {}),
    ...(typeof bit.isSaved === 'boolean' ? { isSaved: bit.isSaved } : {}),
  };
};

const mapBargainSummary = (value: ExternalBargainSummary): IUpstreamBargainSummary => ({
  id: value._id ?? '',
  product: {
    ...(value.product?.id ? { id: value.product.id } : {}),
    name: value.product?.name ?? 'Unknown product',
    image: value.product?.image ?? '',
    originalPrice: value.product?.originalPrice ?? 0,
    discountedPrice: value.product?.discountedPrice ?? null,
    stock: value.product?.stock ?? 0,
    isSold: value.product?.isSold ?? false,
  },
  pricing: {
    originalPrice: value.pricing?.originalPrice ?? 0,
    offeredPrice: value.pricing?.offeredPrice ?? 0,
    currentPrice: value.pricing?.currentPrice ?? 0,
    discountPercentage: value.pricing?.discountPercentage ?? 0,
    totalValue: value.pricing?.totalValue ?? 0,
  },
  ...(value.variant ? { variant: value.variant } : {}),
  quantity: value.quantity ?? 0,
  status: value.status ?? '',
  statusLabel: value.statusLabel ?? '',
  role: value.role ?? '',
  requiresAction: value.requiresAction ?? false,
  isExpired: value.isExpired ?? false,
  notes: {
    buyer: value.notes?.buyer ?? '',
    seller: value.notes?.seller ?? '',
  },
  ...(typeof value.counterOffer !== 'undefined' ? { counterOffer: value.counterOffer } : {}),
  ...(typeof value.buyerCounter !== 'undefined' ? { buyerCounter: value.buyerCounter } : {}),
  ...(typeof value.autoAccepted === 'boolean' ? { autoAccepted: value.autoAccepted } : {}),
  ...(typeof value.orderPlaced === 'boolean' ? { orderPlaced: value.orderPlaced } : {}),
  ...(typeof value.orderId !== 'undefined' ? { orderId: value.orderId } : {}),
  dates: {
    ...(value.dates?.created ? { created: value.dates.created } : {}),
    ...(value.dates?.expires ? { expires: value.dates.expires } : {}),
    ...(typeof value.dates?.responded !== 'undefined' ? { responded: value.dates.responded } : {}),
    ...(value.dates?.updated ? { updated: value.dates.updated } : {}),
  },
});

const mapDetail = (record: ExternalSellerDetailRecord): IManagedSellerDetail => {
  const profilePic = record.profilePic ? mapMediaAsset(record.profilePic) : undefined;

  return {
  seller: mapSeller(record),
  ...(profilePic ? { profilePic } : {}),
  username: record.username ?? '',
  countryCode: record.countryCode ?? '',
  phone: record.phone ?? '',
  email: record.email ?? '',
  gender: record.gender ?? '',
  categoryType: record.categoryType ?? '',
  sellerStatusRaw: record.sellerStatus ?? '',
  sellerProfile: {
    businessName: record.sellerProfile?.businessName ?? '',
    shippingMethod: record.sellerProfile?.shippingMethod ?? '',
    tcAccepted: record.sellerProfile?.tcAccepted ?? false,
    address: {
      billingAddress: record.sellerProfile?.address?.billingAddress ?? '',
      pickupAddress: record.sellerProfile?.address?.pickupAddress ?? '',
      pinCode: record.sellerProfile?.address?.pinCode ?? '',
      state: record.sellerProfile?.address?.state ?? '',
      latitude:
        typeof record.sellerProfile?.address?.latitude === 'number'
          ? record.sellerProfile.address.latitude
          : null,
      longitude:
        typeof record.sellerProfile?.address?.longitude === 'number'
          ? record.sellerProfile.address.longitude
          : null,
    },
    bankDetails: {
      accountHolderName: record.sellerProfile?.bankDetails?.accountHolderName ?? '',
      accountNumber: record.sellerProfile?.bankDetails?.accountNumber ?? '',
      bankName: record.sellerProfile?.bankDetails?.bankName ?? '',
      ifscCode: record.sellerProfile?.bankDetails?.ifscCode ?? '',
      upiId: record.sellerProfile?.bankDetails?.upiId ?? '',
    },
    documents: (record.sellerProfile?.documents ?? []).map(
      (document): IUpstreamSellerDocument => ({
        type: document.type ?? 'other',
        url: document.url ?? '',
        publicId: document.public_id ?? '',
      }),
    ),
    ...(record.sellerProfile?.approvalMessage ? { approvalMessage: record.sellerProfile.approvalMessage } : {}),
    ...(record.sellerProfile?.rejectionMessage ? { rejectionMessage: record.sellerProfile.rejectionMessage } : {}),
  },
  ...(record.globalBargainSettings
    ? {
        globalBargainSettings: {
          enabled: record.globalBargainSettings.enabled ?? false,
          autoAcceptDiscount: record.globalBargainSettings.autoAcceptDiscount ?? 0,
          maximumDiscount: record.globalBargainSettings.maximumDiscount ?? 0,
        },
      }
    : {}),
  ...(record.shoppingPreferences
    ? {
        shoppingPreferences: {
          categories: record.shoppingPreferences.categories ?? [],
          ...(record.shoppingPreferences.savedAt ? { savedAt: record.shoppingPreferences.savedAt } : {}),
          ...(record.shoppingPreferences.updatedAt ? { updatedAt: record.shoppingPreferences.updatedAt } : {}),
        },
      }
    : {}),
  followers: (record.followers ?? []).map(mapFollowRecord),
  following: (record.following ?? []).map(mapFollowRecord),
  followerCount: record.followerCount ?? 0,
  reviewsCount: record.reviewsCount ?? 0,
  productsSoldCount: record.productsSoldCount ?? 0,
  customerRating: record.customerRating ?? 0,
  savedBits: (record.savedBits ?? []).map(mapBitSummary),
  savedProducts: (record.savedProducts ?? []).map(mapProductSummary),
  likedProducts: record.likedProducts ?? [],
  isAdmin: record.isAdmin ?? false,
  ...(record.createdAt ? { createdAt: record.createdAt } : {}),
  ...(record.dob ? { dob: record.dob } : {}),
  isFollowing: record.isFollowing ?? false,
  sellingProducts: (record.sellingProducts ?? []).map(mapProductSummary),
  uploadedBits: (record.uploadedBits ?? []).map(mapBitSummary),
  upcomingLives: record.upcomingLives ?? [],
  reviews: record.reviews ?? [],
  bargainsWithSeller: (record.bargainsWithSeller ?? []).map(mapBargainSummary),
  searchHistory: (record.searchHistory ?? []).flatMap((entry) => {
    if (typeof entry === 'string') {
      return [{ query: entry }];
    }

    if (entry && typeof entry === 'object' && typeof entry.query === 'string') {
      return [
        {
          query: entry.query,
          ...(entry.createdAt ? { createdAt: entry.createdAt } : {}),
        },
      ];
    }

    return [];
  }),
  };
};

export class UpstreamSellerClient {
  public async listSellers(query: UpstreamListFilters): Promise<PaginatedResult<ISeller>> {
    const collection = await getUsersCollection();
    const page = query.page;
    const limit = Math.min(query.limit, 100);
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
      ...buildStatusFilter(query.status),
    };

    if (query.states && query.states.length > 0) {
      filter['sellerProfile.address.state'] = { $in: query.states };
    }

    if (query.city) {
      filter.$or = [
        { 'sellerProfile.address.billingAddress': { $regex: query.city, $options: 'i' } },
        { 'sellerProfile.address.pickupAddress': { $regex: query.city, $options: 'i' } },
      ];
    }

    if (query.pincode) {
      filter['sellerProfile.address.pinCode'] = query.pincode;
    }

    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: query.from } : {}),
        ...(query.to ? { $lte: query.to } : {}),
      };
    }

    const [records, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      items: records.map(mapSeller),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  public async getSellerById(userId: string): Promise<ISeller> {
    const detail = await this.getSellerDetailById(userId);
    return detail.seller;
  }

  public async getSellerDetailById(userId: string): Promise<IManagedSellerDetail> {
    const payload = await requestUpstream<ExternalProfileResponse>(buildDetailPath(userId), {
      method: 'GET',
    });

    if (!payload.user) {
      throw new AppError(404, 'Seller not found in upstream system');
    }

    return mapDetail(payload.user);
  }

  public async updateStatus(input: {
    sellerId: string;
    action: 'approve' | 'reject';
    note?: string;
  }): Promise<ISeller> {
    const status = input.action === 'approve' ? 'approved' : 'rejected';

    await requestUpstream<ExternalApprovalResponse>(buildApprovalPath(), {
      method: 'POST',
      body: JSON.stringify({
        userId: input.sellerId,
        status,
        ...(input.action === 'approve' && input.note ? { approvalMessage: input.note } : {}),
        ...(input.action === 'reject' && input.note ? { rejectionMessage: input.note } : {}),
      }),
    });

    return this.getSellerById(input.sellerId);
  }

  public async listAllSellers(): Promise<ISeller[]> {
    const collection = await getUsersCollection();
    const records = await collection
      .find({
        sellerStatus: {
          $in: ['pending', 'approved', 'rejected', 'active'],
        },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return records.map(mapSeller);
  }
}
