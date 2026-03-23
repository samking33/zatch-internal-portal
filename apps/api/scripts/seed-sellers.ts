import mongoose, { Types } from 'mongoose';

import { connectToDatabase } from '../src/config/db';
import { AuditLog } from '../src/modules/audit/audit.model';
import { AdminUser } from '../src/modules/auth/auth.model';
import { Seller } from '../src/modules/sellers/seller.model';
import { AuditAction, Role, SellerStatus, type ISellerLocation } from '@zatch/shared';

process.env.JWT_ACCESS_SECRET ??= 'zatch-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'zatch-refresh-secret';
process.env.SESSION_SECRET ??= 'zatch-session-secret';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
process.env.MOBILE_API_KEY ??= 'zatch-mobile-api-key';
process.env.CLOUDINARY_CLOUD_NAME ??= 'demo';

type SeedStatus = 'pending' | 'approved' | 'rejected';

type SeedEntry = {
  seller: Record<string, unknown>;
  auditLogs: Array<Record<string, unknown>>;
};

const locations: ISellerLocation[] = [
  { street: '42 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001', lat: 18.5204, lng: 73.8567 },
  { street: '12 FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411004', lat: 18.5308, lng: 73.8475 },
  { street: '101 Linking Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', lat: 19.0596, lng: 72.8295 },
  { street: '8 Brigade Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', lat: 12.9719, lng: 77.6208 },
  { street: '55 Indiranagar 100 Feet Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', lat: 12.9784, lng: 77.6408 },
  { street: '14 Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', lat: 28.6315, lng: 77.2167 },
  { street: '7 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', lat: 22.5522, lng: 88.3526 },
  { street: '88 Banjara Hills Road 12', city: 'Hyderabad', state: 'Telangana', pincode: '500034', lat: 17.4126, lng: 78.4392 },
  { street: '33 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', lat: 13.0604, lng: 80.2642 },
  { street: '22 MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', lat: 26.9124, lng: 75.7873 },
  { street: '17 Ashram Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', lat: 23.0385, lng: 72.5667 },
  { street: '5 Marine Drive', city: 'Kochi', state: 'Kerala', pincode: '682011', lat: 9.9816, lng: 76.2756 },
  { street: '44 Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', lat: 26.8467, lng: 80.9462 },
  { street: '19 Fraser Road', city: 'Patna', state: 'Bihar', pincode: '800001', lat: 25.5941, lng: 85.1376 },
  { street: '61 Janpath', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001', lat: 20.2961, lng: 85.8245 },
];

const rejectionNotes = [
  'Incomplete KYC documents',
  'GST certificate image unreadable',
  'Business name mismatch',
  'Address verification failed',
  'Invalid enrollment details',
] as const;

const formatIndex = (value: number): string => String(value).padStart(2, '0');

const makeEntry = (
  index: number,
  status: SeedStatus,
  approveActorId: Types.ObjectId,
  approveActorEmail: string,
  rejectActorId: Types.ObjectId,
  rejectActorEmail: string,
): SeedEntry => {
  const location = locations[index];
  if (!location) {
    throw new Error(`Missing seed location for index ${index}`);
  }

  const sellerId = new Types.ObjectId();
  const number = index + 1;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const receivedAt = new Date(Date.UTC(2026, 2, 1 + index, 5 + (index % 8), 15, 0));
  const decisionAt = new Date(receivedAt.getTime() + (18 + index) * 60 * 60 * 1000);
  const rejectedNote = rejectionNotes[index % rejectionNotes.length];

  const statusHistory = [
    {
      status: SellerStatus.PENDING,
      changedBy: null,
      changedAt: receivedAt,
    },
  ];

  if (status === 'approved') {
    statusHistory.push({
      status: SellerStatus.APPROVED,
      changedBy: approveActorId,
      changedAt: decisionAt,
    });
  }

  if (status === 'rejected') {
    statusHistory.push({
      status: SellerStatus.REJECTED,
      changedBy: rejectActorId,
      changedAt: decisionAt,
      note: rejectedNote,
    });
  }

  const auditLogs: Array<Record<string, unknown>> = [
    {
      adminUserId: null,
      adminUserEmail: 'system',
      action: AuditAction.SELLER_SUBMITTED,
      targetId: sellerId,
      targetCollection: 'sellers',
      metadata: {
        source: 'mobile_app',
        seed: true,
      },
      createdAt: receivedAt,
      updatedAt: receivedAt,
    },
  ];

  if (status === 'approved') {
    auditLogs.push({
      adminUserId: approveActorId,
      adminUserEmail: approveActorEmail,
      action: AuditAction.SELLER_APPROVED,
      targetId: sellerId,
      targetCollection: 'sellers',
      metadata: {
        previousStatus: SellerStatus.PENDING,
        nextStatus: SellerStatus.APPROVED,
        seed: true,
      },
      createdAt: decisionAt,
      updatedAt: decisionAt,
    });
  }

  if (status === 'rejected') {
    auditLogs.push({
      adminUserId: rejectActorId,
      adminUserEmail: rejectActorEmail,
      action: AuditAction.SELLER_REJECTED,
      targetId: sellerId,
      targetCollection: 'sellers',
      note: rejectedNote,
      metadata: {
        previousStatus: SellerStatus.PENDING,
        nextStatus: SellerStatus.REJECTED,
        seed: true,
      },
      createdAt: decisionAt,
      updatedAt: decisionAt,
    });
  }

  return {
    seller: {
      _id: sellerId,
      sellerName: `${label} Seller ${number}`,
      businessName: `${label} Traders ${number}`,
      email: `${status}.${formatIndex(number)}.seed@zatch.in`,
      phone: `9${String(800000000 + number).padStart(9, '0')}`,
      gstOrEnrollmentId: `GST-SEED-${status.toUpperCase()}-${formatIndex(number)}`,
      location,
      documents: [
        {
          type: 'pan',
          url: `https://example.com/seed/${status}-${number}-pan.png`,
          publicId: `seed/${status}-${number}-pan`,
          uploadedAt: receivedAt,
        },
        {
          type: 'gst_certificate',
          url: `https://example.com/seed/${status}-${number}-gst.png`,
          publicId: `seed/${status}-${number}-gst`,
          uploadedAt: receivedAt,
        },
      ],
      status:
        status === 'approved'
          ? SellerStatus.APPROVED
          : status === 'rejected'
            ? SellerStatus.REJECTED
            : SellerStatus.PENDING,
      source: 'mobile_app',
      statusHistory,
      receivedAt,
      metadata: {
        seed: true,
        seededBy: 'codex',
      },
      createdAt: receivedAt,
      updatedAt: status === 'pending' ? receivedAt : decisionAt,
    },
    auditLogs,
  };
};

const main = async (): Promise<void> => {
  await connectToDatabase();

  const opsAdmin = await AdminUser.findOne({ role: Role.OPS_ADMIN, isActive: true }).lean().exec();
  const superAdmin = await AdminUser.findOne({ role: Role.SUPER_ADMIN, isActive: true }).lean().exec();

  if (!opsAdmin) {
    throw new Error('No active ops_admin found. Cannot seed seller audit actions.');
  }

  const approveActorId = new Types.ObjectId(opsAdmin._id.toString());
  const approveActorEmail = opsAdmin.email;
  const rejectActorId = superAdmin ? new Types.ObjectId(superAdmin._id.toString()) : approveActorId;
  const rejectActorEmail = superAdmin?.email ?? approveActorEmail;

  const entries = [
    ...Array.from({ length: 5 }, (_, index) =>
      makeEntry(index, 'pending', approveActorId, approveActorEmail, rejectActorId, rejectActorEmail),
    ),
    ...Array.from({ length: 5 }, (_, index) =>
      makeEntry(index + 5, 'approved', approveActorId, approveActorEmail, rejectActorId, rejectActorEmail),
    ),
    ...Array.from({ length: 5 }, (_, index) =>
      makeEntry(index + 10, 'rejected', approveActorId, approveActorEmail, rejectActorId, rejectActorEmail),
    ),
  ];

  await AuditLog.deleteMany({});
  await Seller.deleteMany({});

  await Seller.insertMany(entries.map((entry) => entry.seller), { ordered: true });
  await AuditLog.insertMany(entries.flatMap((entry) => entry.auditLogs), { ordered: true });

  const sellerCounts = await Seller.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const auditCount = await AuditLog.countDocuments({});

  process.stdout.write(
    `${JSON.stringify(
      {
        sellersCleared: true,
        auditLogsCleared: true,
        sellersInserted: entries.length,
        auditLogsInserted: auditCount,
        sellerCounts,
      },
      null,
      2,
    )}\n`,
  );

  await mongoose.disconnect();
};

void main().catch(async (error: unknown) => {
  const normalizedError = error instanceof Error ? error : new Error('Unknown seeding error');
  process.stderr.write(`${normalizedError.stack ?? normalizedError.message}\n`);
  await mongoose.disconnect();
  process.exit(1);
});
