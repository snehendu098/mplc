import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();

    const producers = db.prepare(`
      SELECT p.*, t.name as tenant_name, u.name as user_name, u.email
      FROM Producer p
      LEFT JOIN Tenant t ON p.tenantId = t.id
      LEFT JOIN User u ON p.userId = u.id
      ORDER BY p.createdAt DESC
    `).all();

    return NextResponse.json({
      success: true,
      data: producers
    });
  } catch (error) {
    console.error('Producers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch producers' },
      { status: 500 }
    );
  }
}
