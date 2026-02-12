import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'yatra_session';

function getSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

async function isTokenValid(token: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret) {
    return false;
  }

  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token || !(await isTokenValid(token))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/trips/:path*', '/profile/:path*', '/notifications/:path*']
};
