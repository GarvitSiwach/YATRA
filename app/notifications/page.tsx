import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import NotificationPanel from '@/components/NotificationPanel';
import ProtectedNavbar from '@/components/ProtectedNavbar';
import { getSessionUserFromCookies } from '@/lib/auth';
import { markNotificationsRead } from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Notifications'
};

export default async function NotificationsPage(): Promise<JSX.Element> {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  await markNotificationsRead(user.id);

  return (
    <>
      <ProtectedNavbar userName={user.name} />
      <main className="min-h-screen bg-[#FAF9F5] px-6 py-10">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-[#CBA258]">Social</p>
            <h1 className="mt-2 font-serif text-5xl text-[#1B1B1F]">Notification Center</h1>
          </header>

          <NotificationPanel mode="page" />
        </div>
      </main>
    </>
  );
}
