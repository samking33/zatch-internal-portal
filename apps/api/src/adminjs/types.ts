export type DashboardSeriesPoint = {
  label: string;
  count: number;
};

export type StatusCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type SellerLocationPoint = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
};

export type SellerMapRecord = {
  id: string;
  sellerName: string;
  businessName: string;
  gstOrEnrollmentId: string;
  status: string;
  receivedAt: string;
  location: SellerLocationPoint & {
    lat: number;
    lng: number;
  };
};

export type NoLocationSellerRecord = {
  id: string;
  sellerName: string;
  businessName: string;
  gstOrEnrollmentId: string;
  status: string;
  receivedAt: string;
  location: SellerLocationPoint;
};

export type ActivityRecord = {
  id: string;
  action: string;
  actor: string;
  sellerName: string;
  createdAt: string;
  note?: string;
};

export type DashboardPayload = {
  adminName: string;
  greeting: string;
  dateLabel: string;
  stats: StatusCounts;
  submissions30Days: DashboardSeriesPoint[];
  submissions12Months: DashboardSeriesPoint[];
  recentActivity: ActivityRecord[];
  map: {
    sellers: SellerMapRecord[];
    noLocation: NoLocationSellerRecord[];
  };
};

export type SellerMapPayload = {
  stats: StatusCounts;
  sellers: SellerMapRecord[];
  noLocation: NoLocationSellerRecord[];
};

export type AnalyticsSeriesPoint = {
  label: string;
  submitted: number;
  approved: number;
};

export type CountByLabel = {
  label: string;
  count: number;
};

export type RejectionWord = {
  word: string;
  count: number;
};

export type AnalyticsPayload = {
  stats: StatusCounts;
  topStates: CountByLabel[];
  approvalRate: AnalyticsSeriesPoint[];
  averageActionHours: number | null;
  rejectionWords: RejectionWord[];
  busiestHours: CountByLabel[];
};

export type AuditTimelineRecord = {
  id: string;
  action: string;
  actor: string;
  sellerName: string;
  targetCollection: string;
  targetId: string;
  ipAddress?: string;
  note?: string;
  createdAt: string;
};

export type AuditTimelinePayload = {
  logs: AuditTimelineRecord[];
  actionOptions: string[];
  adminOptions: string[];
};
