// SRGG Marketplace - Individual Producer API Routes
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { updateProducerSchema } from '@/lib/validation';
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
// GET /api/producers/[id] - Get single producer
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    const { id } = await params;

    const producer = await prisma.producer.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { id: true, name: true, country: true, currency: true },
        },
        user: {
          select: { id: true, name: true, email: true, role: true, status: true },
        },
        parcels: true,
        listings: {
          include: {
            commodity: true,
            orders: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: { orders: true, tokens: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            listings: true,
            parcels: true,
          },
        },
      },
    });

    if (!producer) {
      return notFound('Producer');
    }

    // Check tenant access (non-super-admins can only see their tenant's producers)
    if (user.role !== 'SUPER_ADMIN' && producer.tenantId !== user.tenantId) {
      return forbidden('Access denied to this producer');
    }

    return success(producer);
  });
}

// ============================================================================
// PUT /api/producers/[id] - Update producer
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

    // Check if producer exists
    const existingProducer = await prisma.producer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingProducer) {
      return notFound('Producer');
    }

    // Check permissions
    const canEdit =
      user.role === 'SUPER_ADMIN' ||
      user.role === 'TENANT_ADMIN' ||
      existingProducer.userId === user.userId;

    if (!canEdit) {
      return forbidden('You do not have permission to edit this producer');
    }

    // Tenant access check
    if (user.role !== 'SUPER_ADMIN' && existingProducer.tenantId !== user.tenantId) {
      return forbidden('Access denied to this producer');
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return badRequest('Invalid JSON body');
    }

    // Validate input
    const validation = updateProducerSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const data = validation.data;

    // Update producer
    const updatedProducer = await prisma.$transaction(async (tx) => {
      // Update user info if provided
      if (data.fullName || data.email || data.phone) {
        await tx.user.update({
          where: { id: existingProducer.userId },
          data: {
            ...(data.fullName && { name: data.fullName }),
            ...(data.email && { email: data.email }),
            ...(data.phone && { phone: data.phone }),
          },
        });
      }

      // Update producer profile
      const producer = await tx.producer.update({
        where: { id },
        data: {
          ...(data.fullName && { name: data.fullName }),
          ...(data.phone && { phone: data.phone }),
          ...(data.email && { email: data.email }),
          ...(data.producerType && { type: data.producerType }),
        },
        include: {
          tenant: { select: { id: true, name: true, country: true } },
          user: { select: { id: true, name: true, email: true, role: true } },
          parcels: true,
          _count: {
            select: { listings: true, parcels: true },
          },
        },
      });

      return producer;
    });

    return success(updatedProducer);
  });
}

// ============================================================================
// PATCH /api/producers/[id] - Partial update / verification
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

    // Check if producer exists
    const existingProducer = await prisma.producer.findUnique({
      where: { id },
    });

    if (!existingProducer) {
      return notFound('Producer');
    }

    // Only admins can verify producers
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'VALIDATOR'].includes(user.role)) {
      return forbidden('Insufficient permissions');
    }

    // Tenant access check
    if (user.role !== 'SUPER_ADMIN' && existingProducer.tenantId !== user.tenantId) {
      return forbidden('Access denied to this producer');
    }

    const body = await parseJsonBody(request);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid JSON body');
    }

    const { verificationStatus, rating } = body as {
      verificationStatus?: string;
      rating?: number;
    };

    const updateData: Record<string, unknown> = {};

    if (verificationStatus) {
      const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];
      if (!validStatuses.includes(verificationStatus)) {
        return badRequest('Invalid verification status');
      }
      updateData.verificationStatus = verificationStatus;
    }

    if (rating !== undefined) {
      if (rating < 0 || rating > 5) {
        return badRequest('Rating must be between 0 and 5');
      }
      updateData.rating = rating;
    }

    const updatedProducer = await prisma.producer.update({
      where: { id },
      data: updateData,
      include: {
        tenant: { select: { id: true, name: true, country: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
        parcels: true,
      },
    });

    return success(updatedProducer);
  });
}

// ============================================================================
// DELETE /api/producers/[id] - Delete producer
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

    // Only admins can delete producers
    if (!['SUPER_ADMIN', 'TENANT_ADMIN'].includes(user.role)) {
      return forbidden('Insufficient permissions to delete producers');
    }

    const { id } = await params;

    const existingProducer = await prisma.producer.findUnique({
      where: { id },
      include: {
        listings: { where: { status: 'ACTIVE' } },
      },
    });

    if (!existingProducer) {
      return notFound('Producer');
    }

    // Tenant access check
    if (user.role !== 'SUPER_ADMIN' && existingProducer.tenantId !== user.tenantId) {
      return forbidden('Access denied to this producer');
    }

    // Check for active listings
    if (existingProducer.listings.length > 0) {
      return badRequest('Cannot delete producer with active listings. Please deactivate listings first.');
    }

    // Soft delete - just mark user as inactive
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingProducer.userId },
        data: { status: 'INACTIVE' },
      });

      await tx.producer.update({
        where: { id },
        data: { verificationStatus: 'SUSPENDED' },
      });
    });

    return success({ deleted: true, id });
  });
}
