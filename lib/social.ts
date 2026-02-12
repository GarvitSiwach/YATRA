import { Comment, Like, SocialTrip, Trip, UserRecord } from '@/lib/types';

function compareTopTrips(a: SocialTrip, b: SocialTrip): number {
  if (b.likesCount !== a.likesCount) {
    return b.likesCount - a.likesCount;
  }

  return b.createdAt.localeCompare(a.createdAt);
}

function compareLatestTrips(a: SocialTrip, b: SocialTrip): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function buildSocialTrips(params: {
  trips: Trip[];
  users: UserRecord[];
  likes: Like[];
  comments: Comment[];
}): SocialTrip[] {
  const { trips, users, likes, comments } = params;

  const usersMap = new Map(users.map((user) => [user.id, user]));
  const likesCountMap = new Map<string, number>();
  const commentsCountMap = new Map<string, number>();

  for (const like of likes) {
    likesCountMap.set(like.tripId, (likesCountMap.get(like.tripId) ?? 0) + 1);
  }

  for (const comment of comments) {
    commentsCountMap.set(comment.tripId, (commentsCountMap.get(comment.tripId) ?? 0) + 1);
  }

  return trips
    .filter((trip) => trip.isPublic === true)
    .map((trip) => ({
      ...trip,
      userName: usersMap.get(trip.userId)?.name ?? 'Traveler',
      likesCount: likesCountMap.get(trip.id) ?? 0,
      commentsCount: commentsCountMap.get(trip.id) ?? 0
    }));
}

export function sortSocialTrips(trips: SocialTrip[], sort: 'latest' | 'top'): SocialTrip[] {
  if (sort === 'top') {
    return [...trips].sort(compareTopTrips);
  }

  return [...trips].sort(compareLatestTrips);
}

export function getTopTrips(trips: SocialTrip[], limit = 10): SocialTrip[] {
  return [...trips].sort(compareTopTrips).slice(0, limit);
}
