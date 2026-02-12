import { NextResponse } from 'next/server';

import { saveContactMessage } from '@/lib/storage';

export const runtime = 'nodejs';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !isValidEmail(email) || message.length < 10) {
      return NextResponse.json(
        { error: 'Provide a valid name, email, and message (minimum 10 characters).' },
        { status: 400 }
      );
    }

    await saveContactMessage({
      id: crypto.randomUUID(),
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      { ok: true, message: 'Thanks, your message has been received.' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit your message right now.' },
      { status: 500 }
    );
  }
}
