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

export type AdminSellerRecord = {
  id: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstOrEnrollmentId: string;
  status: string;
  receivedAt: string;
  updatedAt: string;
  location: SellerLocationPoint;
  documentsCount: number;
  lastStatusAt?: string;
  lastStatusNote?: string;
  upstream: {
    username?: string;
    shippingMethod?: string;
    profilePicUrl?: string;
    rawSellerStatus?: string;
  };
};

export type SellerDirectoryPayload = {
  stats: StatusCounts;
  sellers: AdminSellerRecord[];
  details: Record<
    string,
    {
      username: string;
      email: string;
      phone: string;
      countryCode: string;
      gender: string;
      categoryType: string;
      sellerStatusRaw: string;
      followerCount: number;
      reviewsCount: number;
      productsSoldCount: number;
      customerRating: number;
      isFollowing: boolean;
      isAdmin: boolean;
      createdAt?: string;
      dob?: string;
      sellerProfile: {
        businessName: string;
        shippingMethod: string;
        tcAccepted: boolean;
        address: {
          billingAddress: string;
          pickupAddress: string;
          pinCode: string;
          state: string;
          latitude: number | null;
          longitude: number | null;
        };
        bankDetails: {
          accountHolderName: string;
          accountNumber: string;
          bankName: string;
          ifscCode: string;
          upiId: string;
        };
        documents: Array<{
          type: string;
          url: string;
          publicId: string;
        }>;
        approvalMessage?: string;
        rejectionMessage?: string;
      };
      globalBargainSettings?: {
        enabled: boolean;
        autoAcceptDiscount: number;
        maximumDiscount: number;
      };
      shoppingPreferences?: {
        categories: string[];
        savedAt?: string;
        updatedAt?: string;
      };
      followers: Array<{
        id: string;
        username: string;
        profilePicUrl: string | null;
        productsCount: number;
        isSeller: boolean;
      }>;
      following: Array<{
        id: string;
        username: string;
        profilePicUrl: string | null;
        productsCount: number;
        isSeller: boolean;
      }>;
      savedProducts: Array<{
        id: string;
        name: string;
        category: string;
        price: number;
        discountedPrice: number | null;
      }>;
      sellingProducts: Array<{
        id: string;
        name: string;
        category: string;
        price: number;
        discountedPrice: number | null;
      }>;
      uploadedBits: Array<{
        id: string;
        title: string;
        createdAt?: string;
        viewCount: number;
        likeCount: number;
      }>;
      savedBits: Array<{
        id: string;
        title: string;
        createdAt?: string;
        viewCount: number;
        likeCount: number;
      }>;
      bargainsWithSeller: Array<{
        id: string;
        status: string;
        statusLabel: string;
        role: string;
        productName: string;
        currentPrice: number;
        createdAt?: string;
      }>;
    }
  >;
};
