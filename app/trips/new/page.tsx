import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import CreateTripForm from '@/components/CreateTripForm';
import ProtectedNavbar from '@/components/ProtectedNavbar';
import { getSessionUserFromCookies } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Create Trip'
};

export default async function NewTripPage(): Promise<JSX.Element> {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <ProtectedNavbar userName={user.name} />
      <main className="min-h-screen bg-[#FAF9F5] px-6 py-10">
        <CreateTripForm />
      </main>
    </>
  );
}
