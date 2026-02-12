import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import DashboardStats from '@/components/DashboardStats';
import ProtectedNavbar from '@/components/ProtectedNavbar';
import { getSessionUserFromCookies } from '@/lib/auth';
import { getTripsByUserId } from '@/lib/storage';
import { countUpcomingTrips } from '@/lib/trip-utils';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function DashboardPage(): Promise<JSX.Element> {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  const trips = await getTripsByUserId(user.id);

  const recentViewedTrip =
    [...trips]
      .filter((trip) => Boolean(trip.lastViewedAt))
      .sort((a, b) => (b.lastViewedAt ?? '').localeCompare(a.lastViewedAt ?? ''))[0] ?? null;

  return (
    <>
      <ProtectedNavbar userName={user.name} />
      <main className="min-h-screen bg-[#FAF9F5] px-6 py-10">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[#CBA258]">Workspace</p>
            <h1 className="font-serif text-5xl text-[#1B1B1F] sm:text-6xl">
              Welcome back, {user.name}
            </h1>
            <p className="max-w-2xl text-sm text-[#1B1B1F]/70">
              Keep every journey intentional. Review progress, track upcoming plans, and jump back
              into your latest trip.
            </p>
          </header>

          <DashboardStats
            totalTrips={trips.length}
            upcomingTrips={countUpcomingTrips(trips)}
            recentlyViewed={recentViewedTrip}
          />

          <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
            <h2 className="font-serif text-3xl text-[#1B1B1F]">Quick Actions</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/trips/new"
                className="rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
              >
                Create Trip
              </Link>
              <Link
                href="/trips"
                className="rounded-full border border-[#1B1B1F]/15 px-5 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F]"
              >
                View All Trips
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-[#1B1B1F]/15 px-5 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F]"
              >
                Edit Profile
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
