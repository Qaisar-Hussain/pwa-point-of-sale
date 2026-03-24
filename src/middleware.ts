import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Protected routes - require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  
  // Auth routes - should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Check if token is valid
  const isTokenValid = token ? (await verifyJwt(token)) !== null : false;

  // If accessing protected route without valid token
  if (isProtectedRoute && !isTokenValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing auth route with valid token
  if (isAuthRoute && isTokenValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/profile/:path*', '/settings/:path*'],
};
