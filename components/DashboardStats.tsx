import Link from 'next/link';

import { formatHumanDate } from '@/lib/trip-utils';
import { Trip } from '@/lib/types';

type DashboardStatsProps = {
  totalTrips: number;
  upcomingTrips: number;
  recentlyViewed: Trip | null;
};

export default function DashboardStats({
  totalTrips,
  upcomingTrips,
  recentlyViewed
}: DashboardStatsProps): JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_1fr]">
      <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Overview</p>
        <h2 className="mt-3 font-serif text-4xl text-[#1B1B1F]">{totalTrips} Total Trips</h2>
        <p className="mt-3 text-sm text-[#1B1B1F]/70">
          Every journey you create lives here in your private workspace.
        </p>
      </section>

      <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Upcoming</p>
        <p className="mt-4 text-4xl font-semibold text-[#1B1B1F]">{upcomingTrips}</p>
        <p className="mt-2 text-sm text-[#1B1B1F]/70">Trips with future start dates.</p>
      </section>

      <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Recently Viewed</p>
        {recentlyViewed ? (
          <div className="mt-3 space-y-1">
            <p className="font-serif text-2xl text-[#1B1B1F]">{recentlyViewed.destination}</p>
            <p className="text-sm text-[#1B1B1F]/65">
              {formatHumanDate(recentlyViewed.startDate)} -{' '}
              {formatHumanDate(recentlyViewed.endDate)}
            </p>
            <Link
              href={`/trips/${recentlyViewed.id}`}
              className="mt-4 inline-flex rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F]"
            >
              Open Trip
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#1B1B1F]/60">No trip viewed yet.</p>
        )}
      </section>
    </div>
  );
}
