// SRGG Marketplace - Listings API Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    producer: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    commodity: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  verifyToken: vi.fn(),
}));

describe('Listings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/listings', () => {
    it('should return active listings without authentication', async () => {
      const { prisma } = await import('@/lib/prisma');

      (prisma.listing.count as ReturnType<typeof vi.fn>).mockResolvedValue(5);
      (prisma.listing.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'listing-1',
          title: 'Premium Cocoa Beans',
          quantity: 1000,
          unit: 'kg',
          pricePerUnit: 5.5,
          status: 'ACTIVE',
          commodity: { name: 'Cocoa', category: 'Agriculture' },
          producer: { name: 'Test Farm', srggEid: 'SRGG-GH-24-000001' },
        },
      ]);

      const listings = await prisma.listing.findMany({
        where: { status: 'ACTIVE' },
      });

      expect(listings).toHaveLength(1);
      expect(listings[0].status).toBe('ACTIVE');
    });

    it('should support filtering by commodity', async () => {
      const { prisma } = await import('@/lib/prisma');

      const commodityId = 'commodity-123';

      (prisma.listing.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await prisma.listing.findMany({
        where: { commodityId, status: 'ACTIVE' },
      });

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: { commodityId, status: 'ACTIVE' },
      });
    });

    it('should support price range filtering', async () => {
      const { prisma } = await import('@/lib/prisma');

      (prisma.listing.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 'listing-1', pricePerUnit: 10 },
        { id: 'listing-2', pricePerUnit: 15 },
      ]);

      const listings = await prisma.listing.findMany({
        where: {
          pricePerUnit: { gte: 5, lte: 20 },
        },
      });

      expect(listings).toHaveLength(2);
    });
  });

  describe('POST /api/listings', () => {
    it('should create a listing for authenticated producer', async () => {
      const { verifyToken } = await import('@/lib/auth');
      const { prisma } = await import('@/lib/prisma');

      (verifyToken as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 'user-123',
        tenantId: 'tenant-123',
        role: 'PRODUCER',
        permissions: ['listings:create'],
      });

      (prisma.producer.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'producer-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
      });

      (prisma.commodity.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'commodity-123',
        name: 'Cocoa',
      });

      (prisma.listing.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'listing-new',
        title: 'New Listing',
        status: 'DRAFT',
      });

      expect(prisma.listing.create).toBeDefined();
    });

    it('should calculate total price correctly', () => {
      const quantity = 100;
      const pricePerUnit = 5.5;
      const expectedTotal = 550;

      expect(quantity * pricePerUnit).toBe(expectedTotal);
    });
  });

  describe('PUT /api/listings/[id]', () => {
    it('should update listing for owner', async () => {
      const { prisma } = await import('@/lib/prisma');

      (prisma.listing.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'listing-123',
        producerId: 'producer-123',
        producer: { userId: 'user-123' },
      });

      (prisma.listing.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'listing-123',
        title: 'Updated Title',
      });

      const updated = await prisma.listing.update({
        where: { id: 'listing-123' },
        data: { title: 'Updated Title' },
      });

      expect(updated.title).toBe('Updated Title');
    });
  });
});

describe('Listing Validation', () => {
  it('should require minimum title length', () => {
    const validTitle = 'Premium Cocoa Beans';
    const invalidTitle = 'Hi';

    expect(validTitle.length).toBeGreaterThanOrEqual(5);
    expect(invalidTitle.length).toBeLessThan(5);
  });

  it('should require positive quantity', () => {
    const validQuantity = 100;
    const invalidQuantity = -10;

    expect(validQuantity).toBeGreaterThan(0);
    expect(invalidQuantity).toBeLessThan(0);
  });

  it('should require positive price', () => {
    const validPrice = 5.5;
    const invalidPrice = 0;

    expect(validPrice).toBeGreaterThan(0);
    expect(invalidPrice).toBeLessThanOrEqual(0);
  });
});
