export enum SellerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type SellerDocumentType = 'pan' | 'aadhaar' | 'gst_certificate' | 'other';

export interface ISellerLocation {
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
}

export interface IStatusHistoryEntry {
  status: SellerStatus;
  changedBy: string | null;
  changedAt: Date;
  note?: string;
}

export interface ISellerDocument {
  type: SellerDocumentType;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface ISeller {
  _id: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstOrEnrollmentId: string;
  location: ISellerLocation;
  documents: ISellerDocument[];
  status: SellerStatus;
  source: 'mobile_app' | 'manual';
  statusHistory: IStatusHistoryEntry[];
  receivedAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export type SellerListStatus = SellerStatus | 'all';

export interface ISellerStateStats {
  state: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ISellerCityStats {
  city: string;
  state: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ISellerPincodeStats {
  pincode: string;
  city: string;
  state: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
