import { NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import { getTripByIdForUser, updateTripForUser } from '@/lib/storage';
import { buildItineraryDays, isTravelType, parseDateOnly } from '@/lib/trip-utils';
import { ItineraryDay, Trip } from '@/lib/types';

export const runtime = 'nodejs';

type RouteContext = {
  params: {
    id: string;
  };
};

function normalizeItineraryDays(input: unknown): ItineraryDay[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  return input
    .map((rawDay, dayIndex) => {
      if (!rawDay || typeof rawDay !== 'object') {
        return null;
      }

      const dayRecord = rawDay as Record<string, unknown>;
      const title =
        typeof dayRecord.title === 'string' && dayRecord.title.trim()
          ? dayRecord.title.trim()
          : `Day ${dayIndex + 1}`;
      const dayId =
        typeof dayRecord.id === 'string' && dayRecord.id.trim()
          ? dayRecord.id
          : crypto.randomUUID();

      const rawActivities = Array.isArray(dayRecord.activities) ? dayRecord.activities : [];

      const activities = rawActivities
        .map((rawActivity) => {
          if (!rawActivity || typeof rawActivity !== 'object') {
            return null;
          }

          const activityRecord = rawActivity as Record<string, unknown>;
          const name = typeof activityRecord.name === 'string' ? activityRecord.name.trim() : '';
          if (!name) {
            return null;
          }

          const id =
            typeof activityRecord.id === 'string' && activityRecord.id.trim()
              ? activityRecord.id
              : crypto.randomUUID();
          return { id, name };
        })
        .filter((activity): activity is { id: string; name: string } => Boolean(activity));

      return {
        id: dayId,
        title,
        activities
      };
    })
    .filter((day): day is ItineraryDay => Boolean(day));
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const viewedAt = new Date().toISOString();
    const updatedTrip = await updateTripForUser(context.params.id, sessionUser.id, (trip) => ({
      ...trip,
      lastViewedAt: viewedAt
    }));

    if (!updatedTrip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    return NextResponse.json({ trip: updatedTrip }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch this trip right now.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTrip = await getTripByIdForUser(context.params.id, sessionUser.id);

    if (!existingTrip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (body.travelType !== undefined && !isTravelType(body.travelType)) {
      return NextResponse.json({ error: 'Invalid travel type.' }, { status: 400 });
    }

    const nextDestination =
      typeof body.destination === 'string' && body.destination.trim()
        ? body.destination.trim()
        : existingTrip.destination;
    const nextStartDate =
      typeof body.startDate === 'string' ? body.startDate : existingTrip.startDate;
    const nextEndDate = typeof body.endDate === 'string' ? body.endDate : existingTrip.endDate;
    const nextBudget =
      typeof body.budget === 'string' && body.budget.trim()
        ? body.budget.trim()
        : existingTrip.budget;
    const nextNotes = typeof body.notes === 'string' ? body.notes.trim() : existingTrip.notes;
    const nextTravelType = isTravelType(body.travelType)
      ? body.travelType
      : existingTrip.travelType;

    const start = parseDateOnly(nextStartDate);
    const end = parseDateOnly(nextEndDate);

    if (!start || !end || end < start) {
      return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 });
    }

    let nextItineraryDays = existingTrip.itineraryDays;

    if (body.itineraryDays !== undefined) {
      const normalized = normalizeItineraryDays(body.itineraryDays);
      if (!normalized || normalized.length === 0) {
        return NextResponse.json({ error: 'Invalid itinerary payload.' }, { status: 400 });
      }
      nextItineraryDays = normalized;
    } else if (body.startDate !== undefined || body.endDate !== undefined) {
      nextItineraryDays = buildItineraryDays(nextStartDate, nextEndDate);
    }

    const updatedAt = new Date().toISOString();

    const updatedTrip = await updateTripForUser(
      context.params.id,
      sessionUser.id,
      (trip): Trip => ({
        ...trip,
        destination: nextDestination,
        startDate: nextStartDate,
        endDate: nextEndDate,
        budget: nextBudget,
        notes: nextNotes,
        travelType: nextTravelType,
        itineraryDays: nextItineraryDays,
        updatedAt
      })
    );

    if (!updatedTrip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    return NextResponse.json({ trip: updatedTrip }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to update this trip right now.' }, { status: 500 });
  }
}
