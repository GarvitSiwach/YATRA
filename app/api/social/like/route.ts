import { NextRequest, NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import {
  addLike,
  createNotification,
  getLikesByTripId,
  getTripById,
  hasUserLikedTrip,
  removeLike
} from '@/lib/storage';
import { Notification } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const tripId = request.nextUrl.searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required.' }, { status: 400 });
    }

    const likes = await getLikesByTripId(tripId);
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ liked: false, likesCount: likes.length }, { status: 200 });
    }

    const liked = likes.some((like) => like.userId === sessionUser.id);
    return NextResponse.json({ liked, likesCount: likes.length }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch likes right now.' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const tripId = typeof body.tripId === 'string' ? body.tripId : '';

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required.' }, { status: 400 });
    }

    const trip = await getTripById(tripId);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    const alreadyLiked = await hasUserLikedTrip(tripId, sessionUser.id);

    if (alreadyLiked) {
      await removeLike(tripId, sessionUser.id);
      const likesCount = (await getLikesByTripId(tripId)).length;
      return NextResponse.json({ liked: false, likesCount }, { status: 200 });
    }

    const result = await addLike(tripId, sessionUser.id);

    if (result.created && trip.userId !== sessionUser.id) {
      const notification: Notification = {
        id: crypto.randomUUID(),
        userId: trip.userId,
        type: 'like',
        actorId: sessionUser.id,
        tripId,
        createdAt: new Date().toISOString(),
        read: false
      };

      await createNotification(notification);
    }

    const likesCount = (await getLikesByTripId(tripId)).length;
    return NextResponse.json({ liked: true, likesCount }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to update likes right now.' }, { status: 500 });
  }
}
