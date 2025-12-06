import { prisma } from '@/lib/prisma';
import type {
  InsuranceQuoteRequest,
  CreateInsurancePolicyRequest,
  CreateInsuranceClaimRequest,
  RiskScore,
} from '@/types';

export class InsuranceService {
  // ============================================================================
  // Insurance Quotes & Policies
  // ============================================================================

  async getQuote(data: InsuranceQuoteRequest) {
    const riskScore = await this.calculateRiskScore(data.riskProfile);
    const basePremiumRate = this.getBasePremiumRate(data.insuredType);
    const riskMultiplier = 1 + (100 - riskScore.overall) / 100;

    const premium = data.insuredValue * basePremiumRate * riskMultiplier * (data.coverageDuration / 365);

    return {
      insuredValue: data.insuredValue,
      currency: data.currency,
      coverageDuration: data.coverageDuration,
      premium: Math.round(premium * 100) / 100,
      premiumRate: basePremiumRate,
      riskScore,
      riskMultiplier,
      estimatedPayoutProbability: (100 - riskScore.overall) / 100,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  async createPolicy(data: CreateInsurancePolicyRequest) {
    const policyNumber = await this.generatePolicyNumber(data.tenantId);

    const policy = await prisma.insurancePolicy.create({
      data: {
        ...data,
        policyNumber,
        provider: 'lloyds',
        status: 'PENDING',
      },
      include: {
        token: true,
      },
    });

    // If Lloyd's integration is enabled, create policy with Lloyd's
    if (process.env.ENABLE_INSURANCE_MODULE === 'true') {
      try {
        await this.createLloydsPolicy(policy);
        await prisma.insurancePolicy.update({
          where: { id: policy.id },
          data: { status: 'ACTIVE' },
        });
      } catch (error) {
        console.error('Lloyd\'s policy creation failed:', error);
        // Keep in pending for manual review
      }
    } else {
      // Auto-activate for development
      await prisma.insurancePolicy.update({
        where: { id: policy.id },
        data: { status: 'ACTIVE' },
      });
    }

    return policy;
  }

  private async createLloydsPolicy(policy: any) {
    const lloydsApiUrl = process.env.LLOYDS_API_URL;
    const lloydsApiKey = process.env.LLOYDS_API_KEY;

    const response = await fetch(`${lloydsApiUrl}/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': lloydsApiKey || '',
      },
      body: JSON.stringify({
        policyNumber: policy.policyNumber,
        insuredValue: policy.insuredValue,
        premium: policy.premium,
        currency: policy.currency,
        coverageStart: policy.coverageStart,
        coverageEnd: policy.coverageEnd,
        riskProfile: policy.riskProfile,
        terms: policy.terms,
      }),
    });

    if (!response.ok) {
      throw new Error('Lloyd\'s API request failed');
    }

    const result = await response.json();
    return result;
  }

  async getPolicy(id: string) {
    return await prisma.insurancePolicy.findUnique({
      where: { id },
      include: {
        token: {
          include: {
            listing: {
              include: {
                producer: true,
                commodity: true,
              },
            },
          },
        },
        claims: true,
      },
    });
  }

  async getPoliciesByToken(tokenId: string) {
    return await prisma.insurancePolicy.findMany({
      where: { tokenId },
      include: {
        claims: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelPolicy(id: string, reason?: string) {
    return await prisma.insurancePolicy.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        metadata: { cancellationReason: reason },
      },
    });
  }

  // ============================================================================
  // Claims Management
  // ============================================================================

  async createClaim(data: CreateInsuranceClaimRequest) {
    const policy = await prisma.insurancePolicy.findUnique({
      where: { id: data.policyId },
    });

    if (!policy) throw new Error('Policy not found');
    if (policy.status !== 'ACTIVE') throw new Error('Policy is not active');

    const claimNumber = await this.generateClaimNumber(policy.tenantId);

    const claim = await prisma.insuranceClaim.create({
      data: {
        ...data,
        claimNumber,
        currency: policy.currency,
        status: 'PENDING',
      },
      include: {
        policy: true,
      },
    });

    // Check if this is a parametric claim (auto-payable)
    if (data.triggerData && this.checkParametricTrigger(policy, data.triggerData)) {
      await this.approveClaim(claim.id, data.claimAmount);
    }

    return claim;
  }

  async getClaim(id: string) {
    return await prisma.insuranceClaim.findUnique({
      where: { id },
      include: {
        policy: {
          include: {
            token: {
              include: {
                listing: {
                  include: {
                    producer: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async approveClaim(id: string, approvedAmount?: number) {
    const claim = await prisma.insuranceClaim.findUnique({
      where: { id },
      include: { policy: true },
    });

    if (!claim) throw new Error('Claim not found');

    const finalAmount = approvedAmount || claim.claimAmount;

    // Update claim
    await prisma.insuranceClaim.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAmount: finalAmount,
      },
    });

    // Update policy
    await prisma.insurancePolicy.update({
      where: { id: claim.policyId },
      data: {
        claimsMade: claim.policy.claimsMade + 1,
        claimsApproved: claim.policy.claimsApproved + 1,
        payoutTotal: claim.policy.payoutTotal + finalAmount,
      },
    });

    return claim;
  }

  async rejectClaim(id: string, reason: string) {
    const claim = await prisma.insuranceClaim.update({
      where: { id },
      data: {
        status: 'REJECTED',
        assessmentNotes: reason,
      },
    });

    await prisma.insurancePolicy.update({
      where: { id: claim.policyId },
      data: {
        claimsMade: { increment: 1 },
      },
    });

    return claim;
  }

  async payClaim(id: string) {
    return await prisma.insuranceClaim.update({
      where: { id },
      data: {
        status: 'PAID',
        payoutDate: new Date(),
      },
    });
  }

  // ============================================================================
  // Risk Assessment
  // ============================================================================

  async calculateRiskScore(riskProfile: any): Promise<RiskScore> {
    // Simplified risk scoring algorithm
    // In production, this would use ML models and historical data

    const weatherRisk = this.assessWeatherRisk(riskProfile.location, riskProfile.commodity);
    const marketRisk = this.assessMarketRisk(riskProfile.commodity);
    const logisticsRisk = this.assessLogisticsRisk(riskProfile.location);
    const qualityRisk = this.assessQualityRisk(riskProfile.producer);

    const overall = (weatherRisk + marketRisk + logisticsRisk + qualityRisk) / 4;

    const factors: string[] = [];
    if (weatherRisk < 60) factors.push('High weather risk');
    if (marketRisk < 60) factors.push('Volatile market conditions');
    if (logisticsRisk < 60) factors.push('Logistics challenges');
    if (qualityRisk < 60) factors.push('Quality concerns');

    return {
      overall: Math.round(overall),
      weather: Math.round(weatherRisk),
      market: Math.round(marketRisk),
      logistics: Math.round(logisticsRisk),
      quality: Math.round(qualityRisk),
      factors,
    };
  }

  private assessWeatherRisk(location: any, commodity: string): number {
    // Simplified - would integrate with weather APIs
    return 75; // Mock score
  }

  private assessMarketRisk(commodity: string): number {
    // Simplified - would analyze market volatility
    return 80; // Mock score
  }

  private assessLogisticsRisk(location: any): number {
    // Simplified - would analyze infrastructure quality
    return 70; // Mock score
  }

  private assessQualityRisk(producer: any): number {
    // Based on producer's history and rating
    return producer?.rating ? producer.rating * 10 : 50;
  }

  private checkParametricTrigger(policy: any, triggerData: any): boolean {
    // Check if parametric conditions are met
    // E.g., rainfall below threshold, temperature above threshold, etc.
    return false; // Simplified
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  private getBasePremiumRate(insuredType: string): number {
    const rates: Record<string, number> = {
      commodity: 0.05,
      shipment: 0.03,
      livestock: 0.08,
      crop_yield: 0.06,
      price_guarantee: 0.04,
    };

    return rates[insuredType] || 0.05;
  }

  private async generatePolicyNumber(tenantId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    const count = await prisma.insurancePolicy.count({ where: { tenantId } });
    const sequence = (count + 1).toString().padStart(8, '0');
    const year = new Date().getFullYear();

    return `POL-${tenant.country}-${year}-${sequence}`;
  }

  private async generateClaimNumber(tenantId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    const count = await prisma.insuranceClaim.count();
    const sequence = (count + 1).toString().padStart(8, '0');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    return `CLM-${tenant.country}-${date}-${sequence}`;
  }

  async checkPolicyExpiry() {
    const now = new Date();

    const expiredPolicies = await prisma.insurancePolicy.findMany({
      where: {
        status: 'ACTIVE',
        coverageEnd: {
          lte: now,
        },
      },
    });

    for (const policy of expiredPolicies) {
      await prisma.insurancePolicy.update({
        where: { id: policy.id },
        data: { status: 'EXPIRED' },
      });
    }

    return expiredPolicies.length;
  }
}

export const insuranceService = new InsuranceService();
