import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import ProfilePageContent from '@/components/ProfilePageContent';
import ProtectedNavbar from '@/components/ProtectedNavbar';
import { getSessionUserFromCookies } from '@/lib/auth';
import {
  getFollowersCount,
  getFollowingCount,
  getTripsByUserId,
  getUserById,
  readLikesFile
} from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Profile'
};

export default async function ProfilePage(): Promise<JSX.Element> {
  const sessionUser = await getSessionUserFromCookies();

  if (!sessionUser) {
    redirect('/login');
  }

  const user = await getUserById(sessionUser.id);

  if (!user) {
    redirect('/login');
  }

  const [trips, followersCount, followingCount, likesPayload] = await Promise.all([
    getTripsByUserId(user.id),
    getFollowersCount(user.id),
    getFollowingCount(user.id),
    readLikesFile()
  ]);

  const likesCountMap = new Map<string, number>();

  for (const like of likesPayload.likes) {
    likesCountMap.set(like.tripId, (likesCountMap.get(like.tripId) ?? 0) + 1);
  }

  const posts = trips
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((trip) => ({
      id: trip.id,
      destination: trip.destination,
      likesCount: likesCountMap.get(trip.id) ?? 0
    }));

  return (
    <>
      <ProtectedNavbar userName={user.name} />
      <main className="min-h-screen bg-[#FAF9F5] px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <ProfilePageContent
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              profileImage: user.profileImage,
              bio: user.bio
            }}
            followersCount={followersCount}
            followingCount={followingCount}
            posts={posts}
          />
        </div>
      </main>
    </>
  );
}
