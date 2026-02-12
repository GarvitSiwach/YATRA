import { NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import { createNotification } from '@/lib/storage';
import { Notification, NotificationType } from '@/lib/types';

function isNotificationType(value: unknown): value is NotificationType {
  return value === 'follow' || value === 'like' || value === 'comment';
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const actor = await getSessionUserFromCookies();

    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const userId = typeof body.userId === 'string' ? body.userId : '';
    const type = body.type;
    const tripId = typeof body.tripId === 'string' ? body.tripId : undefined;

    if (!userId || !isNotificationType(type)) {
      return NextResponse.json({ error: 'Invalid notification payload.' }, { status: 400 });
    }

    if (userId === actor.id) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      actorId: actor.id,
      tripId,
      createdAt: new Date().toISOString(),
      read: false
    };

    await createNotification(notification);

    return NextResponse.json({ notification }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to create notification right now.' },
      { status: 500 }
    );
  }
}
