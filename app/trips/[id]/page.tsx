import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import ItineraryBuilder from '@/components/ItineraryBuilder';
import ProtectedNavbar from '@/components/ProtectedNavbar';
import ShareLinkBox from '@/components/ShareLinkBox';
import { getSessionUserFromCookies } from '@/lib/auth';
import { updateTripForUser } from '@/lib/storage';
import { formatHumanDate } from '@/lib/trip-utils';

type TripPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  return {
    title: `Trip ${params.id}`
  };
}

export default async function TripPage({ params }: TripPageProps): Promise<JSX.Element> {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  const trip = await updateTripForUser(params.id, user.id, (currentTrip) => ({
    ...currentTrip,
    lastViewedAt: new Date().toISOString()
  }));

  if (!trip) {
    notFound();
  }

  return (
    <>
      <ProtectedNavbar userName={user.name} />
      <main className="min-h-screen bg-[#FAF9F5] px-6 py-10">
        <div className="mx-auto w-full max-w-7xl space-y-7">
          <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
            <p className="text-xs uppercase tracking-[0.3em] text-[#CBA258]">Trip Overview</p>
            <h1 className="mt-3 font-serif text-5xl text-[#1B1B1F]">{trip.destination}</h1>
            <p className="mt-2 text-sm text-[#1B1B1F]/70">
              {formatHumanDate(trip.startDate)} - {formatHumanDate(trip.endDate)}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#1B1B1F]/75">
              <span className="rounded-full bg-[#CBA258]/15 px-3 py-1">{trip.travelType}</span>
              <span className="rounded-full border border-[#1B1B1F]/10 px-3 py-1">
                Budget: {trip.budget}
              </span>
            </div>

            {trip.notes ? (
              <p className="mt-5 max-w-3xl text-sm text-[#1B1B1F]/70">{trip.notes}</p>
            ) : null}
          </section>

          <section className="grid gap-7 xl:grid-cols-[1.5fr_1fr]">
            <ItineraryBuilder tripId={trip.id} initialDays={trip.itineraryDays} />

            <div className="space-y-7">
              <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
                <h2 className="font-serif text-2xl text-[#1B1B1F]">
                  AI Trip Planner (Coming Soon)
                </h2>
                <p className="mt-2 text-sm text-[#1B1B1F]/65">
                  AI-assisted itinerary generation is being prepared for this workspace.
                </p>

                <div className="mt-5 space-y-3">
                  <input
                    placeholder="Describe your dream trip"
                    className="w-full rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F]/70 outline-none"
                    readOnly
                  />
                  <button
                    type="button"
                    className="rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/70"
                    disabled
                  >
                    Generate
                  </button>
                </div>

                <p className="mt-4 text-sm text-[#1B1B1F]/60">
                  Placeholder response: Soon, this section will produce structured day-wise
                  suggestions.
                </p>
              </section>

              <ShareLinkBox tripId={trip.id} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
