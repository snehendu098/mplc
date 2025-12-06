import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError } from '@/types';

export function successResponse<T>(data: T, meta?: any): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      ...meta,
    },
  };

  return NextResponse.json(response);
}

export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): NextResponse {
  const error: ApiError = {
    code,
    message,
    details,
  };

  const response: ApiResponse = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };

  return NextResponse.json(response, { status });
}

export function validationError(message: string, details: any): NextResponse {
  return errorResponse('VALIDATION_ERROR', message, details, 400);
}

export function notFoundError(resource: string = 'Resource'): NextResponse {
  return errorResponse('NOT_FOUND', `${resource} not found`, null, 404);
}

export function unauthorizedError(): NextResponse {
  return errorResponse('UNAUTHORIZED', 'Authentication required', null, 401);
}

export function forbiddenError(): NextResponse {
  return errorResponse('FORBIDDEN', 'Insufficient permissions', null, 403);
}

export function serverError(message: string = 'Internal server error'): NextResponse {
  return errorResponse('SERVER_ERROR', message, null, 500);
}
