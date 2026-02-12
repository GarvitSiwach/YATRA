import { NextRequest, NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import {
  addFollow,
  createNotification,
  getFollowersCount,
  getUserById,
  isFollowingUser,
  removeFollow
} from '@/lib/storage';
import { Notification } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const targetUserId = request.nextUrl.searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    const followerCount = await getFollowersCount(targetUserId);
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ isFollowing: false, followerCount }, { status: 200 });
    }

    const isFollowing = await isFollowingUser(sessionUser.id, targetUserId);
    return NextResponse.json({ isFollowing, followerCount }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to fetch follow status right now.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId : '';

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required.' }, { status: 400 });
    }

    if (targetUserId === sessionUser.id) {
      return NextResponse.json({ error: 'You cannot follow yourself.' }, { status: 400 });
    }

    const targetUser = await getUserById(targetUserId);

    if (!targetUser) {
      return NextResponse.json({ error: 'Traveler not found.' }, { status: 404 });
    }

    const alreadyFollowing = await isFollowingUser(sessionUser.id, targetUserId);

    if (alreadyFollowing) {
      await removeFollow(sessionUser.id, targetUserId);
      const followerCount = await getFollowersCount(targetUserId);
      return NextResponse.json({ following: false, followerCount }, { status: 200 });
    }

    await addFollow(sessionUser.id, targetUserId);

    const notification: Notification = {
      id: crypto.randomUUID(),
      userId: targetUserId,
      type: 'follow',
      actorId: sessionUser.id,
      createdAt: new Date().toISOString(),
      read: false
    };

    await createNotification(notification);

    const followerCount = await getFollowersCount(targetUserId);
    return NextResponse.json({ following: true, followerCount }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to update follow status right now.' },
      { status: 500 }
    );
  }
}
