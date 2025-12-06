import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();

    const listings = db.prepare(`
      SELECT l.*, c.name as commodity_name, c.category as commodity_category,
             p.name as producer_name, p.srggEid
      FROM Listing l
      LEFT JOIN Commodity c ON l.commodityId = c.id
      LEFT JOIN Producer p ON l.producerId = p.id
      WHERE l.status = 'ACTIVE'
      ORDER BY l.createdAt DESC
    `).all();

    return NextResponse.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Listings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
