import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/utils';

export function proxy(request) {
  // Check for token in cookies OR Authorization header
  let token = request.cookies.get('token')?.value || 
              request.headers.get('Authorization')?.split(' ')[1];
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');
  
  // Allow dashboard access without token check for now (for testing)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && !isAuthPage) {
    const decoded = verifyToken(token);
    if (!decoded && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/payment/:path*', '/profile/:path*'],
};