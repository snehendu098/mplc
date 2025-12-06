import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();

    const tokens = db.prepare(`
      SELECT t.*,
             l.title as listing_title,
             c.name as commodity_name,
             p.name as producer_name
      FROM Token t
      LEFT JOIN Listing l ON t.listingId = l.id
      LEFT JOIN Commodity c ON l.commodityId = c.id
      LEFT JOIN Producer p ON l.producerId = p.id
      ORDER BY t.createdAt DESC
    `).all();

    return NextResponse.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Tokenization fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mock tokenization logic
    const tokenData = {
      id: `TKN-${Date.now()}`,
      blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      tokenAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      ...body,
      status: 'MINTED',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: tokenData,
      message: 'Asset tokenized successfully'
    });
  } catch (error) {
    console.error('Tokenization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to tokenize asset' },
      { status: 500 }
    );
  }
}
