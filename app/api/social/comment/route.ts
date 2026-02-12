import { NextRequest, NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import {
  addComment,
  createNotification,
  getCommentsByTripId,
  getTripById,
  getUserById,
  getUsers
} from '@/lib/storage';
import { Notification } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const tripId = request.nextUrl.searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required.' }, { status: 400 });
    }

    const [comments, users] = await Promise.all([getCommentsByTripId(tripId), getUsers()]);
    const usersMap = new Map(users.map((user) => [user.id, user]));

    const result = comments
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((comment) => ({
        ...comment,
        user: {
          id: comment.userId,
          name: usersMap.get(comment.userId)?.name ?? 'Traveler'
        }
      }));

    return NextResponse.json({ comments: result }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to load comments right now.' }, { status: 500 });
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
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!tripId || !content) {
      return NextResponse.json({ error: 'tripId and content are required.' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or fewer.' },
        { status: 400 }
      );
    }

    const trip = await getTripById(tripId);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    const comment = await addComment(tripId, sessionUser.id, content);

    if (trip.userId !== sessionUser.id) {
      const notification: Notification = {
        id: crypto.randomUUID(),
        userId: trip.userId,
        type: 'comment',
        actorId: sessionUser.id,
        tripId,
        createdAt: new Date().toISOString(),
        read: false
      };

      await createNotification(notification);
    }

    const commenter = await getUserById(sessionUser.id);

    return NextResponse.json(
      {
        comment: {
          ...comment,
          user: {
            id: sessionUser.id,
            name: commenter?.name ?? 'Traveler'
          }
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Unable to add comment right now.' }, { status: 500 });
  }
}
