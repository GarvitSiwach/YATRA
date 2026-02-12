import { NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import { createTrip, getTripsByUserId } from '@/lib/storage';
import { buildItineraryDays, isTravelType, parseDateOnly } from '@/lib/trip-utils';
import { Trip } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trips = await getTripsByUserId(sessionUser.id);
    trips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ trips }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch trips right now.' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    const destination = typeof body.destination === 'string' ? body.destination.trim() : '';
    const startDate = typeof body.startDate === 'string' ? body.startDate : '';
    const endDate = typeof body.endDate === 'string' ? body.endDate : '';
    const budget = typeof body.budget === 'string' ? body.budget.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    const travelType = body.travelType;

    if (!destination || !startDate || !endDate || !budget || !isTravelType(travelType)) {
      return NextResponse.json({ error: 'Please fill all required fields.' }, { status: 400 });
    }

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    if (!start || !end || end < start) {
      return NextResponse.json({ error: 'Please provide a valid date range.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      userId: sessionUser.id,
      destination,
      startDate,
      endDate,
      budget,
      travelType,
      notes,
      itineraryDays: buildItineraryDays(startDate, endDate),
      isPublic: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastViewedAt: null
    };

    await createTrip(newTrip);

    return NextResponse.json({ trip: newTrip }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create trip right now.' }, { status: 500 });
  }
}
