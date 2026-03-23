import type { ISeller } from './seller.types';

export interface IUpstreamMediaAsset {
  publicId: string;
  url: string;
}

export interface IUpstreamSellerDocument {
  type: string;
  url: string;
  publicId: string;
}

export interface IUpstreamSellerAddress {
  billingAddress: string;
  pickupAddress: string;
  pinCode: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

export interface IUpstreamBankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
}

export interface IUpstreamSellerProfileData {
  businessName: string;
  shippingMethod: string;
  tcAccepted: boolean;
  address: IUpstreamSellerAddress;
  bankDetails: IUpstreamBankDetails;
  documents: IUpstreamSellerDocument[];
  approvalMessage?: string;
  rejectionMessage?: string;
}

export interface IUpstreamShoppingPreferences {
  categories: string[];
  savedAt?: string;
  updatedAt?: string;
}

export interface IUpstreamGlobalBargainSettings {
  enabled: boolean;
  autoAcceptDiscount: number;
  maximumDiscount: number;
}

export interface IUpstreamFollowRecord {
  id: string;
  username: string;
  profilePicUrl: string | null;
  productsCount: number;
  isSeller: boolean;
}

export interface IUpstreamProductImage {
  publicId: string;
  url: string;
  id?: string;
}

export interface IUpstreamProductSummary {
  id: string;
  categoryType: string;
  likeCount: number;
  condition: string;
  images: IUpstreamProductImage[];
  name: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  category: string;
  isLiked: boolean;
  isSaved?: boolean;
}

export interface IUpstreamBitSummary {
  id: string;
  title: string;
  description: string;
  video?: IUpstreamMediaAsset;
  thumbnail?: IUpstreamMediaAsset;
  hashtags: string[];
  products: string[];
  userId?: string;
  likes: string[];
  likeCount: number;
  shareLink?: string;
  viewCount: number;
  shareCount: number;
  revenue?: number;
  orders?: number;
  isActive?: boolean;
  comments?: unknown[];
  createdAt?: string;
  isTrending?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface IUpstreamBargainProduct {
  id?: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number | null;
  stock: number;
  isSold: boolean;
}

export interface IUpstreamBargainPricing {
  originalPrice: number;
  offeredPrice: number;
  currentPrice: number;
  discountPercentage: number;
  totalValue: number;
}

export interface IUpstreamBargainDates {
  created?: string;
  expires?: string;
  responded?: string | null;
  updated?: string;
}

export interface IUpstreamBargainSummary {
  id: string;
  product: IUpstreamBargainProduct;
  pricing: IUpstreamBargainPricing;
  variant?: Record<string, string | number | boolean | null>;
  quantity: number;
  status: string;
  statusLabel: string;
  role: string;
  requiresAction: boolean;
  isExpired: boolean;
  notes: {
    buyer: string;
    seller: string;
  };
  counterOffer?: unknown;
  buyerCounter?: unknown;
  autoAccepted?: boolean;
  orderPlaced?: boolean;
  orderId?: string | null;
  dates: IUpstreamBargainDates;
}

export interface IManagedSellerDetail {
  seller: ISeller;
  profilePic?: IUpstreamMediaAsset;
  username: string;
  countryCode: string;
  phone: string;
  email: string;
  gender: string;
  categoryType: string;
  sellerStatusRaw: string;
  sellerProfile: IUpstreamSellerProfileData;
  globalBargainSettings?: IUpstreamGlobalBargainSettings;
  shoppingPreferences?: IUpstreamShoppingPreferences;
  followers: IUpstreamFollowRecord[];
  following: IUpstreamFollowRecord[];
  followerCount: number;
  reviewsCount: number;
  productsSoldCount: number;
  customerRating: number;
  savedBits: IUpstreamBitSummary[];
  savedProducts: IUpstreamProductSummary[];
  likedProducts: string[];
  isAdmin: boolean;
  createdAt?: string;
  dob?: string;
  isFollowing: boolean;
  sellingProducts: IUpstreamProductSummary[];
  uploadedBits: IUpstreamBitSummary[];
  upcomingLives: unknown[];
  reviews: unknown[];
  bargainsWithSeller: IUpstreamBargainSummary[];
  searchHistory: Array<{
    query: string;
    createdAt?: string;
  }>;
}
