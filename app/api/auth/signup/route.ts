import { NextResponse } from 'next/server';

import { hashPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { createUser, findUserByEmail } from '@/lib/storage';

export const runtime = 'nodejs';

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function parseSignupPayload(request: Request): Promise<SignupPayload | null> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    return {
      name: normalizeText(body.name),
      email: normalizeEmail(body.email),
      password: normalizeText(body.password)
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const payload = await parseSignupPayload(request);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { name, email, password } = payload;

  if (!name || !isValidEmail(email) || password.length < 8) {
    return NextResponse.json(
      { error: 'Please provide a valid name, email, and password (minimum 8 characters).' },
      { status: 400 }
    );
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account already exists with this email.' },
        { status: 409 }
      );
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString()
    };

    await createUser(user);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(user.id), sessionCookieOptions);

    return response;
  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json({ error: 'Unable to create account right now.' }, { status: 500 });
  }
}
