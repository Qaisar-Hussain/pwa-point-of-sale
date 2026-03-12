import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: 200 }
  );
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: Record<string, any>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error,
        details,
      },
    },
    { status }
  );
}

export function createdResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: 201 }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404);
}

export function conflictResponse(message: string = 'Conflict') {
  return errorResponse(message, 409);
}
