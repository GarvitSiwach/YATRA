'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLogoutButton(): JSX.Element {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleClick(): Promise<void> {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-full border border-black/15 px-4 py-2 text-sm text-black/75 transition-all duration-200 ease-out hover:border-gold hover:text-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
