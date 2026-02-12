import { ItineraryDay, TravelType, Trip } from '@/lib/types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MAX_AUTO_DAYS = 30;

export function isTravelType(value: unknown): value is TravelType {
  return value === 'Solo' || value === 'Friends' || value === 'Family' || value === 'Luxury';
}

export function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function buildItineraryDays(startDate: string, endDate: string): ItineraryDay[] {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end || end < start) {
    return [
      {
        id: crypto.randomUUID(),
        title: 'Day 1',
        activities: []
      }
    ];
  }

  const diff = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const totalDays = Math.min(Math.max(diff, 1), MAX_AUTO_DAYS);

  return Array.from({ length: totalDays }, (_, index) => ({
    id: crypto.randomUUID(),
    title: `Day ${index + 1}`,
    activities: []
  }));
}

export function countUpcomingTrips(trips: Trip[]): number {
  const today = new Date();
  const utcToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  return trips.filter((trip) => {
    const start = parseDateOnly(trip.startDate);
    if (!start) {
      return false;
    }

    return start.getTime() >= utcToday.getTime();
  }).length;
}

export function formatHumanDate(value: string): string {
  const date = parseDateOnly(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
