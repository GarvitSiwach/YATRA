import Link from 'next/link';

import FollowButton from '@/components/FollowButton';
import LikeButton from '@/components/LikeButton';
import { formatHumanDate } from '@/lib/trip-utils';
import { SocialTrip } from '@/lib/types';

type FeedCardProps = {
  trip: SocialTrip;
  viewerId: string | null;
  viewerLiked: boolean;
  viewerFollowingAuthor: boolean;
  authorFollowersCount: number;
};

export default function FeedCard({
  trip,
  viewerId,
  viewerLiked,
  viewerFollowingAuthor,
  authorFollowersCount
}: FeedCardProps): JSX.Element {
  const canInteract = Boolean(viewerId);
  const canFollow = Boolean(viewerId) && viewerId !== trip.userId;

  return (
    <article className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-5 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B1B1F] via-[#3B3324] to-[#CBA258]/85">
        <div className="absolute inset-0 bg-black/20" />
        <p className="absolute bottom-3 left-3 font-serif text-3xl text-white">
          {trip.destination}
        </p>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/traveler/${trip.userId}`}
            className="text-sm font-medium text-[#1B1B1F] transition-colors duration-200 ease-out hover:text-[#CBA258]"
          >
            {trip.userName}
          </Link>
          <p className="mt-1 text-xs text-[#1B1B1F]/60">
            {formatHumanDate(trip.startDate)} - {formatHumanDate(trip.endDate)}
          </p>
        </div>

        {canFollow ? (
          <FollowButton
            targetUserId={trip.userId}
            initialFollowing={viewerFollowingAuthor}
            initialFollowersCount={authorFollowersCount}
            canInteract={canFollow}
          />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#1B1B1F]/70">
        <span className="rounded-full border border-[#1B1B1F]/10 px-3 py-1">
          {trip.likesCount} likes
        </span>
        <span className="rounded-full border border-[#1B1B1F]/10 px-3 py-1">
          {trip.commentsCount} comments
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <LikeButton
          tripId={trip.id}
          initialLiked={viewerLiked}
          initialCount={trip.likesCount}
          canInteract={canInteract}
        />
        <Link
          href={`/public/trip/${trip.id}`}
          className="rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F]"
        >
          View Trip
        </Link>
      </div>
    </article>
  );
}
