import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header or cookie
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
          { status: 401 }
        );
      }

      // Verify token
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
          { status: 401 }
        );
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = payload;

      return await handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'SERVER_ERROR', message: 'Authentication error' } },
        { status: 500 }
      );
    }
  };
}

export function withRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
          { status: 403 }
        );
      }

      return await handler(req);
    });
  };
}
