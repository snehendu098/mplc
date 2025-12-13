// SRGG Marketplace - Zod Validation Schemas
import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idSchema = z.object({
  id: z.string().cuid(),
});

// ============================================================================
// Producer Schemas
// ============================================================================

export const producerTypeEnum = z.enum([
  'FARMER',
  'MINER',
  'ARTISAN',
  'COOPERATIVE',
  'ENVIRONMENTAL',
]);

export const createProducerSchema = z.object({
  // Personal Info
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number too short').max(20),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  nationality: z.string().min(2).max(50).optional(),

  // Location
  country: z.string().min(2, 'Country is required'),
  region: z.string().min(2, 'Region is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  gpsCoordinates: z.string().optional(),

  // Identity
  idType: z.enum(['national_id', 'passport', 'voters_id', 'drivers_license']),
  idNumber: z.string().min(5, 'ID number is required'),

  // Producer Details
  producerType: producerTypeEnum,
  businessName: z.string().optional(),
  yearsExperience: z.string().optional(),
  commodities: z.array(z.string()).min(1, 'Select at least one commodity'),

  // Parcels/Assets
  parcels: z.array(z.object({
    name: z.string().optional(),
    size: z.number().positive(),
    unit: z.enum(['hectares', 'acres', 'sq_meters']).default('hectares'),
    location: z.string().optional(),
    gpsCoordinates: z.string().optional(),
  })).optional().default([]),

  // Biometric consent
  biometricConsent: z.boolean().default(false),
});

export const updateProducerSchema = createProducerSchema.partial();

// ============================================================================
// Listing Schemas
// ============================================================================

export const listingStatusEnum = z.enum([
  'DRAFT',
  'PENDING',
  'ACTIVE',
  'SOLD',
  'CANCELLED',
  'EXPIRED',
]);

export const createListingSchema = z.object({
  commodityId: z.string().cuid('Invalid commodity ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  pricePerUnit: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
  location: z.object({
    country: z.string(),
    region: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    gpsCoordinates: z.string().optional(),
  }).optional(),
  images: z.array(z.string().url()).optional().default([]),
  qualityGrade: z.string().optional(),
  harvestDate: z.string().optional(),
  expiryDate: z.string().optional(),
  certifications: z.array(z.string()).optional().default([]),
  status: listingStatusEnum.default('DRAFT'),
});

export const updateListingSchema = createListingSchema.partial();

export const listingQuerySchema = paginationSchema.extend({
  status: listingStatusEnum.optional(),
  commodityId: z.string().optional(),
  producerId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
});

// ============================================================================
// Order Schemas
// ============================================================================

export const orderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
]);

export const paymentStatusEnum = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);

export const createOrderSchema = z.object({
  listingId: z.string().cuid('Invalid listing ID'),
  quantity: z.number().positive('Quantity must be positive'),
  shippingAddress: z.object({
    country: z.string(),
    region: z.string(),
    city: z.string(),
    address: z.string(),
    postalCode: z.string().optional(),
    contactName: z.string(),
    contactPhone: z.string(),
  }).optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// Payment Schemas
// ============================================================================

export const paymentMethodEnum = z.enum([
  'CARD',
  'BANK_TRANSFER',
  'MOBILE_MONEY',
  'CRYPTO',
  'ESCROW',
]);

export const createPaymentSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  method: paymentMethodEnum,
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Tokenization Schemas
// ============================================================================

export const tokenTypeEnum = z.enum(['NFT', 'FUNGIBLE']);

export const tokenizeRequestSchema = z.object({
  listingId: z.string().cuid('Invalid listing ID'),
  tokenType: tokenTypeEnum.default('NFT'),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Insurance Schemas
// ============================================================================

export const insuranceTypeEnum = z.enum([
  'CROP',
  'LIVESTOCK',
  'SHIPPING',
  'MINERAL',
  'CARBON',
  'CULTURAL_IP',
]);

export const createInsurancePolicySchema = z.object({
  type: insuranceTypeEnum,
  assetId: z.string().cuid(),
  assetType: z.enum(['LISTING', 'PARCEL', 'ORDER']),
  coverageAmount: z.number().positive(),
  currency: z.string().default('USD'),
  startDate: z.string(),
  endDate: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Hedging Schemas
// ============================================================================

export const hedgeTypeEnum = z.enum([
  'FORWARD',
  'FUTURES',
  'OPTIONS',
  'SWAP',
]);

export const createHedgePositionSchema = z.object({
  type: hedgeTypeEnum,
  commodity: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  strikePrice: z.number().positive(),
  currency: z.string().default('USD'),
  expiryDate: z.string(),
  direction: z.enum(['LONG', 'SHORT']),
});

// ============================================================================
// Commodity Schemas
// ============================================================================

export const commodityCategoryEnum = z.enum([
  'AGRICULTURE',
  'MINERALS',
  'ENVIRONMENTAL',
  'CULTURAL',
]);

export const createCommoditySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  category: commodityCategoryEnum,
  unit: z.string().min(1, 'Unit is required'),
  hsCode: z.string().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
});

export type CreateCommodityInput = z.infer<typeof createCommoditySchema>;

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['PRODUCER', 'BUYER', 'BROKER']).default('BUYER'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateProducerInput = z.infer<typeof createProducerSchema>;
export type UpdateProducerInput = z.infer<typeof updateProducerSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingQuery = z.infer<typeof listingQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type TokenizeRequest = z.infer<typeof tokenizeRequestSchema>;
export type CreateInsurancePolicyInput = z.infer<typeof createInsurancePolicySchema>;
export type CreateHedgePositionInput = z.infer<typeof createHedgePositionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
