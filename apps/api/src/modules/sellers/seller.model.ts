import {
  Schema,
  Types,
  model,
  models,
  type HydratedDocument,
  type Model,
} from 'mongoose';

import {
  SellerStatus,
  type ISeller,
  type ISellerDocument,
  type ISellerLocation,
  type SellerDocumentType,
} from '@zatch/shared';

type SellerStatusHistoryModel = {
  status: SellerStatus;
  changedBy: Types.ObjectId | null;
  changedAt: Date;
  note?: string;
};

type SellerDocumentModel = {
  type: SellerDocumentType;
  url: string;
  publicId: string;
  uploadedAt: Date;
};

type SellerLocationModel = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
};

export interface SellerModelAttributes {
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstOrEnrollmentId: string;
  location?: SellerLocationModel;
  documents: SellerDocumentModel[];
  status: SellerStatus;
  source: 'mobile_app' | 'manual';
  statusHistory: SellerStatusHistoryModel[];
  receivedAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type SellerModelDocument = HydratedDocument<SellerModelAttributes>;

type SellerLeanDocument = SellerModelAttributes & { _id: Types.ObjectId };

const sellerDocumentSubSchema = new Schema<SellerDocumentModel>(
  {
    type: {
      type: String,
      enum: ['pan', 'aadhaar', 'gst_certificate', 'other'],
      required: true,
    },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const statusHistorySubSchema = new Schema<SellerStatusHistoryModel>(
  {
    status: { type: String, enum: Object.values(SellerStatus), required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', default: null },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false },
);

const locationSubSchema = new Schema<SellerLocationModel>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false },
);

const sellerSchema = new Schema<SellerModelAttributes>(
  {
    sellerName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    gstOrEnrollmentId: { type: String, required: true, unique: true, sparse: true },
    location: { type: locationSubSchema, required: true },
    documents: { type: [sellerDocumentSubSchema], default: [] },
    status: { type: String, enum: Object.values(SellerStatus), default: SellerStatus.PENDING },
    source: { type: String, enum: ['mobile_app', 'manual'], default: 'mobile_app' },
    statusHistory: { type: [statusHistorySubSchema], default: [] },
    receivedAt: { type: Date, required: true, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    collection: 'sellers',
    timestamps: true,
  },
);

sellerSchema.index({ status: 1, receivedAt: -1 });
sellerSchema.index({ 'location.state': 1 });
sellerSchema.index({ 'location.city': 1 });
sellerSchema.index({ 'location.pincode': 1 });
sellerSchema.index({ 'location.state': 1, 'location.city': 1 });
sellerSchema.index({ 'location.state': 1, receivedAt: -1 });
sellerSchema.index({ 'location.pincode': 1, receivedAt: -1 });

export const Seller =
  (models.Seller as Model<SellerModelAttributes> | undefined) ??
  model<SellerModelAttributes>('Seller', sellerSchema);

const serializeDocument = (document: SellerDocumentModel): ISellerDocument => ({
  type: document.type,
  url: document.url,
  publicId: document.publicId,
  uploadedAt: document.uploadedAt,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const fallbackLocation = (metadata: unknown): ISellerLocation => {
  const location = isRecord(metadata) && isRecord(metadata.location) ? metadata.location : null;
  const lat = typeof location?.lat === 'number' ? location.lat : null;
  const lng = typeof location?.lng === 'number' ? location.lng : null;

  return {
    street: typeof location?.street === 'string' ? location.street : '',
    city: typeof location?.city === 'string' ? location.city : '',
    state: typeof location?.state === 'string' ? location.state : '',
    pincode: typeof location?.pincode === 'string' ? location.pincode : '',
    lat,
    lng,
  };
};

export const serializeSeller = (seller: SellerModelDocument | SellerLeanDocument): ISeller => {
  const statusHistory = seller.statusHistory.map((entry: SellerStatusHistoryModel) => ({
    status: entry.status,
    changedBy: entry.changedBy ? entry.changedBy.toString() : null,
    changedAt: entry.changedAt,
    ...(entry.note ? { note: entry.note } : {}),
  }));

  return {
    _id: seller._id.toString(),
    sellerName: seller.sellerName,
    businessName: seller.businessName,
    email: seller.email,
    phone: seller.phone,
    gstOrEnrollmentId: seller.gstOrEnrollmentId,
    location:
      seller.location ??
      fallbackLocation(seller.metadata),
    documents: seller.documents.map(serializeDocument),
    status: seller.status,
    source: seller.source,
    statusHistory,
    receivedAt: seller.receivedAt,
    updatedAt: seller.updatedAt,
    ...(seller.metadata ? { metadata: seller.metadata } : {}),
  };
};
