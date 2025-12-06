-- SRGG Marketplace Database Schema

CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "country" TEXT NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "status" TEXT DEFAULT 'ACTIVE',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT DEFAULT 'PRODUCER',
  "permissions" TEXT DEFAULT '[]',
  "status" TEXT DEFAULT 'ACTIVE',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "lastLoginAt" DATETIME,
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  UNIQUE("tenantId", "email")
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Producer" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT UNIQUE NOT NULL,
  "srggEid" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "rating" REAL DEFAULT 0,
  "verificationStatus" TEXT DEFAULT 'PENDING',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Parcel" (
  "id" TEXT PRIMARY KEY,
  "producerId" TEXT NOT NULL,
  "parcelNumber" TEXT NOT NULL,
  "area" REAL NOT NULL,
  "unit" TEXT DEFAULT 'hectares',
  "location" TEXT DEFAULT '{}',
  "ownership" TEXT NOT NULL,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Commodity" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "category" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Listing" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "producerId" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "quantity" REAL NOT NULL,
  "unit" TEXT NOT NULL,
  "pricePerUnit" REAL NOT NULL,
  "totalPrice" REAL NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "status" TEXT DEFAULT 'DRAFT',
  "location" TEXT DEFAULT '{}',
  "images" TEXT DEFAULT '[]',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE,
  FOREIGN KEY ("commodityId") REFERENCES "Commodity"("id")
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "buyerId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "quantity" REAL NOT NULL,
  "pricePerUnit" REAL NOT NULL,
  "totalPrice" REAL NOT NULL,
  "currency" TEXT NOT NULL,
  "status" TEXT DEFAULT 'PENDING',
  "paymentStatus" TEXT DEFAULT 'PENDING',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  FOREIGN KEY ("buyerId") REFERENCES "User"("id"),
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
);

CREATE TABLE IF NOT EXISTS "Token" (
  "id" TEXT PRIMARY KEY,
  "listingId" TEXT NOT NULL,
  "tokenType" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "status" TEXT DEFAULT 'ACTIVE',
  "metadata" TEXT DEFAULT '{}',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
);

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "paymentNumber" TEXT UNIQUE NOT NULL,
  "amount" REAL NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
);

CREATE TABLE IF NOT EXISTS "Certificate" (
  "id" TEXT PRIMARY KEY,
  "certificateNumber" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "issuedTo" TEXT NOT NULL,
  "issuedBy" TEXT NOT NULL,
  "issuedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" DATETIME,
  "status" TEXT DEFAULT 'ACTIVE',
  "metadata" TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS "InsurancePolicy" (
  "id" TEXT PRIMARY KEY,
  "policyNumber" TEXT UNIQUE NOT NULL,
  "insuredValue" REAL NOT NULL,
  "premium" REAL NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "coverageStart" DATETIME NOT NULL,
  "coverageEnd" DATETIME NOT NULL,
  "status" TEXT DEFAULT 'ACTIVE',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);
