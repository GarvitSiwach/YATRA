import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import FollowButton from '@/components/FollowButton';
import LikeButton from '@/components/LikeButton';
import TripComments from '@/components/TripComments';
import { getSessionUserFromCookies } from '@/lib/auth';
import {
  getCommentsByTripId,
  getFollowersCount,
  getLikesByTripId,
  getTripById,
  getUserById,
  getUsers,
  isFollowingUser
} from '@/lib/storage';
import { formatHumanDate } from '@/lib/trip-utils';

type PublicTripPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: PublicTripPageProps): Promise<Metadata> {
  return {
    title: `Shared Trip ${params.id}`
  };
}

export default async function PublicTripPage({
  params
}: PublicTripPageProps): Promise<JSX.Element> {
  const trip = await getTripById(params.id);

  if (!trip || trip.isPublic !== true) {
    notFound();
  }

  const [owner, sessionUser, likes, comments, users, followersCount] = await Promise.all([
    getUserById(trip.userId),
    getSessionUserFromCookies(),
    getLikesByTripId(trip.id),
    getCommentsByTripId(trip.id),
    getUsers(),
    getFollowersCount(trip.userId)
  ]);

  if (!owner) {
    notFound();
  }

  const usersMap = new Map(users.map((user) => [user.id, user]));

  const initialComments = comments
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((comment) => ({
      ...comment,
      user: {
        id: comment.userId,
        name: usersMap.get(comment.userId)?.name ?? 'Traveler'
      }
    }));

  const likedByViewer = Boolean(
    sessionUser && likes.some((like) => like.userId === sessionUser.id)
  );
  const canFollow = Boolean(sessionUser) && sessionUser?.id !== owner.id;
  const following =
    sessionUser && sessionUser.id !== trip.userId
      ? await isFollowingUser(sessionUser.id, trip.userId)
      : false;

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-6 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Public Trip</p>
          <h1 className="font-serif text-5xl text-[#1B1B1F]">{trip.destination}</h1>
          <p className="text-sm text-[#1B1B1F]/70">
            {formatHumanDate(trip.startDate)} - {formatHumanDate(trip.endDate)}
          </p>

          <p className="text-sm text-[#1B1B1F]/75">
            by{' '}
            <Link
              href={`/traveler/${owner.id}`}
              className="font-medium underline decoration-[#CBA258]/60 underline-offset-4"
            >
              {owner.name}
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <LikeButton
              tripId={trip.id}
              initialLiked={likedByViewer}
              initialCount={likes.length}
              canInteract={Boolean(sessionUser)}
            />
            {canFollow ? (
              <FollowButton
                targetUserId={owner.id}
                initialFollowing={following}
                initialFollowersCount={followersCount}
                canInteract={canFollow}
              />
            ) : null}
          </div>

          <Link
            href="/"
            className="inline-flex text-sm text-[#1B1B1F]/70 underline underline-offset-4"
          >
            Back to YĀTRA
          </Link>
        </header>

        <section className="space-y-4 rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
          <h2 className="font-serif text-3xl text-[#1B1B1F]">Read-only Itinerary</h2>

          {trip.itineraryDays.map((day) => (
            <article
              key={day.id}
              className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-4"
            >
              <h3 className="font-serif text-2xl text-[#1B1B1F]">{day.title}</h3>
              {day.activities.length === 0 ? (
                <p className="mt-2 text-sm text-[#1B1B1F]/55">No activities added.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-[#1B1B1F]/75">
                  {day.activities.map((activity) => (
                    <li key={activity.id}>{activity.name}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        <TripComments
          tripId={trip.id}
          initialComments={initialComments}
          canComment={Boolean(sessionUser)}
        />
      </div>
    </main>
  );
}
