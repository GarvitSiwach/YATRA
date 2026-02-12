'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { formatTimeAgo } from '@/lib/time';

type NotificationWithActor = {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment';
  actorId: string;
  tripId?: string;
  createdAt: string;
  read: boolean;
  actor: {
    id: string;
    name: string;
  };
};

type NotificationPanelProps = {
  mode: 'dropdown' | 'page';
  open?: boolean;
  onUnreadCountChange?: (count: number) => void;
};

function getMessage(notification: NotificationWithActor): string {
  if (notification.type === 'follow') {
    return 'started following you';
  }

  if (notification.type === 'like') {
    return 'liked your trip';
  }

  return 'commented on your trip';
}

export default function NotificationPanel({
  mode,
  open = true,
  onUnreadCountChange
}: NotificationPanelProps): JSX.Element {
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications(): Promise<void> {
      setLoading(true);

      try {
        const response = await fetch('/api/notifications', { cache: 'no-store' });

        if (!response.ok) {
          if (!ignore) {
            setNotifications([]);
          }
          return;
        }

        const payload = (await response.json()) as {
          notifications?: NotificationWithActor[];
        };

        if (!ignore) {
          setNotifications(payload.notifications ?? []);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (mode === 'dropdown' && !open) {
      return;
    }

    void loadNotifications();

    return () => {
      ignore = true;
    };
  }, [mode, open]);

  const baseClassName =
    mode === 'dropdown'
      ? `absolute right-0 top-12 z-40 w-[360px] origin-top-right rounded-2xl border border-[#1B1B1F]/10 bg-white p-4 shadow-card transition-all duration-200 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        }`
      : 'w-full rounded-3xl border border-[#1B1B1F]/10 bg-white p-5 shadow-card sm:p-6';

  return (
    <section className={baseClassName}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl text-[#1B1B1F]">Notifications</h2>
        <span className="rounded-full bg-[#CBA258]/15 px-3 py-1 text-xs text-[#1B1B1F]">
          {unreadCount} unread
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-[#1B1B1F]/60">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="mt-4 text-sm text-[#1B1B1F]/60">No notifications yet.</p>
      ) : (
        <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-3 transition-colors duration-200 ease-out ${
                notification.read
                  ? 'border-[#1B1B1F]/10 bg-white'
                  : 'border-[#CBA258]/30 bg-[#CBA258]/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/traveler/${notification.actor.id}`}
                  className="text-sm font-medium text-[#1B1B1F] transition-colors duration-200 ease-out hover:text-[#CBA258]"
                >
                  {notification.actor.name}
                </Link>
                <span className="text-xs text-[#1B1B1F]/55">
                  {formatTimeAgo(notification.createdAt)}
                </span>
              </div>

              <p className="mt-1 text-sm text-[#1B1B1F]/75">{getMessage(notification)}</p>

              {notification.tripId ? (
                <Link
                  href={`/public/trip/${notification.tripId}`}
                  className="mt-2 inline-flex text-xs text-[#1B1B1F]/70 underline underline-offset-4 transition-colors duration-200 ease-out hover:text-[#1B1B1F]"
                >
                  View Trip
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
