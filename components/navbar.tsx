'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Feed' },
  { href: '/#features', label: 'Features' },
  { href: '/#contact', label: 'Contact' }
];

export default function Navbar(): JSX.Element {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function loadSession(): Promise<void> {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { user: SessionUser | null };
        if (!ignore) {
          setUser(payload.user);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      }
    }

    void loadSession();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  async function handleLogout(): Promise<void> {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-wide text-ink">
          YĀTRA
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-black/65 transition-colors duration-200 ease-out hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border border-black/15 px-4 py-2 text-sm text-black/80 transition-all duration-200 ease-out hover:border-gold/70 hover:text-ink"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="rounded-full bg-ink px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Signing out...' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-black/15 px-4 py-2 text-sm text-black/80 transition-all duration-200 ease-out hover:border-gold/70 hover:text-ink"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
