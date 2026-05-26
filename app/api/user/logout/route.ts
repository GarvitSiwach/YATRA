import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  try {
    const response = NextResponse.json({ ok: true }, { status: 200 });

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to log out right now.' }, { status: 500 });
  }
}
