// SRGG Marketplace - Individual Listing API Routes
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { updateListingSchema } from '@/lib/validation';
import {
  success,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  withErrorHandler,
  parseJsonBody,
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
// GET /api/listings/[id] - Get single listing
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        commodity: true,
        producer: {
          select: {
            id: true,
            name: true,
            srggEid: true,
            rating: true,
            verificationStatus: true,
            phone: true,
            email: true,
            type: true,
          },
        },
        tenant: {
          select: { id: true, name: true, country: true, currency: true },
        },
        tokens: {
          where: { status: 'ACTIVE' },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            quantity: true,
            totalPrice: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true, tokens: true },
        },
      },
    });

    if (!listing) {
      return notFound('Listing');
    }

    // Parse JSON fields
    const responseData = {
      ...listing,
      location: JSON.parse(listing.location || '{}'),
      images: JSON.parse(listing.images || '[]'),
    };

    return success(responseData);
  });
}

// ============================================================================
// PUT /api/listings/[id] - Update listing
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    const { id } = await params;

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: { producer: true },
    });

    if (!existingListing) {
      return notFound('Listing');
    }

    // Check permissions
    const canEdit =
      user.role === 'SUPER_ADMIN' ||
      user.role === 'TENANT_ADMIN' ||
      user.role === 'BROKER' ||
      (user.role === 'PRODUCER' && existingListing.producer.userId === user.userId);

    if (!canEdit) {
      return forbidden('You do not have permission to edit this listing');
    }

    // Tenant access check
    if (user.role !== 'SUPER_ADMIN' && existingListing.tenantId !== user.tenantId) {
      return forbidden('Access denied');
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return badRequest('Invalid JSON body');
    }

    // Validate input
    const validation = updateListingSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const data = validation.data;

    // If commodity is being changed, verify it exists
    if (data.commodityId) {
      const commodity = await prisma.commodity.findUnique({
        where: { id: data.commodityId },
      });
      if (!commodity) {
        return notFound('Commodity');
      }
    }

    // Calculate new total price if quantity or price changed
    const quantity = data.quantity ?? existingListing.quantity;
    const pricePerUnit = data.pricePerUnit ?? existingListing.pricePerUnit;
    const totalPrice = quantity * pricePerUnit;

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(data.commodityId && { commodityId: data.commodityId }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.unit && { unit: data.unit }),
        ...(data.pricePerUnit !== undefined && { pricePerUnit: data.pricePerUnit }),
        totalPrice,
        ...(data.currency && { currency: data.currency }),
        ...(data.location && { location: JSON.stringify(data.location) }),
        ...(data.images && { images: JSON.stringify(data.images) }),
        ...(data.status && { status: data.status }),
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

    return success(updatedListing);
  });
}

// ============================================================================
// PATCH /api/listings/[id] - Partial update (status change)
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    const { id } = await params;

    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: { producer: true },
    });

    if (!existingListing) {
      return notFound('Listing');
    }

    // Check permissions
    const canEdit =
      user.role === 'SUPER_ADMIN' ||
      user.role === 'TENANT_ADMIN' ||
      (user.role === 'PRODUCER' && existingListing.producer.userId === user.userId);

    if (!canEdit) {
      return forbidden('You do not have permission to modify this listing');
    }

    const body = await parseJsonBody(request);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid JSON body');
    }

    const { status } = body as { status?: string };

    if (!status) {
      return badRequest('Status is required');
    }

    const validStatuses = ['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return badRequest('Invalid status');
    }

    // Business logic validations
    if (status === 'ACTIVE' && existingListing.producer.verificationStatus !== 'VERIFIED') {
      return badRequest('Cannot activate listing: Producer must be verified first');
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: { status },
      include: {
        commodity: true,
        producer: {
          select: { id: true, name: true, srggEid: true },
        },
      },
    });

    return success(updatedListing);
  });
}

// ============================================================================
// DELETE /api/listings/[id] - Delete listing
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    const { id } = await params;

    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: {
        producer: true,
        orders: { where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] } } },
        tokens: { where: { status: 'ACTIVE' } },
      },
    });

    if (!existingListing) {
      return notFound('Listing');
    }

    // Check permissions
    const canDelete =
      user.role === 'SUPER_ADMIN' ||
      user.role === 'TENANT_ADMIN' ||
      (user.role === 'PRODUCER' && existingListing.producer.userId === user.userId);

    if (!canDelete) {
      return forbidden('You do not have permission to delete this listing');
    }

    // Check for active orders
    if (existingListing.orders.length > 0) {
      return badRequest('Cannot delete listing with pending orders');
    }

    // Check for active tokens
    if (existingListing.tokens.length > 0) {
      return badRequest('Cannot delete listing with active tokens. Please transfer or burn tokens first.');
    }

    // Soft delete by marking as cancelled
    await prisma.listing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return success({ deleted: true, id });
  });
}
