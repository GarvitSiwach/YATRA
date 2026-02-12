import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PostsGrid from '@/components/PostsGrid';
import ProfileHeader from '@/components/ProfileHeader';
import { getSessionUserFromCookies } from '@/lib/auth';
import {
  getFollowersCount,
  getFollowingCount,
  readLikesFile,
  getTripsByUserId,
  getUserById,
  isFollowingUser
} from '@/lib/storage';

type TravelerPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: TravelerPageProps): Promise<Metadata> {
  return {
    title: `Traveler ${params.id}`
  };
}

export default async function TravelerPage({ params }: TravelerPageProps): Promise<JSX.Element> {
  const traveler = await getUserById(params.id);

  if (!traveler) {
    notFound();
  }

  const sessionUser = await getSessionUserFromCookies();

  const [allTrips, followersCount, followingCount, following, likesPayload] = await Promise.all([
    getTripsByUserId(traveler.id),
    getFollowersCount(traveler.id),
    getFollowingCount(traveler.id),
    sessionUser ? isFollowingUser(sessionUser.id, traveler.id) : Promise.resolve(false),
    readLikesFile()
  ]);

  const publicTrips = allTrips
    .filter((trip) => trip.isPublic === true)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const likesCountMap = new Map<string, number>();

  for (const like of likesPayload.likes) {
    likesCountMap.set(like.tripId, (likesCountMap.get(like.tripId) ?? 0) + 1);
  }

  const posts = publicTrips.map((trip) => ({
    id: trip.id,
    destination: trip.destination,
    likesCount: likesCountMap.get(trip.id) ?? 0
  }));

  const isOwnProfile = Boolean(sessionUser && sessionUser.id === traveler.id);

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-6 py-12">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <ProfileHeader
          user={{
            id: traveler.id,
            name: traveler.name,
            email: traveler.email,
            profileImage: traveler.profileImage,
            bio: traveler.bio
          }}
          followersCount={followersCount}
          followingCount={followingCount}
          totalPosts={publicTrips.length}
          isOwnProfile={isOwnProfile}
          editHref="/profile#edit-profile"
          isFollowing={following}
          canFollowInteract={Boolean(sessionUser)}
        />

        <section className="space-y-4">
          <h2 className="font-serif text-4xl text-[#1B1B1F]">Posts</h2>
          <PostsGrid posts={posts} />
        </section>
      </div>
    </main>
  );
}
