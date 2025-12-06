import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock logistics shipments
    const shipments = [
      {
        id: 'SHP-001',
        commodity: 'Cocoa Beans',
        quantity: '50 MT',
        origin: 'Tema Port, Ghana',
        destination: 'Rotterdam, Netherlands',
        status: 'IN_TRANSIT',
        vessel: 'MV ATLANTIC CARRIER',
        eta: '2025-12-15',
        currentLocation: 'Off coast of Senegal'
      },
      {
        id: 'SHP-002',
        commodity: 'Gold Ore',
        quantity: '500 oz',
        origin: 'Accra, Ghana',
        destination: 'Dubai, UAE',
        status: 'CUSTOMS_CLEARANCE',
        vessel: 'Air Freight',
        eta: '2025-12-08'
      }
    ];

    return NextResponse.json({
      success: true,
      data: shipments
    });
  } catch (error) {
    console.error('Logistics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logistics data' },
      { status: 500 }
    );
  }
}
