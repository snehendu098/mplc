// SRGG Marketplace - Standardized API Response Helpers
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business Logic
  INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
  LISTING_UNAVAILABLE: 'LISTING_UNAVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_CANNOT_BE_CANCELLED: 'ORDER_CANNOT_BE_CANCELLED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// ============================================================================
// Success Responses
// ============================================================================

export function success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return success(data, 201);
}

export function paginated<T>(
  data: T[],
  meta: ResponseMeta
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json(
    { success: true, data, meta },
    { status: 200 }
  );
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============================================================================
// Error Responses
// ============================================================================

export function error(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function badRequest(
  message: string,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  return error(ErrorCodes.INVALID_INPUT, message, 400, details);
}

export function unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return error(ErrorCodes.UNAUTHORIZED, message, 401);
}

export function forbidden(message = 'Forbidden'): NextResponse<ApiResponse> {
  return error(ErrorCodes.FORBIDDEN, message, 403);
}

export function notFound(resource = 'Resource'): NextResponse<ApiResponse> {
  return error(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
}

export function conflict(message: string): NextResponse<ApiResponse> {
  return error(ErrorCodes.CONFLICT, message, 409);
}

export function validationError(
  zodError: ZodError
): NextResponse<ApiResponse> {
  const details = zodError.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);

  return error(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed',
    400,
    details
  );
}

export function internalError(
  message = 'Internal server error'
): NextResponse<ApiResponse> {
  return error(ErrorCodes.INTERNAL_ERROR, message, 500);
}

export function serviceUnavailable(
  message = 'Service temporarily unavailable'
): NextResponse<ApiResponse> {
  return error(ErrorCodes.SERVICE_UNAVAILABLE, message, 503);
}

export function rateLimitExceeded(): NextResponse<ApiResponse> {
  return error(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    'Too many requests. Please try again later.',
    429
  );
}

// ============================================================================
// Error Handler Wrapper
// ============================================================================

export async function withErrorHandler<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    return await handler();
  } catch (err) {
    console.error('API Error:', err);

    if (err instanceof ZodError) {
      return validationError(err) as NextResponse<ApiResponse<T>>;
    }

    if (err instanceof Error) {
      // Don't expose internal error details in production
      const message = process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred';

      return internalError(message) as NextResponse<ApiResponse<T>>;
    }

    return internalError() as NextResponse<ApiResponse<T>>;
  }
}

// ============================================================================
// Request Helpers
// ============================================================================

export async function parseJsonBody<T>(
  request: Request
): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getSearchParams(
  request: Request
): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

export function parseQueryParams<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  schema: { parse: (data: unknown) => T }
): T {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return schema.parse(params);
}
