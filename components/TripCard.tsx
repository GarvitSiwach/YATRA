'use client';

import Link from 'next/link';
import { useState } from 'react';

import { formatHumanDate } from '@/lib/trip-utils';
import { Trip } from '@/lib/types';

type TripCardProps = {
  trip: Trip;
};

export default function TripCard({ trip }: TripCardProps): JSX.Element {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  async function handleShare(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const shareUrl = `${window.location.origin}/public/trip/${trip.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('idle');
    }
  }

  return (
    <article className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-6 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl text-[#1B1B1F]">{trip.destination}</h2>
        <p className="text-sm text-[#1B1B1F]/65">
          {formatHumanDate(trip.startDate)} - {formatHumanDate(trip.endDate)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-[#CBA258]/15 px-3 py-1 text-[#1B1B1F]">
          {trip.travelType}
        </span>
        <span className="rounded-full border border-[#1B1B1F]/10 px-3 py-1 text-[#1B1B1F]/70">
          Budget: {trip.budget}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/trips/${trip.id}`}
          className="rounded-full bg-[#1B1B1F] px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
        >
          View
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F] active:scale-[0.98]"
        >
          {copyState === 'copied' ? 'Link Copied' : 'Share'}
        </button>
      </div>
    </article>
  );
}
