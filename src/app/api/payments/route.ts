// SRGG Marketplace - Payments API Routes
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createPaymentSchema, paginationSchema } from '@/lib/validation';
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

function generatePaymentNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

// Stripe integration (skeleton - requires API keys)
async function processStripePayment(amount: number, currency: string, metadata: Record<string, unknown>) {
  // In production, this would use the Stripe SDK
  // For now, simulate payment processing
  if (process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Stripe uses cents
    //   currency: currency.toLowerCase(),
    //   metadata,
    // });
    // return { success: true, paymentIntentId: paymentIntent.id };
  }

  // Development/Demo mode - simulate successful payment
  return {
    success: true,
    transactionId: `sim_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    message: 'Payment simulated successfully',
  };
}

// Mobile Money integration (skeleton)
async function processMobileMoneyPayment(amount: number, currency: string, phoneNumber: string) {
  // In production, integrate with mobile money providers (MTN, Vodafone, etc.)
  return {
    success: true,
    transactionId: `momo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    message: 'Mobile money payment simulated successfully',
  };
}

// ============================================================================
// GET /api/payments - List payments
// ============================================================================

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    const searchParams = getSearchParams(request);
    const { page, limit, sortBy, sortOrder } = paginationSchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    // Build where clause based on user role
    const where: Record<string, unknown> = {};

    if (user.role === 'BUYER') {
      where.order = { buyerId: user.userId };
    } else if (user.role === 'PRODUCER') {
      const producer = await prisma.producer.findFirst({
        where: { userId: user.userId },
      });
      if (producer) {
        where.order = { listing: { producerId: producer.id } };
      }
    } else if (!['SUPER_ADMIN', 'FINANCE', 'AUDITOR'].includes(user.role)) {
      where.order = { tenantId: user.tenantId };
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Method filter
    const method = searchParams.get('method');
    if (method) {
      where.method = method;
    }

    // Order filter
    const orderId = searchParams.get('orderId');
    if (orderId) {
      where.orderId = orderId;
    }

    const total = await prisma.payment.count({ where });

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            listing: {
              select: { id: true, title: true },
            },
            buyer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginated(payments, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// ============================================================================
// POST /api/payments - Create/Process payment
// ============================================================================

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return badRequest('Invalid JSON body');
    }

    // Validate input
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const data = validation.data;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        listing: { include: { producer: true } },
        payments: { where: { status: 'COMPLETED' } },
      },
    });

    if (!order) {
      return notFound('Order');
    }

    // Check if user can make payment for this order
    if (
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'FINANCE' &&
      order.buyerId !== user.userId
    ) {
      return forbidden('You can only make payments for your own orders');
    }

    // Check order status
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return badRequest('Cannot make payment for order in current status');
    }

    // Check if already paid
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= order.totalPrice) {
      return badRequest('Order has already been fully paid');
    }

    // Validate payment amount
    const remainingAmount = order.totalPrice - totalPaid;
    if (data.amount > remainingAmount) {
      return badRequest(`Payment amount exceeds remaining balance of ${remainingAmount} ${order.currency}`);
    }

    // Process payment based on method
    let paymentResult;
    switch (data.method) {
      case 'CARD':
        paymentResult = await processStripePayment(data.amount, data.currency, {
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
        break;
      case 'MOBILE_MONEY':
        const phoneNumber = (data.metadata as Record<string, string>)?.phoneNumber || '';
        paymentResult = await processMobileMoneyPayment(data.amount, data.currency, phoneNumber);
        break;
      case 'BANK_TRANSFER':
      case 'ESCROW':
        // These require manual verification
        paymentResult = {
          success: true,
          transactionId: `pending_${Date.now()}`,
          message: 'Payment pending verification',
          status: 'PROCESSING',
        };
        break;
      default:
        return badRequest('Unsupported payment method');
    }

    if (!paymentResult.success) {
      return badRequest('Payment processing failed');
    }

    // Create payment record
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          orderId: data.orderId,
          paymentNumber: generatePaymentNumber(),
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          status: ('status' in paymentResult ? paymentResult.status : undefined) || 'COMPLETED',
        },
        include: {
          order: {
            include: {
              listing: { select: { id: true, title: true } },
              buyer: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      // Update order payment status
      const newTotalPaid = totalPaid + data.amount;
      const paymentStatus = newTotalPaid >= order.totalPrice ? 'COMPLETED' : 'PROCESSING';

      await tx.order.update({
        where: { id: data.orderId },
        data: {
          paymentStatus,
          // Auto-confirm order if fully paid
          ...(paymentStatus === 'COMPLETED' && order.status === 'PENDING' && { status: 'CONFIRMED' }),
        },
      });

      return newPayment;
    });

    return created(payment);
  });
}
