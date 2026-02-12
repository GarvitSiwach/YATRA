'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProfileCardProps = {
  name: string;
  email: string;
  totalTrips: number;
  createdAt: string;
};

export default function ProfileCard({
  name,
  email,
  totalTrips,
  createdAt
}: ProfileCardProps): JSX.Element {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);

    try {
      await fetch('/api/user/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const joinedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(createdAt));

  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#1B1B1F]/10 bg-white p-8 shadow-card sm:p-10">
      <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Profile</p>
      <h1 className="mt-3 font-serif text-5xl text-[#1B1B1F]">{name}</h1>
      <p className="mt-2 text-[#1B1B1F]/70">{email}</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#CBA258]">Total Trips</p>
          <p className="mt-2 text-3xl font-semibold text-[#1B1B1F]">{totalTrips}</p>
        </article>

        <article className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#CBA258]">Member Since</p>
          <p className="mt-2 text-lg text-[#1B1B1F]">{joinedDate}</p>
        </article>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-8 rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </section>
  );
}
