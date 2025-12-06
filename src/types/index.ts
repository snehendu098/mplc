// SRGG Marketplace Platform - TypeScript Type Definitions

import {
  User,
  Tenant,
  Producer,
  Parcel,
  Listing,
  Order,
  Token,
  Validation,
  Certificate,
  InsurancePolicy,
  HedgePosition,
  Payment,
  IoTDevice,
} from '@prisma/client';

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Extended Model Types (with relations)
// ============================================================================

export type UserWithRelations = User & {
  tenant: Tenant;
  producer?: Producer;
};

export type ProducerWithRelations = Producer & {
  tenant: Tenant;
  user: User;
  parcels: Parcel[];
  listings: Listing[];
};

export type ListingWithRelations = Listing & {
  tenant: Tenant;
  producer: Producer;
  commodity: any;
  validations: Validation[];
  tokens: Token[];
  orders: Order[];
};

export type OrderWithRelations = Order & {
  tenant: Tenant;
  buyer: User;
  listing: ListingWithRelations;
  token?: Token;
  payments: Payment[];
};

// ============================================================================
// Request DTOs (Data Transfer Objects)
// ============================================================================

// Auth
export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterProducerRequest {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  type: string;
  govtIds: any[];
  documents: any[];
}

// Producer
export interface CreateProducerRequest {
  tenantId: string;
  userId: string;
  type: string;
  name: string;
  legalName?: string;
  taxId?: string;
  phone: string;
  email?: string;
  address?: string;
  location?: any;
  govtIds: any[];
  documents: any[];
  bankAccount?: any;
}

export interface UpdateProducerRequest {
  name?: string;
  legalName?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: any;
  documents?: any[];
  bankAccount?: any;
}

// Parcel
export interface CreateParcelRequest {
  tenantId: string;
  producerId: string;
  parcelNumber: string;
  area: number;
  unit: string;
  geojson: any;
  landTitle?: string;
  landTitleDoc?: string;
  soilType?: string;
  topography?: string;
  waterAccess?: boolean;
  irrigated?: boolean;
  ownership: string;
}

// Listing
export interface CreateListingRequest {
  tenantId: string;
  producerId: string;
  commodityId: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  qualityGrade?: string;
  harvestDate?: Date;
  availableFrom: Date;
  expiresAt?: Date;
  location: any;
  images?: string[];
  documents?: string[];
  visibility: string;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  quantity?: number;
  pricePerUnit?: number;
  qualityGrade?: string;
  availableFrom?: Date;
  expiresAt?: Date;
  images?: string[];
  status?: string;
  visibility?: string;
}

// Order
export interface CreateOrderRequest {
  tenantId: string;
  buyerId: string;
  listingId: string;
  quantity: number;
  deliveryAddress?: any;
  deliveryDate?: Date;
  notes?: string;
}

// Validation
export interface CreateValidationRequest {
  tenantId: string;
  listingId: string;
  validatorId: string;
  type: string;
  method?: string;
  scheduledAt?: Date;
  notes?: string;
}

export interface UpdateValidationRequest {
  status?: string;
  results?: any;
  qualityScore?: number;
  notes?: string;
  documents?: string[];
}

// Tokenization
export interface TokenizeRequest {
  listingId: string;
  tokenType: string;
  metadata: any;
}

// Insurance
export interface InsuranceQuoteRequest {
  tokenId?: string;
  insuredType: string;
  insuredValue: number;
  currency: string;
  coverageDuration: number; // days
  riskProfile: any;
}

export interface CreateInsurancePolicyRequest {
  tenantId: string;
  tokenId?: string;
  insuredType: string;
  insuredValue: number;
  premium: number;
  currency: string;
  coverageStart: Date;
  coverageEnd: Date;
  riskProfile: any;
  terms: any;
}

export interface CreateInsuranceClaimRequest {
  policyId: string;
  claimType: string;
  claimAmount: number;
  description: string;
  evidence: string[];
  triggerData?: any;
}

// Hedging
export interface CreateHedgePositionRequest {
  tokenId: string;
  positionType: string;
  quantity: number;
  strikePrice: number;
  currency: string;
  expiryDate: Date;
  exchange: string;
}

// Payment
export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
}

// IoT
export interface IoTReadingRequest {
  deviceId: string;
  timestamp: Date;
  readings: Record<string, number>;
  metadata?: any;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListingQueryParams extends PaginationParams {
  commodityId?: string;
  producerId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderQueryParams extends PaginationParams {
  buyerId?: string;
  listingId?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
}

// ============================================================================
// Blockchain Types
// ============================================================================

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  properties: any;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: Date;
}

// ============================================================================
// AI/ML Types
// ============================================================================

export interface PredictionRequest {
  type: 'yield' | 'price' | 'risk' | 'quality';
  commodity: string;
  location: any;
  historicalData: any[];
  features: any;
}

export interface PredictionResponse {
  type: string;
  prediction: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: number;
  }>;
  timestamp: Date;
}

export interface RiskScore {
  overall: number;
  weather: number;
  market: number;
  logistics: number;
  quality: number;
  factors: string[];
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalProducers: number;
  activeListings: number;
  totalOrders: number;
  totalRevenue: number;
  growthRate: number;
}

export interface ProducerDashboard {
  producer: Producer;
  stats: {
    totalListings: number;
    activeListings: number;
    totalOrders: number;
    totalRevenue: number;
    avgRating: number;
  };
  recentListings: Listing[];
  recentOrders: Order[];
}

export interface BuyerDashboard {
  stats: {
    totalOrders: number;
    totalSpent: number;
    activeOrders: number;
  };
  recentOrders: OrderWithRelations[];
  recommendedListings: Listing[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OmitField<T, K extends keyof T> = Omit<T, K>;
