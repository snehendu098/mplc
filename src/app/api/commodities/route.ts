import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();

    const commodities = db.prepare(`
      SELECT * FROM Commodity
      ORDER BY name ASC
    `).all();

    return NextResponse.json({
      success: true,
      data: commodities
    });
  } catch (error) {
    console.error('Commodities fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commodities' },
      { status: 500 }
    );
  }
}
