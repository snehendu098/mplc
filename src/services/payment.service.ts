import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import type { CreatePaymentRequest } from '@/types';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export class PaymentService {
  async createPayment(data: CreatePaymentRequest) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        buyer: true,
        listing: {
          include: {
            producer: true,
          },
        },
      },
    });

    if (!order) throw new Error('Order not found');

    const paymentNumber = await this.generatePaymentNumber();

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        paymentNumber,
        amount: data.amount,
        currency: data.currency,
        method: data.method as any,
        provider: data.provider,
        status: 'PENDING',
      },
    });

    // Process payment based on method
    try {
      let providerTxId: string | undefined;

      switch (data.method) {
        case 'CREDIT_CARD':
          if (stripe) {
            providerTxId = await this.processStripePayment(payment, order);
          }
          break;
        case 'CRYPTO':
        case 'STABLECOIN':
          providerTxId = await this.processCryptoPayment(payment, order);
          break;
        case 'MOBILE_MONEY':
          providerTxId = await this.processMobileMoneyPayment(payment, order);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerTxId,
          status: 'PROCESSING',
        },
      });

      return payment;
    } catch (error: any) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: error.message,
        },
      });

      throw error;
    }
  }

  private async processStripePayment(payment: any, order: any): Promise<string> {
    if (!stripe) throw new Error('Stripe not configured');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // Convert to cents
      currency: payment.currency.toLowerCase(),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: payment.id,
      },
      description: `Order ${order.orderNumber}`,
    });

    return paymentIntent.id;
  }

  private async processCryptoPayment(payment: any, order: any): Promise<string> {
    // Integrate with blockchain service for crypto payments
    // This would create a payment request that the user needs to fulfill
    const txId = `crypto_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return txId;
  }

  private async processMobileMoneyPayment(payment: any, order: any): Promise<string> {
    // Integrate with mobile money providers (M-Pesa, etc.)
    const txId = `mm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return txId;
  }

  async getPayment(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            listing: {
              include: {
                producer: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  async getPaymentByNumber(paymentNumber: string) {
    return await prisma.payment.findUnique({
      where: { paymentNumber },
      include: {
        order: true,
      },
    });
  }

  async confirmPayment(id: string, providerTxId?: string) {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        ...(providerTxId && { providerTxId }),
      },
    });

    // Update order payment status
    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { payments: true },
    });

    if (order) {
      const totalPaid = order.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= order.totalPrice) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });
      }
    }

    return payment;
  }

  async failPayment(id: string, reason: string) {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'FAILED',
        failureReason: reason,
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'FAILED' },
    });

    return payment;
  }

  async refundPayment(id: string, amount?: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'COMPLETED') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmount = amount || payment.amount;

    // Process refund with provider
    if (payment.method === 'CREDIT_CARD' && stripe && payment.providerTxId) {
      await stripe.refunds.create({
        payment_intent: payment.providerTxId,
        amount: Math.round(refundAmount * 100),
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount,
        refundedAt: new Date(),
      },
    });

    // Update order
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    return updatedPayment;
  }

  async releaseEscrow(id: string) {
    return await prisma.payment.update({
      where: { id },
      data: {
        escrowReleased: true,
      },
    });
  }

  async handleWebhook(provider: string, payload: any, signature: string) {
    switch (provider) {
      case 'stripe':
        return await this.handleStripeWebhook(payload, signature);
      default:
        throw new Error('Unknown payment provider');
    }
  }

  private async handleStripeWebhook(payload: any, signature: string) {
    if (!stripe) throw new Error('Stripe not configured');

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('Webhook secret not configured');

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const payment = await prisma.payment.findFirst({
          where: { providerTxId: paymentIntent.id },
        });

        if (payment) {
          await this.confirmPayment(payment.id);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        const failedPayment = await prisma.payment.findFirst({
          where: { providerTxId: failedIntent.id },
        });

        if (failedPayment) {
          await this.failPayment(failedPayment.id, 'Payment failed');
        }
        break;
    }

    return { received: true };
  }

  private async generatePaymentNumber(): Promise<string> {
    const count = await prisma.payment.count();
    const sequence = (count + 1).toString().padStart(10, '0');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    return `PAY-${date}-${sequence}`;
  }

  async getPaymentStats(tenantId?: string) {
    const where = tenantId ? { order: { tenantId } } : {};

    const [
      totalPayments,
      completedPayments,
      totalAmount,
      refundedAmount,
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { ...where, status: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] } },
        _sum: { refundAmount: true },
      }),
    ]);

    return {
      totalPayments,
      completedPayments,
      failedPayments: totalPayments - completedPayments,
      totalAmount: totalAmount._sum.amount || 0,
      refundedAmount: refundedAmount._sum.refundAmount || 0,
      netRevenue: (totalAmount._sum.amount || 0) - (refundedAmount._sum.refundAmount || 0),
    };
  }
}

export const paymentService = new PaymentService();
