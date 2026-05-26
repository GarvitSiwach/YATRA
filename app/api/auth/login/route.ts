import { NextResponse } from 'next/server';

import { verifyPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { findStoredUserByEmail, sanitizeUser } from '@/lib/storage';

export const runtime = 'nodejs';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const storedUser = await findStoredUserByEmail(email);
    const validPassword = await verifyPassword(password, storedUser?.passwordHash);

    if (!storedUser || !validPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const response = NextResponse.json({ user: sanitizeUser(storedUser) });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken(storedUser.id),
      sessionCookieOptions
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Unable to log in right now.' }, { status: 500 });
  }
}
