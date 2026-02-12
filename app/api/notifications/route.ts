import { NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import { getNotificationsByUserId, getUsers, markNotificationsRead } from '@/lib/storage';

export async function GET(): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [notifications, users] = await Promise.all([
      getNotificationsByUserId(sessionUser.id),
      getUsers()
    ]);

    const usersMap = new Map(users.map((user) => [user.id, user]));

    const enriched = notifications.map((notification) => ({
      ...notification,
      actor: {
        id: notification.actorId,
        name: usersMap.get(notification.actorId)?.name ?? 'Traveler'
      }
    }));

    const unreadCount = notifications.filter((notification) => !notification.read).length;

    return NextResponse.json({ notifications: enriched, unreadCount }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to load notifications right now.' }, { status: 500 });
  }
}

export async function PUT(): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await markNotificationsRead(sessionUser.id);

    return NextResponse.json({ ok: true, updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to update notifications right now.' },
      { status: 500 }
    );
  }
}
