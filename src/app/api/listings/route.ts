// SRGG Marketplace - Listings API Routes
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createListingSchema, listingQuerySchema } from '@/lib/validation';
import {
  success,
  created,
  paginated,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  withErrorHandler,
  parseJsonBody,
  getSearchParams,
} from '@/lib/api-response';

// ============================================================================
// Helper Functions
// ============================================================================

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return payload;
}

// ============================================================================
// GET /api/listings - List all listings
// ============================================================================

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = getSearchParams(request);

    // Parse and validate query params
    const query = listingQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      status: searchParams.get('status') || undefined,
      commodityId: searchParams.get('commodityId') || undefined,
      producerId: searchParams.get('producerId') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      country: searchParams.get('country') || undefined,
      search: searchParams.get('search') || undefined,
    });

    // Build where clause
    const where: Record<string, unknown> = {};

    // Default to active listings for public view
    if (query.status) {
      where.status = query.status;
    } else {
      where.status = 'ACTIVE';
    }

    if (query.commodityId) {
      where.commodityId = query.commodityId;
    }

    if (query.producerId) {
      where.producerId = query.producerId;
    }

    if (query.minPrice || query.maxPrice) {
      where.pricePerUnit = {};
      if (query.minPrice) {
        (where.pricePerUnit as Record<string, number>).gte = query.minPrice;
      }
      if (query.maxPrice) {
        (where.pricePerUnit as Record<string, number>).lte = query.maxPrice;
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    // Count total
    const total = await prisma.listing.count({ where });

    // Fetch listings
    const listings = await prisma.listing.findMany({
      where,
      include: {
        commodity: true,
        producer: {
          select: {
            id: true,
            name: true,
            srggEid: true,
            rating: true,
            verificationStatus: true,
          },
        },
        tenant: {
          select: { id: true, name: true, country: true, currency: true },
        },
        tokens: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        _count: {
          select: { orders: true, tokens: true },
        },
      },
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return paginated(listings, {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    });
  });
}

// ============================================================================
// POST /api/listings - Create new listing
// ============================================================================

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'PRODUCER', 'BROKER'].includes(user.role)) {
      return forbidden('You do not have permission to create listings');
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return badRequest('Invalid JSON body');
    }

    // Validate input
    const validation = createListingSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const data = validation.data;

    // Get producer (either from body or from authenticated user)
    let producerId = (body as Record<string, unknown>).producerId as string | undefined;

    if (!producerId && user.role === 'PRODUCER') {
      // Find producer associated with this user
      const producer = await prisma.producer.findFirst({
        where: { userId: user.userId },
      });

      if (!producer) {
        return badRequest('No producer profile found for your account');
      }

      producerId = producer.id;
    }

    if (!producerId) {
      return badRequest('Producer ID is required');
    }

    // Verify producer exists and user has access
    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
    });

    if (!producer) {
      return notFound('Producer');
    }

    // Check if user can create listing for this producer
    if (user.role === 'PRODUCER' && producer.userId !== user.userId) {
      return forbidden('You can only create listings for your own producer profile');
    }

    if (user.role !== 'SUPER_ADMIN' && producer.tenantId !== user.tenantId) {
      return forbidden('Access denied');
    }

    // Verify commodity exists
    const commodity = await prisma.commodity.findUnique({
      where: { id: data.commodityId },
    });

    if (!commodity) {
      return notFound('Commodity');
    }

    // Calculate total price
    const totalPrice = data.quantity * data.pricePerUnit;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        tenantId: producer.tenantId,
        producerId,
        commodityId: data.commodityId,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        pricePerUnit: data.pricePerUnit,
        totalPrice,
        currency: data.currency,
        location: JSON.stringify(data.location || {}),
        images: JSON.stringify(data.images || []),
        status: data.status || 'DRAFT',
      },
      include: {
        commodity: true,
        producer: {
          select: {
            id: true,
            name: true,
            srggEid: true,
            rating: true,
          },
        },
        tenant: {
          select: { id: true, name: true, country: true, currency: true },
        },
      },
    });

    return created(listing);
  });
}
