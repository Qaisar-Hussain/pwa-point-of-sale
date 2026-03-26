import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { authService } from '@/services/authService';
import { successResponse, unauthorizedResponse, notFoundResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return unauthorizedResponse('Not authenticated');
    }

    const decoded = await verifyJwt(token);
    if (!decoded || typeof decoded.id !== 'string') {
      return unauthorizedResponse('Not authenticated');
    }

    // Get user profile
    const user = await authService.getUserById(decoded.id);

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return unauthorizedResponse('Internal server error');
  }
}
