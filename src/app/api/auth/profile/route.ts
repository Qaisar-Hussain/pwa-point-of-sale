import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { authService } from '@/services/authService';
import { successResponse, unauthorizedResponse, notFoundResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth();

    if (!session || !session.user?.id) {
      return unauthorizedResponse('Not authenticated');
    }

    // Get user profile
    const user = await authService.getUserById(session.user.id);

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return unauthorizedResponse('Internal server error');
  }
}
