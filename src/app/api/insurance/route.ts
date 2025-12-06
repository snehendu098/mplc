import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock insurance policies
    const policies = [
      {
        id: 'POL-001',
        type: 'COMMODITY_INSURANCE',
        commodity: 'Cocoa Beans',
        coverage: '$125,000',
        premium: '$1,250/month',
        status: 'ACTIVE',
        provider: 'Lloyd\'s of London'
      },
      {
        id: 'POL-002',
        type: 'CROP_INSURANCE',
        commodity: 'Maize',
        coverage: '$45,000',
        premium: '$450/month',
        status: 'ACTIVE',
        provider: 'Lloyd\'s of London'
      }
    ];

    return NextResponse.json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Insurance fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurance policies' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mock insurance creation
    const policy = {
      id: `POL-${Date.now()}`,
      ...body,
      status: 'PENDING_APPROVAL',
      provider: 'Lloyd\'s of London',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: policy,
      message: 'Insurance policy created successfully'
    });
  } catch (error) {
    console.error('Insurance creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create insurance policy' },
      { status: 500 }
    );
  }
}
