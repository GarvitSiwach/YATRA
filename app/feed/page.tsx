import type { Metadata } from 'next';

import FeedCard from '@/components/FeedCard';
import SortTabs from '@/components/SortTabs';
import { getSessionUserFromCookies } from '@/lib/auth';
import { buildSocialTrips, getTopTrips, sortSocialTrips } from '@/lib/social';
import {
  getAllTrips,
  getUsers,
  readCommentsFile,
  readFollowsFile,
  readLikesFile
} from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Feed'
};

type FeedPageProps = {
  searchParams?: {
    sort?: string;
  };
};

function normalizeSort(value: string | undefined): 'latest' | 'top' {
  return value === 'top' ? 'top' : 'latest';
}

export default async function FeedPage({ searchParams }: FeedPageProps): Promise<JSX.Element> {
  const sort = normalizeSort(searchParams?.sort);

  const [sessionUser, trips, users, likesPayload, commentsPayload, followsPayload] =
    await Promise.all([
      getSessionUserFromCookies(),
      getAllTrips(),
      getUsers(),
      readLikesFile(),
      readCommentsFile(),
      readFollowsFile()
    ]);

  const socialTrips = buildSocialTrips({
    trips,
    users,
    likes: likesPayload.likes,
    comments: commentsPayload.comments
  });

  const orderedTrips =
    sort === 'top' ? getTopTrips(socialTrips, 10) : sortSocialTrips(socialTrips, 'latest');

  const viewerId = sessionUser?.id ?? null;

  const likesByTripUserKey = new Set(
    likesPayload.likes.map((like) => `${like.tripId}:${like.userId}`)
  );

  const followerCountMap = new Map<string, number>();
  const viewerFollowingSet = new Set<string>();

  for (const follow of followsPayload.follows) {
    followerCountMap.set(follow.followingId, (followerCountMap.get(follow.followingId) ?? 0) + 1);

    if (viewerId && follow.followerId === viewerId) {
      viewerFollowingSet.add(follow.followingId);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-6 py-12">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#CBA258]">Social</p>
          <h1 className="font-serif text-6xl text-[#1B1B1F]">Global Feed</h1>
          <p className="text-sm text-[#1B1B1F]/65">
            Explore public journeys shared by the community.
          </p>
        </header>

        <SortTabs activeSort={sort} />

        {orderedTrips.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-[#1B1B1F]/20 bg-white p-10 text-center shadow-card">
            <p className="text-sm text-[#1B1B1F]/60">No public trips available yet.</p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orderedTrips.map((trip) => (
              <FeedCard
                key={trip.id}
                trip={trip}
                viewerId={viewerId}
                viewerLiked={Boolean(viewerId && likesByTripUserKey.has(`${trip.id}:${viewerId}`))}
                viewerFollowingAuthor={Boolean(viewerId && viewerFollowingSet.has(trip.userId))}
                authorFollowersCount={followerCountMap.get(trip.userId) ?? 0}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
