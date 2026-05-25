import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPrefixes = ['/dashboard', '/account'];
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const privyToken = request.cookies.get('privy-token');
    if (!privyToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Apply caching headers based on route type
  if (isProtected || pathname.startsWith('/api/') || pathname === '/login') {
    response.headers.set('Cache-Control', 'private, no-store');
  } else if (!pathname.startsWith('/_next/') && pathname !== '/') {
    // Public publication/post pages
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
