import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'yatra_session';

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/trips' ||
    pathname.startsWith('/trips/') ||
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/notifications' ||
    pathname.startsWith('/notifications/')
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/trips/:path*', '/profile/:path*', '/notifications/:path*']
};
