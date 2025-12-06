import { prisma } from '@/lib/prisma';
import type {
  CreateProducerRequest,
  UpdateProducerRequest,
  ProducerWithRelations,
} from '@/types';

export class ProducerService {
  async createProducer(data: CreateProducerRequest) {
    // Generate unique SRGG Economic ID
    const srggEid = await this.generateSRGGEID(data.tenantId);

    const producer = await prisma.producer.create({
      data: {
        ...data,
        srggEid,
        verificationStatus: 'PENDING',
      },
      include: {
        tenant: true,
        user: true,
        parcels: true,
      },
    });

    return producer;
  }

  async getProducer(id: string): Promise<ProducerWithRelations | null> {
    return await prisma.producer.findUnique({
      where: { id },
      include: {
        tenant: true,
        user: true,
        parcels: true,
        listings: {
          where: { status: 'ACTIVE' },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getProducerBySRGGEID(srggEid: string) {
    return await prisma.producer.findUnique({
      where: { srggEid },
      include: {
        tenant: true,
        user: true,
        parcels: true,
      },
    });
  }

  async getProducersByTenant(tenantId: string, options?: any) {
    const { page = 1, limit = 20, type, verificationStatus } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (type) where.type = type;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const [producers, total] = await Promise.all([
      prisma.producer.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.producer.count({ where }),
    ]);

    return {
      producers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProducer(id: string, data: UpdateProducerRequest) {
    const producer = await prisma.producer.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        tenant: true,
        user: true,
        parcels: true,
      },
    });

    return producer;
  }

  async verifyProducer(id: string, verifiedBy: string) {
    return await prisma.producer.update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy,
      },
    });
  }

  async rejectProducer(id: string, reason: string) {
    return await prisma.producer.update({
      where: { id },
      data: {
        verificationStatus: 'REJECTED',
        metadata: { rejectionReason: reason },
      },
    });
  }

  async updateRating(id: string, newRating: number) {
    const producer = await prisma.producer.findUnique({ where: { id } });
    if (!producer) throw new Error('Producer not found');

    // Calculate new average rating
    const currentRating = producer.rating || 0;
    const updatedRating = (currentRating + newRating) / 2;

    return await prisma.producer.update({
      where: { id },
      data: { rating: updatedRating },
    });
  }

  private async generateSRGGEID(tenantId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    const countryCode = tenant.country;
    const producerCount = await prisma.producer.count({ where: { tenantId } });
    const sequence = (producerCount + 1).toString().padStart(6, '0');
    const year = new Date().getFullYear().toString().slice(-2);

    return `SRGG-${countryCode}-${year}-${sequence}`;
  }

  async getProducerDashboard(producerId: string) {
    const [producer, stats, recentListings, recentOrders] = await Promise.all([
      this.getProducer(producerId),
      this.getProducerStats(producerId),
      this.getRecentListings(producerId),
      this.getRecentOrders(producerId),
    ]);

    return {
      producer,
      stats,
      recentListings,
      recentOrders,
    };
  }

  private async getProducerStats(producerId: string) {
    const [
      totalListings,
      activeListings,
      totalOrders,
      revenueData,
    ] = await Promise.all([
      prisma.listing.count({ where: { producerId } }),
      prisma.listing.count({ where: { producerId, status: 'ACTIVE' } }),
      prisma.order.count({
        where: { listing: { producerId } },
      }),
      prisma.order.aggregate({
        where: {
          listing: { producerId },
          status: 'COMPLETED',
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
      select: { rating: true },
    });

    return {
      totalListings,
      activeListings,
      totalOrders,
      totalRevenue: revenueData._sum.totalPrice || 0,
      avgRating: producer?.rating || 0,
    };
  }

  private async getRecentListings(producerId: string, limit = 5) {
    return await prisma.listing.findMany({
      where: { producerId },
      include: {
        commodity: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async getRecentOrders(producerId: string, limit = 5) {
    return await prisma.order.findMany({
      where: { listing: { producerId } },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, commodity: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const producerService = new ProducerService();
