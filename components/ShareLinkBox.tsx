'use client';

import { useMemo, useState } from 'react';

type ShareLinkBoxProps = {
  tripId: string;
};

export default function ShareLinkBox({ tripId }: ShareLinkBoxProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const sharePath = useMemo(() => `/public/trip/${tripId}`, [tripId]);

  async function handleCopy(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const shareUrl = `${window.location.origin}${sharePath}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
      <h2 className="font-serif text-2xl text-[#1B1B1F]">Share Link Generator</h2>
      <p className="mt-2 text-sm text-[#1B1B1F]/65">
        Share your itinerary with anyone using this public link.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <code className="rounded-xl border border-[#1B1B1F]/10 bg-[#FAF9F5] px-3 py-2 text-sm text-[#1B1B1F]/80">
          {sharePath}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full bg-[#1B1B1F] px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
        >
          {copied ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    </section>
  );
}
