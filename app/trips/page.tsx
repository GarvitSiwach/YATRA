import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import ProtectedNavbar from '@/components/ProtectedNavbar';
import TripCard from '@/components/TripCard';
import { getSessionUserFromCookies } from '@/lib/auth';
import { getTripsByUserId } from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Trips'
};

export default async function TripsPage(): Promise<JSX.Element> {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  const trips = await getTripsByUserId(user.id);
  trips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <ProtectedNavbar userName={user.name} />
      <main className="min-h-screen bg-[#FAF9F5] px-6 py-10">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#CBA258]">Trips</p>
              <h1 className="mt-2 font-serif text-5xl text-[#1B1B1F] sm:text-6xl">Your Journeys</h1>
              <p className="mt-2 text-sm text-[#1B1B1F]/70">
                All trips associated with your account.
              </p>
            </div>

            <Link
              href="/trips/new"
              className="rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
            >
              Create Trip
            </Link>
          </header>

          {trips.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-[#1B1B1F]/20 bg-white p-10 text-center shadow-card">
              <h2 className="font-serif text-3xl text-[#1B1B1F]">No trips yet</h2>
              <p className="mt-2 text-sm text-[#1B1B1F]/60">
                Start by creating your first journey.
              </p>
            </section>
          ) : (
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
