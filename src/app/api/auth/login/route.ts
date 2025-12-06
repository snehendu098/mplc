import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'standalone-dev-secret-key-min-32-chars-long'
);

export async function POST(req: NextRequest) {
  try {
    // Read body as text first to handle potential JSON parsing errors
    const rawBody = await req.text();

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Get database connection
    const db = getDatabase();

    // Find user with tenant and producer info
    const user = db.prepare(`
      SELECT
        u.*,
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.country as tenant_country,
        p.id as producer_id,
        p.srggEid as producer_srggEid,
        p.type as producer_type,
        p.name as producer_name
      FROM User u
      LEFT JOIN Tenant t ON u.tenantId = t.id
      LEFT JOIN Producer p ON u.id = p.userId
      WHERE u.email = ?
    `).get(email) as any;

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Account is not active', details: { status: user.status } },
        { status: 403 }
      );
    }

    // Parse permissions if it's a JSON string
    let permissions = [];
    try {
      permissions = user.permissions ? JSON.parse(user.permissions) : [];
    } catch (e) {
      console.error('Permission parsing error:', e);
      permissions = [];
    }

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      permissions,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Update last login
    db.prepare(`
      UPDATE User
      SET lastLoginAt = datetime('now')
      WHERE id = ?
    `).run(user.id);

    // Return user data and token
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenant: {
            id: user.tenantId,
            name: user.tenant_name,
            slug: user.tenant_slug,
            country: user.tenant_country,
          },
          producer: user.producer_id ? {
            id: user.producer_id,
            srggEid: user.producer_srggEid,
            type: user.producer_type,
            name: user.producer_name,
          } : null,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
