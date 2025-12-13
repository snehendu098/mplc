import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { createCommoditySchema } from '@/lib/validation';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = createCommoditySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0]?.message || 'Invalid input'
          }
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const db = getDatabase();

    // Check if commodity with same name already exists
    const existing = db.prepare('SELECT id FROM Commodity WHERE name = ?').get(data.name);
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_EXISTS', message: 'A commodity with this name already exists' } },
        { status: 409 }
      );
    }

    // Generate a unique ID
    const id = `c${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Insert the new commodity
    const stmt = db.prepare(`
      INSERT INTO Commodity (id, name, category, unit, hsCode, description, icon, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      data.name,
      data.category,
      data.unit,
      data.hsCode || null,
      data.description || null,
      data.icon || null
    );

    // Fetch the created commodity
    const commodity = db.prepare('SELECT * FROM Commodity WHERE id = ?').get(id);

    return NextResponse.json(
      { success: true, data: commodity },
      { status: 201 }
    );
  } catch (error) {
    console.error('Commodity creation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create commodity' } },
      { status: 500 }
    );
  }
}
