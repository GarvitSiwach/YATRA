import { NextResponse } from 'next/server';

import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  sessionCookieOptions
} from '@/lib/auth';
import { createUser, findUserByEmail, sanitizeUser } from '@/lib/storage';

export const runtime = 'nodejs';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !isValidEmail(email) || password.length < 8) {
      return NextResponse.json(
        { error: 'Please provide a valid name, email, and password (min 8 chars).' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account already exists with this email.' },
        { status: 409 }
      );
    }

    const userRecord = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString()
    };

    await createUser(userRecord);

    const safeUser = sanitizeUser(userRecord);
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Unable to create account right now.' }, { status: 500 });
  }
}
