import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, sessionCookieOptions, verifySessionToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = await verifySessionToken(token);
  if (!user) {
    const response = NextResponse.json({ user: null });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      ...sessionCookieOptions,
      maxAge: 0
    });
    return response;
  }

  return NextResponse.json({ user });
}
