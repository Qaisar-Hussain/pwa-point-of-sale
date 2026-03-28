import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Not found', 404);
  }

  try {
    const { default: prisma } = await import('@/lib/prisma');
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
