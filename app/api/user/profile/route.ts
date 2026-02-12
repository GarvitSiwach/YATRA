import { NextResponse } from 'next/server';

import {
  createSessionToken,
  getSessionUserFromCookies,
  SESSION_COOKIE_NAME,
  sessionCookieOptions
} from '@/lib/auth';
import { getTripsByUserId, getUserById, updateUserProfile } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [trips, user] = await Promise.all([
      getTripsByUserId(sessionUser.id),
      getUserById(sessionUser.id)
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          bio: user.bio,
          createdAt: user.createdAt,
          totalTrips: trips.length
        }
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Unable to load profile right now.' }, { status: 500 });
  }
}

function parseBio(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized.slice(0, 220) : undefined;
}

function parseProfileImage(value: unknown): string | undefined | null {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const hasBio = Object.prototype.hasOwnProperty.call(body, 'bio');
    const hasProfileImage = Object.prototype.hasOwnProperty.call(body, 'profileImage');
    const bio = hasBio ? parseBio(body.bio) : undefined;
    const profileImage = hasProfileImage ? parseProfileImage(body.profileImage) : undefined;

    if (profileImage === null) {
      return NextResponse.json(
        { error: 'Please provide a valid image URL (http or https).' },
        { status: 400 }
      );
    }

    const updates: { bio?: string; profileImage?: string } = {};

    if (hasBio) {
      updates.bio = bio;
    }

    if (hasProfileImage) {
      updates.profileImage = profileImage;
    }

    const updatedUser = await updateUserProfile(sessionUser.id, updates);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const token = await createSessionToken(updatedUser);
    const response = NextResponse.json({ profile: updatedUser }, { status: 200 });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to update profile right now.' }, { status: 500 });
  }
}
