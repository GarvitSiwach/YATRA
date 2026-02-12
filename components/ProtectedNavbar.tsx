'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import NotificationBell from '@/components/NotificationBell';

type ProtectedNavbarProps = {
  userName: string;
};

type SearchUser = {
  id: string;
  name: string;
  email: string;
};

const links = [
  { href: '/feed', label: 'Feed' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/trips', label: 'Trips' },
  { href: '/profile', label: 'Profile' }
];

export default function ProtectedNavbar({ userName }: ProtectedNavbarProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setLoadingSearch(false);
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoadingSearch(true);

      try {
        const response = await fetch(`/api/search/users?query=${encodeURIComponent(trimmed)}`, {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) {
          if (!ignore) {
            setResults([]);
          }
          return;
        }

        const payload = (await response.json()) as {
          users?: SearchUser[];
        };

        if (!ignore) {
          setResults(payload.users ?? []);
          setShowResults(true);
        }
      } catch {
        if (!ignore) {
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setLoadingSearch(false);
        }
      }
    }, 200);

    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      if (!searchRef.current) {
        return;
      }

      if (!searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

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

  function handleSearchSelect(userId: string): void {
    setQuery('');
    setResults([]);
    setShowResults(false);
    router.push(`/traveler/${userId}`);
  }

  return (
    <header className="border-b border-[#1B1B1F]/10 bg-[#FAF9F5]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-5">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-serif text-2xl tracking-wide text-[#1B1B1F]">
            YĀTRA
          </Link>
          <nav className="hidden items-center gap-3 lg:flex" aria-label="Inner navigation">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ease-out ${
                    active
                      ? 'bg-[#CBA258]/15 text-[#1B1B1F]'
                      : 'text-[#1B1B1F]/70 hover:text-[#1B1B1F]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative mx-auto hidden w-full max-w-md md:block" ref={searchRef}>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search travelers"
            className="w-full rounded-full border border-[#1B1B1F]/15 bg-white px-4 py-2 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/25"
          />

          {showResults && query.trim() ? (
            <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl border border-[#1B1B1F]/10 bg-white p-2 shadow-card">
              {loadingSearch ? (
                <p className="px-3 py-2 text-sm text-[#1B1B1F]/60">Searching...</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2 text-sm text-[#1B1B1F]/60">No travelers found.</p>
              ) : (
                <ul className="space-y-1">
                  {results.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSearchSelect(user.id)}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#1B1B1F] transition-colors duration-200 ease-out hover:bg-[#FAF9F5]"
                      >
                        {user.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="hidden text-sm text-[#1B1B1F]/70 sm:inline">{userName}</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}
