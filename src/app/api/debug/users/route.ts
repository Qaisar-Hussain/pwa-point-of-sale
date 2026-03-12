import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(users, `Found ${users.length} users in database`);
  } catch (error) {
    console.error('Error fetching users:', error);
    return unauthorizedResponse(`Database error: ${(error as any).message}`);
  }
}
