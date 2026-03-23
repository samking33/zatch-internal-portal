import path from 'path';

import bcrypt from 'bcrypt';
import type { Router } from 'express';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Types } from 'mongoose';

import { Role, SellerStatus } from '@zatch/shared';

import { getEnv } from '../config/env';
import { logger } from '../middleware/logger.middleware';
import { AuditLog } from '../modules/audit/audit.model';
import { AdminUser } from '../modules/auth/auth.model';
import { Seller } from '../modules/sellers/seller.model';
import { createAdminJsComponents } from './components';
import { createAdminJsResources } from './resources';
import type {
  ActivityRecord,
  AnalyticsPayload,
  AnalyticsSeriesPoint,
  AuditTimelinePayload,
  AuditTimelineRecord,
  DashboardPayload,
  DashboardSeriesPoint,
  NoLocationSellerRecord,
  SellerLocationPoint,
  SellerMapPayload,
  SellerMapRecord,
  StatusCounts,
} from './types';

type AdminJsSetupResult = {
  adminRouter: Router;
  rootPath: string;
};

type AdminJsCurrentAdmin = {
  email: string;
  role: Role;
  id: string;
};

type AdminJsInstance = {
  options: {
    rootPath: string;
  };
  watch: () => Promise<void> | void;
};

type AdminJsConstructor = {
  new (options: Record<string, unknown>): AdminJsInstance;
  registerAdapter: (adapter: { Database: unknown; Resource: unknown }) => void;
};

type ComponentLoaderLike = {
  add: (name: string, filePath: string) => string;
  override: (name: string, filePath: string) => string;
};

type ComponentLoaderConstructor = new () => ComponentLoaderLike;

type BuildAuthenticatedRouter = (
  admin: AdminJsInstance,
  auth: {
    authenticate: (email: string, password: string) => Promise<AdminJsCurrentAdmin | null>;
    cookieName: string;
    cookiePassword: string;
  },
  predefinedRouter: Router | null,
  sessionOptions: session.SessionOptions,
) => Router;

type PageContext = {
  currentAdmin?: AdminJsCurrentAdmin;
};

type SellerQueryDocument = {
  _id: Types.ObjectId;
  sellerName: string;
  businessName: string;
  gstOrEnrollmentId: string;
  status: SellerStatus;
  receivedAt: Date;
  location?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    lat: number | null;
    lng: number | null;
  };
  statusHistory: Array<{
    status: SellerStatus;
    changedAt: Date;
    note?: string;
  }>;
  metadata?: unknown;
};

type SellerNameDocument = {
  _id: Types.ObjectId;
  sellerName: string;
  businessName: string;
};

type AuditQueryDocument = {
  _id: Types.ObjectId;
  action: string;
  adminUserEmail: string;
  targetId: Types.ObjectId;
  targetCollection: string;
  note?: string;
  ipAddress?: string;
  createdAt: Date;
};

let cachedAdminRouter: AdminJsSetupResult | null = null;

const theme = {
  colors: {
    navBackground: '#2d3a4a',
    navHover: '#34495e',
    navSelected: '#3c4f63',
    navAccent: '#3b82f6',
    backgroundLight: '#f4f6f9',
    white: '#ffffff',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#10b981',
    successLight: '#d1fae5',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    text: '#1f2937',
    grey: '#6b7280',
    greyLight: '#e5e7eb',
  },
  shadows: {
    card: '0 1px 3px rgba(0,0,0,0.08)',
  },
  borders: {
    default: '1px solid #e5e7eb',
  },
};

const runtimeImport = <T>(modulePath: string): Promise<T> =>
  Function('modulePath', 'return import(modulePath)')(modulePath) as Promise<T>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
};

const formatDateLabel = (): string =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

const buildStatusCounts = (sellers: SellerQueryDocument[]): StatusCounts => ({
  total: sellers.length,
  pending: sellers.filter((seller) => seller.status === SellerStatus.PENDING).length,
  approved: sellers.filter((seller) => seller.status === SellerStatus.APPROVED).length,
  rejected: sellers.filter((seller) => seller.status === SellerStatus.REJECTED).length,
});

const extractLocation = (seller: SellerQueryDocument): SellerLocationPoint | null => {
  if (seller.location) {
    return {
      street: seller.location.street,
      city: seller.location.city,
      state: seller.location.state,
      pincode: seller.location.pincode,
      lat: seller.location.lat,
      lng: seller.location.lng,
    };
  }

  const metadata = seller.metadata;
  if (!isRecord(metadata)) {
    return null;
  }

  const location = metadata.location;

  if (!isRecord(location)) {
    return null;
  }

  const lat = location.lat;
  const lng = location.lng;

  return {
    street: typeof location.street === 'string' ? location.street : '',
    city: typeof location.city === 'string' ? location.city : '',
    state: typeof location.state === 'string' ? location.state : '',
    pincode: typeof location.pincode === 'string' ? location.pincode : '',
    lat: typeof lat === 'number' ? lat : null,
    lng: typeof lng === 'number' ? lng : null,
  };
};

const buildSellerMapPayload = (sellers: SellerQueryDocument[]): SellerMapPayload => {
  const withLocation: SellerMapRecord[] = [];
  const noLocation: NoLocationSellerRecord[] = [];

  sellers.forEach((seller) => {
    const location = extractLocation(seller);

    if (!location) {
      return;
    }

    if (typeof location.lat === 'number' && typeof location.lng === 'number') {
      withLocation.push({
        id: seller._id.toString(),
        sellerName: seller.sellerName,
        businessName: seller.businessName,
        gstOrEnrollmentId: seller.gstOrEnrollmentId,
        status: seller.status,
        receivedAt: seller.receivedAt.toISOString(),
        location: {
          ...location,
          lat: location.lat,
          lng: location.lng,
        },
      });
      return;
    }

    noLocation.push({
      id: seller._id.toString(),
      sellerName: seller.sellerName,
      businessName: seller.businessName,
      gstOrEnrollmentId: seller.gstOrEnrollmentId,
      status: seller.status,
      receivedAt: seller.receivedAt.toISOString(),
      location,
    });
  });

  return {
    stats: buildStatusCounts(sellers),
    sellers: withLocation,
    noLocation,
  };
};

const buildDailySeries = (sellers: SellerQueryDocument[]): DashboardSeriesPoint[] => {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' });
  const buckets = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
      count: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sellers.forEach((seller) => {
    const key = seller.receivedAt.toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.count += 1;
    }
  });

  return buckets.map(({ label, count }) => ({ label, count }));
};

const buildMonthlySeries = (sellers: SellerQueryDocument[]): DashboardSeriesPoint[] => {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - index));

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatter.format(date),
      count: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sellers.forEach((seller) => {
    const key = `${seller.receivedAt.getFullYear()}-${seller.receivedAt.getMonth()}`;
    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.count += 1;
    }
  });

  return buckets.map(({ label, count }) => ({ label, count }));
};

const buildAnalyticsSeries = (sellers: SellerQueryDocument[]): AnalyticsSeriesPoint[] => {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (11 - index));

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatter.format(date),
      submitted: 0,
      approved: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sellers.forEach((seller) => {
    const receivedKey = `${seller.receivedAt.getFullYear()}-${seller.receivedAt.getMonth()}`;
    const submittedBucket = bucketMap.get(receivedKey);
    if (submittedBucket) {
      submittedBucket.submitted += 1;
    }

    const approvedEntry = seller.statusHistory.find((entry) => entry.status === SellerStatus.APPROVED);
    if (approvedEntry) {
      const approvedKey = `${approvedEntry.changedAt.getFullYear()}-${approvedEntry.changedAt.getMonth()}`;
      const approvedBucket = bucketMap.get(approvedKey);
      if (approvedBucket) {
        approvedBucket.approved += 1;
      }
    }
  });

  return buckets.map(({ label, submitted, approved }) => ({ label, submitted, approved }));
};

const fetchSellerQueryDocuments = async (): Promise<SellerQueryDocument[]> =>
  (await Seller.find({}, 'sellerName businessName gstOrEnrollmentId status receivedAt statusHistory location metadata')
    .lean()
    .exec()) as SellerQueryDocument[];

const fetchSellerNames = async (sellerIds: string[]): Promise<Map<string, string>> => {
  if (sellerIds.length === 0) {
    return new Map();
  }

  const names = (await Seller.find(
    { _id: { $in: sellerIds } },
    'sellerName businessName',
  )
    .lean()
    .exec()) as SellerNameDocument[];

  return new Map(
    names.map((seller) => [
      seller._id.toString(),
      seller.businessName || seller.sellerName,
    ]),
  );
};

const buildActivityRecords = async (
  logs: AuditQueryDocument[],
): Promise<ActivityRecord[]> => {
  const sellerIds = [
    ...new Set(
      logs
        .filter((log) => log.targetCollection === 'sellers')
        .map((log) => log.targetId.toString()),
    ),
  ];

  const sellerNames = await fetchSellerNames(sellerIds);

  return logs.map((log) => ({
    id: log._id.toString(),
    action: log.action,
    actor: log.adminUserEmail,
    sellerName:
      sellerNames.get(log.targetId.toString()) ??
      (log.targetCollection === 'admin_users' ? log.adminUserEmail : log.targetCollection),
    createdAt: log.createdAt.toISOString(),
    ...(log.note ? { note: log.note } : {}),
  }));
};

const buildDashboardPayload = async (
  currentAdmin?: AdminJsCurrentAdmin,
): Promise<DashboardPayload> => {
  const [sellers, recentLogs] = await Promise.all([
    fetchSellerQueryDocuments(),
    AuditLog.find({}, 'action adminUserEmail targetId targetCollection note createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec() as Promise<AuditQueryDocument[]>,
  ]);

  return {
    adminName: currentAdmin?.email ?? 'Admin',
    greeting: getGreeting(),
    dateLabel: formatDateLabel(),
    stats: buildStatusCounts(sellers),
    submissions30Days: buildDailySeries(sellers),
    submissions12Months: buildMonthlySeries(sellers),
    recentActivity: await buildActivityRecords(recentLogs),
    map: buildSellerMapPayload(sellers),
  };
};

const buildAnalyticsPayload = async (): Promise<AnalyticsPayload> => {
  const sellers = await fetchSellerQueryDocuments();
  const stats = buildStatusCounts(sellers);
  const stateCounts = new Map<string, number>();
  const busiestHours = Array.from({ length: 24 }, (_, hour) => ({
    label: hour.toString().padStart(2, '0'),
    count: 0,
  }));
  const actionDurations: number[] = [];
  const rejectionWords = new Map<string, number>();
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'that',
    'this',
    'from',
    'have',
    'docs',
    'doc',
    'not',
    'are',
    'was',
    'seller',
    'missing',
  ]);

  sellers.forEach((seller) => {
    const location = extractLocation(seller);
    if (location?.state) {
      stateCounts.set(location.state, (stateCounts.get(location.state) ?? 0) + 1);
    }

    const hourBucket = busiestHours[seller.receivedAt.getHours()];
    if (hourBucket) {
      hourBucket.count += 1;
    }

    const firstAction = seller.statusHistory.find((entry) => entry.status !== SellerStatus.PENDING);
    if (firstAction) {
      const diffHours =
        (firstAction.changedAt.getTime() - seller.receivedAt.getTime()) / (1000 * 60 * 60);
      if (Number.isFinite(diffHours) && diffHours >= 0) {
        actionDurations.push(diffHours);
      }
    }

    seller.statusHistory
      .filter((entry) => entry.status === SellerStatus.REJECTED && entry.note)
      .forEach((entry) => {
        entry.note
          ?.toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length >= 4 && !stopWords.has(word))
          .forEach((word) => {
            rejectionWords.set(word, (rejectionWords.get(word) ?? 0) + 1);
          });
      });
  });

  const averageActionHours =
    actionDurations.length > 0
      ? actionDurations.reduce((sum, value) => sum + value, 0) / actionDurations.length
      : null;

  return {
    stats,
    topStates: [...stateCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 10),
    approvalRate: buildAnalyticsSeries(sellers),
    averageActionHours,
    rejectionWords: [...rejectionWords.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 24),
    busiestHours,
  };
};

const buildAuditTimelinePayload = async (): Promise<AuditTimelinePayload> => {
  const logs = (await AuditLog.find({}, 'action adminUserEmail targetId targetCollection note ipAddress createdAt')
    .sort({ createdAt: -1 })
    .limit(250)
    .lean()
    .exec()) as AuditQueryDocument[];

  const sellerIds = [
    ...new Set(
      logs
        .filter((log) => log.targetCollection === 'sellers')
        .map((log) => log.targetId.toString()),
    ),
  ];

  const sellerNames = await fetchSellerNames(sellerIds);

  const timelineLogs: AuditTimelineRecord[] = logs.map((log) => ({
    id: log._id.toString(),
    action: log.action,
    actor: log.adminUserEmail,
    sellerName:
      sellerNames.get(log.targetId.toString()) ??
      (log.targetCollection === 'admin_users' ? log.adminUserEmail : log.targetCollection),
    targetCollection: log.targetCollection,
    targetId: log.targetId.toString(),
    createdAt: log.createdAt.toISOString(),
    ...(log.note ? { note: log.note } : {}),
    ...(log.ipAddress ? { ipAddress: log.ipAddress } : {}),
  }));

  return {
    logs: timelineLogs,
    actionOptions: [...new Set(logs.map((log) => log.action))].sort(),
    adminOptions: [...new Set(logs.map((log) => log.adminUserEmail))].sort(),
  };
};

const authenticate = async (
  email: string,
  password: string,
): Promise<AdminJsCurrentAdmin | null> => {
  const user = await AdminUser.findOne({ email, isActive: true }).exec();

  if (!user) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid || user.role !== Role.SUPER_ADMIN) {
    return null;
  }

  return {
    email: user.email,
    role: user.role,
    id: user._id.toString(),
  };
};

export const setupAdminJs = async (): Promise<AdminJsSetupResult> => {
  if (cachedAdminRouter) {
    return cachedAdminRouter;
  }

  const [adminJsModule, adminJsExpressModule, adminJsMongooseModule] =
    await Promise.all([
      runtimeImport<{ default: unknown; ComponentLoader: ComponentLoaderConstructor }>('adminjs'),
      runtimeImport<{ buildAuthenticatedRouter: unknown }>('@adminjs/express'),
      runtimeImport<{ Resource: unknown; Database: unknown }>('@adminjs/mongoose'),
    ]);
  const AdminJS = adminJsModule.default;
  const { componentLoader, Components } = createAdminJsComponents(adminJsModule.ComponentLoader);
  const AdminJSExpress = adminJsExpressModule;
  const AdminJSMongoose = adminJsMongooseModule;

  (AdminJS as unknown as AdminJsConstructor).registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  });

  const admin = new (AdminJS as unknown as AdminJsConstructor)({
    rootPath: '/admin',
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
      handler: async (_request: unknown, _response: unknown, context: PageContext) =>
        buildDashboardPayload(context.currentAdmin),
    },
    pages: {
      home: {
        icon: 'Home',
        component: Components.Dashboard,
        handler: async (_request: unknown, _response: unknown, context: PageContext) =>
          buildDashboardPayload(context.currentAdmin),
      },
      'seller-map': {
        icon: 'Map',
        component: Components.SellerMap,
        handler: async () => buildSellerMapPayload(await fetchSellerQueryDocuments()),
      },
      'seller-analytics': {
        icon: 'ChartBar',
        component: Components.SellerAnalytics,
        handler: async () => buildAnalyticsPayload(),
      },
      'audit-timeline': {
        icon: 'List',
        component: Components.AuditTimeline,
        handler: async () => buildAuditTimelinePayload(),
      },
    },
    resources: createAdminJsResources(),
    branding: {
      logo: '/zatch-logo.png',
      companyName: 'Zatch Admin',
      favicon: '/zatch-logo.png',
      withMadeWithLove: false,
      theme,
    },
    assets: {
      styles: ['/admin-custom.css'],
    },
    locale: {
      translations: {
        pages: {
          home: 'Home',
          'seller-map': 'Seller Map',
          'seller-analytics': 'Analytics',
          'audit-timeline': 'Audit Timeline',
        },
      },
    },
  });

  if (getEnv().NODE_ENV === 'development') {
    await admin.watch();
  }

  const predefinedRouter = express.Router();

  const adminRouter = (AdminJSExpress.buildAuthenticatedRouter as BuildAuthenticatedRouter)(
    admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: getEnv().SESSION_SECRET,
    },
    predefinedRouter,
    {
      secret: getEnv().SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: 'adminjs',
      store: MongoStore.create({
        mongoUrl: getEnv().MONGODB_URI,
        collectionName: 'adminjs_sessions',
      }),
      cookie: {
        httpOnly: true,
        secure: getEnv().NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    },
  );

  cachedAdminRouter = {
    adminRouter,
    rootPath: admin.options.rootPath,
  };

  logger.info('AdminJS configured', {
    rootPath: admin.options.rootPath,
    assetsPath: path.resolve(__dirname, '../../public'),
  });

  return cachedAdminRouter;
};
