'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NotificationBell(): JSX.Element {
  const [unreadCount, setUnreadCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function loadUnreadCount(): Promise<void> {
      try {
        const response = await fetch('/api/notifications', { cache: 'no-store' });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { unreadCount?: number };

        if (!ignore && typeof payload.unreadCount === 'number') {
          setUnreadCount(payload.unreadCount);
        }
      } catch {
        if (!ignore) {
          setUnreadCount(0);
        }
      }
    }

    void loadUnreadCount();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  async function handleClick(): Promise<void> {
    if (pathname === '/notifications') {
      setUnreadCount(0);
      return;
    }

    setUpdating(true);
    try {
      await fetch('/api/notifications', {
        method: 'PUT'
      });
      setUnreadCount(0);
      router.push('/notifications');
      router.refresh();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={updating}
        className="rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F]"
      >
        Notifications
      </button>

      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 rounded-full bg-[#CBA258] px-2 py-0.5 text-[10px] font-medium text-[#1B1B1F]">
          {unreadCount}
        </span>
      ) : null}
    </div>
  );
}
