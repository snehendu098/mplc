// SRGG Marketplace - Producer API Routes
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createProducerSchema, paginationSchema } from '@/lib/validation';
import {
  success,
  created,
  paginated,
  badRequest,
  unauthorized,
  notFound,
  validationError,
  internalError,
  withErrorHandler,
  parseJsonBody,
  getSearchParams,
} from '@/lib/api-response';

// ============================================================================
// Helper Functions
// ============================================================================

function generateSRGGEid(tenantCountry: string): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  const countryCode = tenantCountry === 'Ghana' ? 'GH' :
                      tenantCountry === 'Dominican Republic' ? 'DR' : 'XX';
  return `SRGG-${countryCode}-${year}-${random}`;
}

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
// GET /api/producers - List all producers
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

    // Build filters
    const where: Record<string, unknown> = {};

    // Tenant filtering (non-super-admins can only see their tenant's producers)
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      where.verificationStatus = status;
    }

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { srggEid: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // Type filter
    const type = searchParams.get('type');
    if (type) {
      where.type = type.toUpperCase();
    }

    // Count total
    const total = await prisma.producer.count({ where });

    // Fetch producers
    const producers = await prisma.producer.findMany({
      where,
      include: {
        tenant: {
          select: { id: true, name: true, country: true },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        parcels: true,
        listings: {
          where: { status: 'ACTIVE' },
          take: 5,
          include: {
            commodity: true,
          },
        },
        _count: {
          select: {
            listings: true,
            parcels: true,
          },
        },
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginated(producers, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// ============================================================================
// POST /api/producers - Create new producer
// ============================================================================

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized('Authentication required');
    }

    // Only admins can create producers directly
    if (!['SUPER_ADMIN', 'TENANT_ADMIN'].includes(user.role)) {
      return unauthorized('Insufficient permissions to create producers');
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return badRequest('Invalid JSON body');
    }

    // Validate input
    const validation = createProducerSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const data = validation.data;

    // Get tenant info for SRGG EID generation
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      return notFound('Tenant');
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: user.tenantId,
        email: data.email,
      },
    });

    if (existingUser) {
      return badRequest('A user with this email already exists in this tenant');
    }

    // Create user and producer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const newUser = await tx.user.create({
        data: {
          tenantId: user.tenantId,
          email: data.email,
          name: data.fullName,
          phone: data.phone,
          role: 'PRODUCER',
          status: 'ACTIVE',
          permissions: JSON.stringify([
            'producer:read',
            'producer:update',
            'parcels:create',
            'parcels:read',
            'parcels:update',
            'listings:create',
            'listings:read',
            'listings:update',
            'listings:delete',
            'orders:read',
            'certificates:read',
          ]),
        },
      });

      // Generate SRGG Economic ID
      const srggEid = generateSRGGEid(tenant.country);

      // Create producer profile
      const producer = await tx.producer.create({
        data: {
          tenantId: user.tenantId,
          userId: newUser.id,
          srggEid,
          type: data.producerType,
          name: data.fullName,
          phone: data.phone,
          email: data.email,
          verificationStatus: 'PENDING',
        },
      });

      // Create parcels if provided
      if (data.parcels && data.parcels.length > 0) {
        await tx.parcel.createMany({
          data: data.parcels.map((parcel, index) => ({
            producerId: producer.id,
            parcelNumber: `${srggEid}-P${(index + 1).toString().padStart(3, '0')}`,
            area: parcel.size,
            unit: parcel.unit,
            location: JSON.stringify({
              name: parcel.name,
              address: parcel.location,
              gpsCoordinates: parcel.gpsCoordinates,
            }),
            ownership: 'REGISTERED',
          })),
        });
      }

      // Fetch complete producer data
      return tx.producer.findUnique({
        where: { id: producer.id },
        include: {
          tenant: { select: { id: true, name: true, country: true } },
          user: { select: { id: true, name: true, email: true, role: true } },
          parcels: true,
        },
      });
    });

    return created(result);
  });
}
