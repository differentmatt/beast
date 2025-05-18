import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  try {
    console.log('Middleware: Attempting to get token with secret length:',
      process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.length : 'undefined');

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Check if the user is authenticated
    if (!token) {
      console.log('Middleware: No token found, redirecting to sign-in');
      // Redirect to the sign-in page if not authenticated
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    console.log('Middleware: Valid token found, proceeding');
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue to next middleware/page on error instead of breaking
    return NextResponse.next();
  }
}

// Specify the paths that should be protected by the middleware
export const config = {
  matcher: [
    // Add routes that require authentication
    '/settings',
    '/settings/:path*',
    // Add more protected routes as needed
  ],
};