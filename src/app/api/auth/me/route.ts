import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { unauthorizedResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return unauthorizedResponse('No token found');
    }

    const decoded = await verifyJwt(token);
    if (!decoded) {
      return unauthorizedResponse('Invalid or expired token');
    }

    return successResponse(decoded, 'User authenticated');
  } catch (error) {
    console.error('Auth check error:', error);
    return unauthorizedResponse('Authentication failed');
  }
}
