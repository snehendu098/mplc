import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock hedging positions
    const positions = [
      {
        id: 'HDG-001',
        commodity: 'Cocoa Futures',
        type: 'FORWARD_CONTRACT',
        quantity: '50 MT',
        strikePrice: '$2,500/MT',
        currentPrice: '$2,485/MT',
        pnl: '-$750',
        status: 'OPEN',
        exchange: 'CME Group'
      },
      {
        id: 'HDG-002',
        commodity: 'Gold Futures',
        type: 'OPTIONS',
        quantity: '100 oz',
        strikePrice: '$1,900/oz',
        currentPrice: '$1,925/oz',
        pnl: '+$2,500',
        status: 'OPEN',
        exchange: 'CME Group'
      }
    ];

    return NextResponse.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Hedging fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hedging positions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mock hedging position creation
    const position = {
      id: `HDG-${Date.now()}`,
      ...body,
      status: 'OPEN',
      exchange: 'CME Group',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: position,
      message: 'Hedging position created successfully'
    });
  } catch (error) {
    console.error('Hedging creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hedging position' },
      { status: 500 }
    );
  }
}
