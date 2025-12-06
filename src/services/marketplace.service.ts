import { prisma } from '@/lib/prisma';
import type {
  CreateListingRequest,
  UpdateListingRequest,
  CreateOrderRequest,
  ListingQueryParams,
  ListingWithRelations,
} from '@/types';

export class MarketplaceService {
  // ============================================================================
  // Listing Management
  // ============================================================================

  async createListing(data: CreateListingRequest) {
    const totalPrice = data.quantity * data.pricePerUnit;

    const listing = await prisma.listing.create({
      data: {
        ...data,
        totalPrice,
        status: 'DRAFT',
      },
      include: {
        producer: true,
        commodity: true,
      },
    });

    return listing;
  }

  async getListing(id: string): Promise<ListingWithRelations | null> {
    return await prisma.listing.findUnique({
      where: { id },
      include: {
        tenant: true,
        producer: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        commodity: true,
        validations: {
          include: {
            validator: { select: { id: true, name: true } },
          },
        },
        tokens: true,
        orders: {
          include: {
            buyer: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getListings(params: ListingQueryParams) {
    const {
      page = 1,
      limit = 20,
      commodityId,
      producerId,
      category,
      minPrice,
      maxPrice,
      status = 'ACTIVE',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = { status };

    if (commodityId) where.commodityId = commodityId;
    if (producerId) where.producerId = producerId;
    if (category) where.commodity = { category };
    if (minPrice || maxPrice) {
      where.pricePerUnit = {};
      if (minPrice) where.pricePerUnit.gte = minPrice;
      if (maxPrice) where.pricePerUnit.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          producer: {
            select: { id: true, name: true, rating: true },
          },
          commodity: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateListing(id: string, data: UpdateListingRequest) {
    const updateData: any = { ...data, updatedAt: new Date() };

    if (data.quantity || data.pricePerUnit) {
      const listing = await prisma.listing.findUnique({ where: { id } });
      if (listing) {
        const quantity = data.quantity || listing.quantity;
        const pricePerUnit = data.pricePerUnit || listing.pricePerUnit;
        updateData.totalPrice = quantity * pricePerUnit;
      }
    }

    return await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        producer: true,
        commodity: true,
      },
    });
  }

  async publishListing(id: string) {
    return await prisma.listing.update({
      where: { id },
      data: {
        status: 'PENDING_VALIDATION',
        publishedAt: new Date(),
      },
    });
  }

  async activateListing(id: string) {
    return await prisma.listing.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async deactivateListing(id: string) {
    return await prisma.listing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async markListingAsSold(id: string) {
    return await prisma.listing.update({
      where: { id },
      data: { status: 'SOLD' },
    });
  }

  // ============================================================================
  // Order Management
  // ============================================================================

  async createOrder(data: CreateOrderRequest) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.status !== 'ACTIVE') {
      throw new Error('Listing is not active');
    }

    if (data.quantity > listing.quantity) {
      throw new Error('Insufficient quantity available');
    }

    const pricePerUnit = listing.pricePerUnit;
    const totalPrice = data.quantity * pricePerUnit;
    const currency = listing.currency;

    // Calculate fees
    const platformFee = totalPrice * 0.025; // 2.5%
    const fees = {
      platformFee,
      insuranceFee: 0,
      logisticsFee: 0,
    };

    // Generate order number
    const orderNumber = await this.generateOrderNumber(data.tenantId);

    const order = await prisma.order.create({
      data: {
        ...data,
        orderNumber,
        pricePerUnit,
        totalPrice,
        currency,
        fees,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        listing: {
          include: {
            producer: { select: { id: true, name: true } },
            commodity: true,
          },
        },
      },
    });

    // Update listing quantity
    await prisma.listing.update({
      where: { id: data.listingId },
      data: {
        quantity: listing.quantity - data.quantity,
      },
    });

    return order;
  }

  async getOrder(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        listing: {
          include: {
            producer: {
              include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
              },
            },
            commodity: true,
          },
        },
        token: true,
        payments: true,
      },
    });
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    // If order is completed, mark listing as sold if no quantity left
    if (status === 'COMPLETED') {
      const listing = await prisma.listing.findUnique({
        where: { id: order.listingId },
      });
      if (listing && listing.quantity === 0) {
        await this.markListingAsSold(listing.id);
      }
    }

    return order;
  }

  async cancelOrder(id: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!order) throw new Error('Order not found');

    // Restore listing quantity
    await prisma.listing.update({
      where: { id: order.listingId },
      data: {
        quantity: order.listing.quantity + order.quantity,
      },
    });

    return await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        metadata: { cancellationReason: reason },
      },
    });
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    const orderCount = await prisma.order.count({ where: { tenantId } });
    const sequence = (orderCount + 1).toString().padStart(8, '0');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    return `ORD-${tenant.slug.toUpperCase()}-${date}-${sequence}`;
  }

  // ============================================================================
  // Marketplace Analytics
  // ============================================================================

  async getMarketplaceStats(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    const [
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      revenueData,
    ] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      totalRevenue: revenueData._sum.totalPrice || 0,
      averageOrderValue: completedOrders > 0
        ? (revenueData._sum.totalPrice || 0) / completedOrders
        : 0,
    };
  }

  async getTrendingCommodities(tenantId?: string, limit = 10) {
    const where = tenantId ? { tenantId } : {};

    const commodities = await prisma.listing.groupBy({
      by: ['commodityId'],
      where: { ...where, status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const commodityIds = commodities.map(c => c.commodityId);
    const commodityDetails = await prisma.commodity.findMany({
      where: { id: { in: commodityIds } },
    });

    return commodities.map(c => ({
      ...commodityDetails.find(cd => cd.id === c.commodityId),
      listingCount: c._count.id,
    }));
  }
}

export const marketplaceService = new MarketplaceService();
