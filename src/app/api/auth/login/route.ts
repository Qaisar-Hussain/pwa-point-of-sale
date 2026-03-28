// /app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { authService } from '@/services/authService';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';
import { signJwt } from '@/lib/jwt';

// ✅ Force dynamic runtime so DB calls work on Vercel
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = loginSchema.safeParse(body);
    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return errorResponse('Validation failed', 400, errors);
    }

    const result = await authService.login(validated.data);
    if (!result.success) {
      if (result.error && !result.error.includes('Invalid email or password')) {
        return errorResponse(result.error, 500);
      }
      return unauthorizedResponse(result.error || 'Invalid credentials');
    }

    const user = result.user!;
    const token = await signJwt({ id: user.id, email: user.email, role: user.role });

    const response = successResponse({ user }, 'Login successful');

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}