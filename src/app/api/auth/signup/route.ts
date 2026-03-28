import { NextRequest } from 'next/server';
import { signupSchema } from '@/lib/validations';
import { authService } from '@/services/authService';
import { createdResponse, errorResponse, conflictResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signupSchema.safeParse(body);
    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      return errorResponse('Validation failed', 400, errors);
    }

    // Create user
    const result = await authService.signup(validatedData.data);

    if (!result.success) {
      if (result.error?.includes('already')) {
        return conflictResponse(result.error);
      }
      return errorResponse(result.error || 'Signup failed', 500);
    }

    // Remove sensitive data
    return createdResponse(
      {
        id: result.user?.id,
        name: result.user?.name,
        email: result.user?.email,
        role: result.user?.role,
      },
      'User created successfully'
    );
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Internal server error', 500);
  }
}
