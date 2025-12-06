import { prisma } from '@/lib/prisma';
import type { CreateValidationRequest, UpdateValidationRequest } from '@/types';

export class ValidationService {
  async createValidation(data: CreateValidationRequest) {
    const validation = await prisma.validation.create({
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        listing: {
          include: {
            producer: true,
            commodity: true,
          },
        },
        validator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Update listing status
    await prisma.listing.update({
      where: { id: data.listingId },
      data: { status: 'PENDING_VALIDATION' },
    });

    return validation;
  }

  async getValidation(id: string) {
    return await prisma.validation.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            producer: true,
            commodity: true,
          },
        },
        validator: {
          select: { id: true, name: true, email: true },
        },
        certificate: true,
      },
    });
  }

  async getValidationsByListing(listingId: string) {
    return await prisma.validation.findMany({
      where: { listingId },
      include: {
        validator: {
          select: { id: true, name: true },
        },
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getValidationsByValidator(validatorId: string, options?: any) {
    const { page = 1, limit = 20, status, type } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { validatorId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [validations, total] = await Promise.all([
      prisma.validation.findMany({
        where,
        include: {
          listing: {
            include: {
              producer: true,
              commodity: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.validation.count({ where }),
    ]);

    return {
      validations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateValidation(id: string, data: UpdateValidationRequest) {
    const validation = await prisma.validation.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: {
        listing: true,
      },
    });

    // Update listing based on validation result
    if (data.status === 'APPROVED') {
      await prisma.listing.update({
        where: { id: validation.listingId },
        data: {
          status: 'ACTIVE',
          qualityScore: data.qualityScore,
          qualityGrade: data.results?.grade || validation.listing.qualityGrade,
        },
      });
    } else if (data.status === 'REJECTED') {
      await prisma.listing.update({
        where: { id: validation.listingId },
        data: {
          status: 'CANCELLED',
          metadata: { rejectionReason: data.notes },
        },
      });
    }

    return validation;
  }

  async scheduleValidation(id: string, scheduledAt: Date) {
    return await prisma.validation.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledAt,
      },
    });
  }

  async startValidation(id: string) {
    return await prisma.validation.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
      },
    });
  }

  async completeValidation(id: string, results: any, qualityScore?: number) {
    const validation = await prisma.validation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        results,
        qualityScore,
        completedAt: new Date(),
      },
    });

    // Auto-approve if quality score is high enough
    if (qualityScore && qualityScore >= 70) {
      await this.approveValidation(id);
    }

    return validation;
  }

  async approveValidation(id: string) {
    const validation = await this.updateValidation(id, {
      status: 'APPROVED',
    });

    // Create certificate
    await this.issueCertificate(id);

    return validation;
  }

  async rejectValidation(id: string, reason: string) {
    return await this.updateValidation(id, {
      status: 'REJECTED',
      notes: reason,
    });
  }

  async issueCertificate(validationId: string) {
    const validation = await prisma.validation.findUnique({
      where: { id: validationId },
      include: {
        listing: {
          include: {
            producer: true,
          },
        },
      },
    });

    if (!validation) throw new Error('Validation not found');

    const certificateNumber = await this.generateCertificateNumber(
      validation.tenantId
    );

    // Map validation type to certificate type
    const certificateTypeMap: Record<string, string> = {
      LAB_TEST: 'QUALITY',
      FIELD_INSPECTION: 'ORIGIN',
      PHYTOSANITARY: 'PHYTOSANITARY',
      SUSTAINABILITY_AUDIT: 'SUSTAINABILITY',
      ORIGIN_VERIFICATION: 'ORIGIN',
    };

    const certificateType = certificateTypeMap[validation.type] || 'QUALITY';

    // Calculate expiry date (1 year from issue)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const certificate = await prisma.certificate.create({
      data: {
        tenantId: validation.tenantId,
        validationId: validation.id,
        certificateNumber,
        type: certificateType as any,
        issuedTo: validation.listing.producerId,
        issuedBy: validation.validatorId,
        issuedAt: new Date(),
        expiresAt,
        status: 'ACTIVE',
        metadata: {
          validationType: validation.type,
          qualityScore: validation.qualityScore,
          results: validation.results,
        },
      },
    });

    // Anchor certificate to blockchain (via blockchain service)
    // This would be called separately to avoid circular dependencies

    return certificate;
  }

  private async generateCertificateNumber(tenantId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    const count = await prisma.certificate.count({ where: { tenantId } });
    const sequence = (count + 1).toString().padStart(6, '0');
    const year = new Date().getFullYear();

    return `CERT-${tenant.country}-${year}-${sequence}`;
  }

  async getCertificate(id: string) {
    return await prisma.certificate.findUnique({
      where: { id },
      include: {
        validation: {
          include: {
            listing: {
              include: {
                producer: true,
                commodity: true,
              },
            },
            validator: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async getCertificateByNumber(certificateNumber: string) {
    return await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        validation: {
          include: {
            listing: {
              include: {
                producer: true,
                commodity: true,
              },
            },
          },
        },
      },
    });
  }

  async getProducerCertificates(producerId: string) {
    return await prisma.certificate.findMany({
      where: {
        issuedTo: producerId,
        status: 'ACTIVE',
      },
      include: {
        validation: {
          include: {
            listing: {
              include: {
                commodity: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async revokeCertificate(id: string, reason: string) {
    return await prisma.certificate.update({
      where: { id },
      data: {
        status: 'REVOKED',
        metadata: { revocationReason: reason },
      },
    });
  }

  async checkCertificateExpiry() {
    const now = new Date();

    const expiredCertificates = await prisma.certificate.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: now,
        },
      },
    });

    for (const cert of expiredCertificates) {
      await prisma.certificate.update({
        where: { id: cert.id },
        data: { status: 'EXPIRED' },
      });
    }

    return expiredCertificates.length;
  }
}

export const validationService = new ValidationService();
