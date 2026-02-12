import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    maxAge: 0
  });

  return response;
}
