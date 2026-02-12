import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import FollowingList from '@/components/FollowingList';
import { getSessionUserFromCookies } from '@/lib/auth';
import { getUserById, getUsers, readFollowsFile } from '@/lib/storage';

type FollowingPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: FollowingPageProps): Promise<Metadata> {
  return {
    title: `Following ${params.id}`
  };
}

export default async function FollowingPage({ params }: FollowingPageProps): Promise<JSX.Element> {
  const traveler = await getUserById(params.id);

  if (!traveler) {
    notFound();
  }

  const [sessionUser, users, followsPayload] = await Promise.all([
    getSessionUserFromCookies(),
    getUsers(),
    readFollowsFile()
  ]);

  const usersMap = new Map(users.map((user) => [user.id, user]));

  const followingIds = Array.from(
    new Set(
      followsPayload.follows
        .filter((follow) => follow.followerId === traveler.id)
        .map((follow) => follow.followingId)
    )
  );

  const followerCountMap = new Map<string, number>();
  const viewerFollowingSet = new Set<string>();

  for (const follow of followsPayload.follows) {
    followerCountMap.set(follow.followingId, (followerCountMap.get(follow.followingId) ?? 0) + 1);

    if (sessionUser && follow.followerId === sessionUser.id) {
      viewerFollowingSet.add(follow.followingId);
    }
  }

  const followingUsers = followingIds
    .map((id) => usersMap.get(id))
    .filter((user): user is NonNullable<typeof user> => Boolean(user))
    .sort((a, b) => a.name.localeCompare(b.name));

  const followingRows = followingUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    followersCount: followerCountMap.get(user.id) ?? 0,
    isFollowing: Boolean(sessionUser && viewerFollowingSet.has(user.id))
  }));

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-6 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Traveler</p>
          <h1 className="font-serif text-5xl text-[#1B1B1F]">{traveler.name} is Following</h1>
          <p className="text-sm text-[#1B1B1F]/65">{followingUsers.length} following</p>
          <Link
            href={`/traveler/${traveler.id}`}
            className="inline-flex text-sm text-[#1B1B1F]/70 underline underline-offset-4"
          >
            Back to Profile
          </Link>
        </header>

        <FollowingList
          users={followingRows}
          viewerId={sessionUser?.id}
          canInteract={Boolean(sessionUser)}
        />
      </div>
    </main>
  );
}
