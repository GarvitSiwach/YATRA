import { NextResponse } from 'next/server';

import {
  comparePassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions
} from '@/lib/auth';
import { findUserByEmail, sanitizeUser } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isPasswordCorrect = await comparePassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const safeUser = sanitizeUser(user);
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Unable to log in right now.' }, { status: 500 });
  }
}
