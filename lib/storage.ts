import { promises as fs } from 'fs';
import path from 'path';

import {
  Comment,
  CommentsFile,
  ContactMessage,
  ContactsFile,
  Follow,
  FollowsFile,
  Like,
  LikesFile,
  Notification,
  NotificationsFile,
  SafeUser,
  SocialTrip,
  Trip,
  TripsFile,
  UserRecord,
  UsersFile
} from '@/lib/types';

export type StoredUser = UserRecord & {
  passwordHash?: string;
};

export type DatabaseFile = UsersFile &
  TripsFile &
  LikesFile &
  FollowsFile &
  CommentsFile &
  NotificationsFile &
  ContactsFile;

const DATABASE_PATH = path.join(process.cwd(), 'data', 'database.json');

function emptyStore(): DatabaseFile {
  return {
    users: [],
    trips: [],
    likes: [],
    follows: [],
    comments: [],
    notifications: [],
    messages: []
  };
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeUserRecord(user: UserRecord): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email.trim().toLowerCase(),
    profileImage: normalizeOptionalText(user.profileImage),
    bio: normalizeOptionalText(user.bio),
    createdAt: user.createdAt
  };
}

function normalizeTrip(trip: Trip): Trip {
  return {
    ...trip,
    isPublic: trip.isPublic ?? true
  };
}

function normalizeStoredUser(user: StoredUser): StoredUser {
  return {
    ...normalizeUserRecord(user),
    passwordHash: normalizeOptionalText(user.passwordHash)
  };
}

function sortByCreatedDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

async function readStore(): Promise<DatabaseFile> {
  try {
    const raw = await fs.readFile(DATABASE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DatabaseFile>;

    return {
      users: Array.isArray(parsed.users)
        ? (parsed.users as StoredUser[]).map(normalizeStoredUser)
        : [],
      trips: Array.isArray(parsed.trips) ? (parsed.trips as Trip[]).map(normalizeTrip) : [],
      likes: Array.isArray(parsed.likes) ? (parsed.likes as Like[]) : [],
      follows: Array.isArray(parsed.follows) ? (parsed.follows as Follow[]) : [],
      comments: Array.isArray(parsed.comments) ? (parsed.comments as Comment[]) : [],
      notifications: Array.isArray(parsed.notifications)
        ? (parsed.notifications as Notification[])
        : [],
      messages: Array.isArray(parsed.messages) ? (parsed.messages as ContactMessage[]) : []
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const store = emptyStore();
      await writeStore(store);
      return store;
    }

    throw error;
  }
}

async function writeStore(store: DatabaseFile): Promise<void> {
  await fs.mkdir(path.dirname(DATABASE_PATH), { recursive: true });
  await fs.writeFile(`${DATABASE_PATH}.tmp`, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  await fs.rename(`${DATABASE_PATH}.tmp`, DATABASE_PATH);
}

async function updateStore<T>(updater: (store: DatabaseFile) => T): Promise<T> {
  const store = await readStore();
  const result = updater(store);
  await writeStore(store);
  return result;
}

export async function readDatabaseFile(): Promise<DatabaseFile> {
  return readStore();
}

export async function writeDatabaseFile(value: DatabaseFile): Promise<void> {
  await writeStore({
    users: value.users.map((user) => normalizeStoredUser(user as StoredUser)),
    trips: value.trips.map(normalizeTrip),
    likes: value.likes,
    follows: value.follows,
    comments: value.comments,
    notifications: value.notifications,
    messages: value.messages
  });
}

function normalizeItineraryDays(value: unknown): Trip['itineraryDays'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((day, dayIndex) => {
      if (!day || typeof day !== 'object') {
        return null;
      }

      const dayRecord = day as Record<string, unknown>;
      const id =
        typeof dayRecord.id === 'string' && dayRecord.id.trim()
          ? dayRecord.id
          : crypto.randomUUID();
      const title =
        typeof dayRecord.title === 'string' && dayRecord.title.trim()
          ? dayRecord.title.trim()
          : `Day ${dayIndex + 1}`;

      const rawActivities = Array.isArray(dayRecord.activities) ? dayRecord.activities : [];
      const activities = rawActivities
        .map((activity) => {
          if (!activity || typeof activity !== 'object') {
            return null;
          }

          const activityRecord = activity as Record<string, unknown>;
          const name = typeof activityRecord.name === 'string' ? activityRecord.name.trim() : '';
          if (!name) {
            return null;
          }

          const activityId =
            typeof activityRecord.id === 'string' && activityRecord.id.trim()
              ? activityRecord.id
              : crypto.randomUUID();

          return {
            id: activityId,
            name
          };
        })
        .filter((activity): activity is { id: string; name: string } => Boolean(activity));

      return {
        id,
        title,
        activities
      };
    })
    .filter((day): day is Trip['itineraryDays'][number] => Boolean(day));
}

export async function readTripsFile(): Promise<TripsFile> {
  const store = await readStore();
  return {
    trips: store.trips.map(normalizeTrip)
  };
}

export async function writeTripsFile(value: TripsFile): Promise<void> {
  await updateStore((store) => {
    store.trips = value.trips.map(normalizeTrip);
  });
}

export async function readLikesFile(): Promise<LikesFile> {
  const store = await readStore();
  return {
    likes: store.likes
  };
}

export async function writeLikesFile(value: LikesFile): Promise<void> {
  await updateStore((store) => {
    store.likes = value.likes;
  });
}

export async function readFollowsFile(): Promise<FollowsFile> {
  const store = await readStore();
  return {
    follows: store.follows
  };
}

export async function writeFollowsFile(value: FollowsFile): Promise<void> {
  await updateStore((store) => {
    store.follows = value.follows;
  });
}

export async function readCommentsFile(): Promise<CommentsFile> {
  const store = await readStore();
  return {
    comments: store.comments
  };
}

export async function writeCommentsFile(value: CommentsFile): Promise<void> {
  await updateStore((store) => {
    store.comments = value.comments;
  });
}

export async function readNotificationsFile(): Promise<NotificationsFile> {
  const store = await readStore();
  return {
    notifications: store.notifications
  };
}

export async function writeNotificationsFile(value: NotificationsFile): Promise<void> {
  await updateStore((store) => {
    store.notifications = value.notifications;
  });
}

export async function getUsers(): Promise<UserRecord[]> {
  const store = await readStore();
  return store.users
    .map((user) => sanitizeUser(user as StoredUser))
    .sort((first, second) => first.name.localeCompare(second.name));
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const user = await findStoredUserByEmail(email);
  return user ? sanitizeUser(user) : undefined;
}

export async function findStoredUserByEmail(email: string): Promise<StoredUser | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  const store = await readStore();
  return store.users.find((user) => user.email.trim().toLowerCase() === normalizedEmail) as
    | StoredUser
    | undefined;
}

export async function createUser(user: StoredUser): Promise<void> {
  await updateStore((store) => {
    const normalized = normalizeStoredUser(user);
    const existingIndex = store.users.findIndex((item) => item.id === normalized.id);

    if (existingIndex >= 0) {
      store.users[existingIndex] = {
        ...(store.users[existingIndex] as StoredUser),
        ...normalized
      };
      return;
    }

    store.users.push(normalized);
  });
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const store = await readStore();
  const user = store.users.find((item) => item.id === id);
  return user ? sanitizeUser(user as StoredUser) : undefined;
}

export async function updateUserProfile(
  userId: string,
  value: {
    bio?: string;
    profileImage?: string;
  }
): Promise<SafeUser | null> {
  const updates: {
    bio?: string | null;
    profile_image?: string | null;
  } = {};

  if (Object.prototype.hasOwnProperty.call(value, 'bio')) {
    updates.bio = normalizeOptionalText(value.bio) ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'profileImage')) {
    updates.profile_image = normalizeOptionalText(value.profileImage) ?? null;
  }

  return updateStore((store) => {
    const user = store.users.find((item) => item.id === userId) as StoredUser | undefined;

    if (!user) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'bio')) {
      user.bio = normalizeOptionalText(updates.bio);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'profile_image')) {
      user.profileImage = normalizeOptionalText(updates.profile_image);
    }

    return sanitizeUser(user);
  });
}

export async function getTripsByUserId(userId: string): Promise<Trip[]> {
  const store = await readStore();
  return sortByCreatedDesc(store.trips.filter((trip) => trip.userId === userId).map(normalizeTrip));
}

export async function getAllTrips(): Promise<Trip[]> {
  const store = await readStore();
  return sortByCreatedDesc(store.trips.map(normalizeTrip));
}

export async function getPublicSocialTrips(): Promise<SocialTrip[]> {
  const store = await readStore();
  return sortByCreatedDesc(
    store.trips.filter((trip) => trip.isPublic ?? true).map(normalizeTrip)
  ).map((trip) => {
    const owner = store.users.find((user) => user.id === trip.userId);
    return {
      ...trip,
      userName: owner?.name ?? 'Traveler',
      likesCount: store.likes.filter((like) => like.tripId === trip.id).length,
      commentsCount: store.comments.filter((comment) => comment.tripId === trip.id).length
    };
  });
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  const store = await readStore();
  const trip = store.trips.find((item) => item.id === id);
  return trip ? normalizeTrip(trip) : undefined;
}

export async function createTrip(trip: Trip): Promise<void> {
  await updateStore((store) => {
    store.trips.push(normalizeTrip(trip));
  });
}

export async function updateTripForUser(
  tripId: string,
  userId: string,
  updater: (trip: Trip) => Trip
): Promise<Trip | null> {
  const existingTrip = await getTripByIdForUser(tripId, userId);

  if (!existingTrip) {
    return null;
  }

  const updatedTrip = normalizeTrip(updater(existingTrip));
  return updateStore((store) => {
    const index = store.trips.findIndex((trip) => trip.id === tripId && trip.userId === userId);

    if (index < 0) {
      return null;
    }

    store.trips[index] = updatedTrip;
    return updatedTrip;
  });
}

export async function getTripByIdForUser(
  tripId: string,
  userId: string
): Promise<Trip | undefined> {
  const store = await readStore();
  const trip = store.trips.find((item) => item.id === tripId && item.userId === userId);
  return trip ? normalizeTrip(trip) : undefined;
}

export async function getLikesByTripId(tripId: string): Promise<Like[]> {
  const store = await readStore();
  return sortByCreatedDesc(store.likes.filter((like) => like.tripId === tripId));
}

export async function hasUserLikedTrip(tripId: string, userId: string): Promise<boolean> {
  const store = await readStore();
  return store.likes.some((like) => like.tripId === tripId && like.userId === userId);
}

export async function addLike(
  tripId: string,
  userId: string
): Promise<{ like: Like; created: boolean }> {
  return updateStore((store) => {
    const existingLike = store.likes.find(
      (like) => like.tripId === tripId && like.userId === userId
    );
    if (!existingLike) {
      const like = {
        id: crypto.randomUUID(),
        tripId,
        userId,
        createdAt: new Date().toISOString()
      };
      store.likes.push(like);

      return {
        like,
        created: true
      };
    }

    return {
      like: existingLike,
      created: false
    };
  });
}

export async function removeLike(tripId: string, userId: string): Promise<boolean> {
  return updateStore((store) => {
    const before = store.likes.length;
    store.likes = store.likes.filter((like) => like.tripId !== tripId || like.userId !== userId);
    return store.likes.length !== before;
  });
}

export async function isFollowingUser(followerId: string, followingId: string): Promise<boolean> {
  const store = await readStore();
  return store.follows.some(
    (follow) => follow.followerId === followerId && follow.followingId === followingId
  );
}

export async function getFollowersCount(userId: string): Promise<number> {
  const store = await readStore();
  return store.follows.filter((follow) => follow.followingId === userId).length;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const store = await readStore();
  return store.follows.filter((follow) => follow.followerId === userId).length;
}

export async function addFollow(
  followerId: string,
  followingId: string
): Promise<{ follow: Follow; created: boolean }> {
  return updateStore((store) => {
    const existingFollow = store.follows.find(
      (follow) => follow.followerId === followerId && follow.followingId === followingId
    );
    if (existingFollow) {
      return {
        follow: existingFollow,
        created: false
      };
    }

    const follow = {
      id: crypto.randomUUID(),
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };
    store.follows.push(follow);

    return {
      follow,
      created: true
    };
  });
}

export async function removeFollow(followerId: string, followingId: string): Promise<boolean> {
  return updateStore((store) => {
    const before = store.follows.length;
    store.follows = store.follows.filter(
      (follow) => follow.followerId !== followerId || follow.followingId !== followingId
    );
    return store.follows.length !== before;
  });
}

export async function getCommentsByTripId(tripId: string): Promise<Comment[]> {
  const store = await readStore();
  return sortByCreatedDesc(store.comments.filter((comment) => comment.tripId === tripId));
}

export async function addComment(
  tripId: string,
  userId: string,
  content: string
): Promise<Comment> {
  return updateStore((store) => {
    const comment = {
      id: crypto.randomUUID(),
      tripId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };
    store.comments.push(comment);
    return comment;
  });
}

export async function createNotification(notification: Notification): Promise<void> {
  await updateStore((store) => {
    store.notifications.push(notification);
  });
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const store = await readStore();
  return sortByCreatedDesc(
    store.notifications.filter((notification) => notification.userId === userId)
  );
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const store = await readStore();
  return store.notifications.filter(
    (notification) => notification.userId === userId && !notification.read
  ).length;
}

export async function markNotificationsRead(userId: string): Promise<number> {
  return updateStore((store) => {
    let updated = 0;
    store.notifications.forEach((notification) => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        updated += 1;
      }
    });
    return updated;
  });
}

export async function saveContactMessage(message: ContactMessage): Promise<void> {
  await updateStore((store) => {
    store.messages.push(message);
  });
}

export function sanitizeUser(user: UserRecord): SafeUser {
  return normalizeUserRecord(user);
}
