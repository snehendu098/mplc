// SRGG Marketplace - Individual Order API Routes
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { updateOrderSchema } from '@/lib/validation';
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
// GET /api/orders/[id] - Get single order
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            commodity: true,
            producer: {
              select: {
                id: true,
                name: true,
                srggEid: true,
                phone: true,
                email: true,
                rating: true,
              },
            },
            tokens: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        tenant: {
          select: { id: true, name: true, country: true, currency: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return notFound('Order');
    }

    // Check access permissions
    const canView =
      user.role === 'SUPER_ADMIN' ||
      user.role === 'TENANT_ADMIN' ||
      user.role === 'FINANCE' ||
      user.role === 'AUDITOR' ||
      user.role === 'BROKER' ||
      order.buyerId === user.userId ||
      order.listing.producer.email === user.userId;

    if (!canView && user.role !== 'SUPER_ADMIN' && order.tenantId !== user.tenantId) {
      return forbidden('Access denied');
    }

    return success(order);
  });
}

// ============================================================================
// PUT /api/orders/[id] - Update order
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: { include: { producer: true } },
        payments: true,
      },
    });

    if (!existingOrder) {
      return notFound('Order');
    }

    // Check permissions
    const canEdit =
      user.role === 'SUPER_ADMIN' ||
      user.role === 'TENANT_ADMIN' ||
      user.role === 'FINANCE' ||
      user.role === 'BROKER' ||
      existingOrder.listing.producer.userId === user.userId;

    if (!canEdit) {
      return forbidden('You do not have permission to update this order');
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return badRequest('Invalid JSON body');
    }

    // Validate input
    const validation = updateOrderSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const data = validation.data;

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: ['COMPLETED', 'REFUNDED'],
        COMPLETED: [],
        CANCELLED: [],
        REFUNDED: [],
      };

      const allowedStatuses = validTransitions[existingOrder.status] || [];
      if (!allowedStatuses.includes(data.status)) {
        return badRequest(`Cannot transition from ${existingOrder.status} to ${data.status}`);
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
        ...(data.notes && { notes: data.notes }),
      },
      include: {
        listing: {
          include: {
            commodity: true,
            producer: {
              select: { id: true, name: true, srggEid: true },
            },
          },
        },
        buyer: {
          select: { id: true, name: true, email: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Handle inventory restoration on cancellation
    if (data.status === 'CANCELLED') {
      await prisma.listing.update({
        where: { id: existingOrder.listingId },
        data: {
          quantity: { increment: existingOrder.quantity },
          // Reactivate if it was sold out
          status: 'ACTIVE',
        },
      });
    }

    return success(updatedOrder);
  });
}

// ============================================================================
// PATCH /api/orders/[id] - Partial update (status change)
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: { include: { producer: true } },
      },
    });

    if (!existingOrder) {
      return notFound('Order');
    }

    const body = await parseJsonBody(request);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid JSON body');
    }

    const { action } = body as { action?: string };

    // Handle specific actions
    switch (action) {
      case 'confirm':
        if (existingOrder.status !== 'PENDING') {
          return badRequest('Order must be pending to confirm');
        }
        // Only producer can confirm
        if (
          user.role !== 'SUPER_ADMIN' &&
          user.role !== 'TENANT_ADMIN' &&
          existingOrder.listing.producer.userId !== user.userId
        ) {
          return forbidden('Only the producer can confirm orders');
        }
        break;

      case 'ship':
        if (existingOrder.status !== 'PROCESSING') {
          return badRequest('Order must be processing to ship');
        }
        break;

      case 'deliver':
        if (existingOrder.status !== 'SHIPPED') {
          return badRequest('Order must be shipped to mark as delivered');
        }
        break;

      case 'cancel':
        if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
          return badRequest('Cannot cancel order in current status');
        }
        // Only buyer or admin can cancel
        if (
          user.role !== 'SUPER_ADMIN' &&
          user.role !== 'TENANT_ADMIN' &&
          existingOrder.buyerId !== user.userId
        ) {
          return forbidden('Only the buyer can cancel orders');
        }
        break;

      default:
        return badRequest('Invalid action');
    }

    const statusMap: Record<string, string> = {
      confirm: 'CONFIRMED',
      ship: 'SHIPPED',
      deliver: 'DELIVERED',
      complete: 'COMPLETED',
      cancel: 'CANCELLED',
    };

    const newStatus = statusMap[action];

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: {
          listing: {
            include: {
              commodity: true,
              producer: { select: { id: true, name: true, srggEid: true } },
            },
          },
          buyer: { select: { id: true, name: true, email: true } },
        },
      });

      // Restore inventory on cancellation
      if (newStatus === 'CANCELLED') {
        await tx.listing.update({
          where: { id: existingOrder.listingId },
          data: {
            quantity: { increment: existingOrder.quantity },
            status: 'ACTIVE',
          },
        });
      }

      return order;
    });

    return success(updatedOrder);
  });
}

// ============================================================================
// DELETE /api/orders/[id] - Cancel/Delete order
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: { where: { status: 'COMPLETED' } },
      },
    });

    if (!existingOrder) {
      return notFound('Order');
    }

    // Only pending orders can be deleted
    if (existingOrder.status !== 'PENDING') {
      return badRequest('Only pending orders can be deleted');
    }

    // Check if there are completed payments
    if (existingOrder.payments.length > 0) {
      return badRequest('Cannot delete order with completed payments. Please request a refund instead.');
    }

    // Check permissions
    if (
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'TENANT_ADMIN' &&
      existingOrder.buyerId !== user.userId
    ) {
      return forbidden('You do not have permission to delete this order');
    }

    // Delete order and restore inventory
    await prisma.$transaction(async (tx) => {
      // Restore listing quantity
      await tx.listing.update({
        where: { id: existingOrder.listingId },
        data: {
          quantity: { increment: existingOrder.quantity },
          status: 'ACTIVE',
        },
      });

      // Delete order
      await tx.order.delete({ where: { id } });
    });

    return success({ deleted: true, id });
  });
}
