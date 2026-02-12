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
  Trip,
  TripsFile,
  UserRecord,
  UsersFile
} from '@/lib/types';

const dataDir = path.join(process.cwd(), 'data');

function normalizeTrip(trip: Trip): Trip {
  return {
    ...trip,
    isPublic: trip.isPublic ?? true
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
    ...user,
    profileImage: normalizeOptionalText(user.profileImage),
    bio: normalizeOptionalText(user.bio)
  };
}

async function ensureDataFile<T>(fileName: string, fallback: T): Promise<string> {
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, fileName);

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }

  return filePath;
}

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = await ensureDataFile(fileName, fallback);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

async function writeJsonFile<T>(fileName: string, value: T): Promise<void> {
  const filePath = await ensureDataFile(fileName, value);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

export async function readTripsFile(): Promise<TripsFile> {
  return readJsonFile<TripsFile>('trips.json', { trips: [] });
}

export async function writeTripsFile(value: TripsFile): Promise<void> {
  await writeJsonFile<TripsFile>('trips.json', value);
}

export async function readLikesFile(): Promise<LikesFile> {
  return readJsonFile<LikesFile>('likes.json', { likes: [] });
}

export async function writeLikesFile(value: LikesFile): Promise<void> {
  await writeJsonFile<LikesFile>('likes.json', value);
}

export async function readFollowsFile(): Promise<FollowsFile> {
  return readJsonFile<FollowsFile>('follows.json', { follows: [] });
}

export async function writeFollowsFile(value: FollowsFile): Promise<void> {
  await writeJsonFile<FollowsFile>('follows.json', value);
}

export async function readCommentsFile(): Promise<CommentsFile> {
  return readJsonFile<CommentsFile>('comments.json', { comments: [] });
}

export async function writeCommentsFile(value: CommentsFile): Promise<void> {
  await writeJsonFile<CommentsFile>('comments.json', value);
}

export async function readNotificationsFile(): Promise<NotificationsFile> {
  return readJsonFile<NotificationsFile>('notifications.json', { notifications: [] });
}

export async function writeNotificationsFile(value: NotificationsFile): Promise<void> {
  await writeJsonFile<NotificationsFile>('notifications.json', value);
}

export async function getUsers(): Promise<UserRecord[]> {
  const payload = await readJsonFile<UsersFile>('users.json', { users: [] });
  return payload.users.map(normalizeUserRecord);
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getUsers();
  return users.find((user) => user.email === normalizedEmail);
}

export async function createUser(user: UserRecord): Promise<void> {
  const payload = await readJsonFile<UsersFile>('users.json', { users: [] });
  payload.users.push(normalizeUserRecord(user));
  await writeJsonFile<UsersFile>('users.json', payload);
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

export async function updateUserProfile(
  userId: string,
  value: {
    bio?: string;
    profileImage?: string;
  }
): Promise<SafeUser | null> {
  const payload = await readJsonFile<UsersFile>('users.json', { users: [] });
  const userIndex = payload.users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return null;
  }

  const current = payload.users[userIndex];
  const nextUser: UserRecord = { ...current };

  if (Object.prototype.hasOwnProperty.call(value, 'bio')) {
    nextUser.bio = value.bio;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'profileImage')) {
    nextUser.profileImage = value.profileImage;
  }

  const updatedUser = normalizeUserRecord({
    ...nextUser
  });

  payload.users[userIndex] = updatedUser;
  await writeJsonFile<UsersFile>('users.json', payload);
  return sanitizeUser(updatedUser);
}

export async function getTripsByUserId(userId: string): Promise<Trip[]> {
  const payload = await readTripsFile();
  return payload.trips.filter((trip) => trip.userId === userId).map(normalizeTrip);
}

export async function getAllTrips(): Promise<Trip[]> {
  const payload = await readTripsFile();
  return payload.trips.map(normalizeTrip);
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  const payload = await readTripsFile();
  const trip = payload.trips.find((item) => item.id === id);
  return trip ? normalizeTrip(trip) : undefined;
}

export async function createTrip(trip: Trip): Promise<void> {
  const payload = await readTripsFile();
  payload.trips.push(trip);
  await writeTripsFile(payload);
}

export async function updateTripForUser(
  tripId: string,
  userId: string,
  updater: (trip: Trip) => Trip
): Promise<Trip | null> {
  const payload = await readTripsFile();
  const tripIndex = payload.trips.findIndex((trip) => trip.id === tripId && trip.userId === userId);

  if (tripIndex === -1) {
    return null;
  }

  const updated = updater(payload.trips[tripIndex]);
  payload.trips[tripIndex] = updated;
  await writeTripsFile(payload);
  return updated;
}

export async function getTripByIdForUser(
  tripId: string,
  userId: string
): Promise<Trip | undefined> {
  const payload = await readTripsFile();
  const trip = payload.trips.find((item) => item.id === tripId && item.userId === userId);
  return trip ? normalizeTrip(trip) : undefined;
}

export async function getLikesByTripId(tripId: string): Promise<Like[]> {
  const payload = await readLikesFile();
  return payload.likes.filter((like) => like.tripId === tripId);
}

export async function hasUserLikedTrip(tripId: string, userId: string): Promise<boolean> {
  const likes = await getLikesByTripId(tripId);
  return likes.some((like) => like.userId === userId);
}

export async function addLike(
  tripId: string,
  userId: string
): Promise<{ like: Like; created: boolean }> {
  const payload = await readLikesFile();
  const existingLike = payload.likes.find(
    (like) => like.tripId === tripId && like.userId === userId
  );

  if (existingLike) {
    return { like: existingLike, created: false };
  }

  const like: Like = {
    id: crypto.randomUUID(),
    tripId,
    userId,
    createdAt: new Date().toISOString()
  };

  payload.likes.push(like);
  await writeLikesFile(payload);
  return { like, created: true };
}

export async function removeLike(tripId: string, userId: string): Promise<boolean> {
  const payload = await readLikesFile();
  const nextLikes = payload.likes.filter(
    (like) => !(like.tripId === tripId && like.userId === userId)
  );

  if (nextLikes.length === payload.likes.length) {
    return false;
  }

  payload.likes = nextLikes;
  await writeLikesFile(payload);
  return true;
}

export async function isFollowingUser(followerId: string, followingId: string): Promise<boolean> {
  const payload = await readFollowsFile();
  return payload.follows.some(
    (follow) => follow.followerId === followerId && follow.followingId === followingId
  );
}

export async function getFollowersCount(userId: string): Promise<number> {
  const payload = await readFollowsFile();
  return payload.follows.filter((follow) => follow.followingId === userId).length;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const payload = await readFollowsFile();
  return payload.follows.filter((follow) => follow.followerId === userId).length;
}

export async function addFollow(
  followerId: string,
  followingId: string
): Promise<{ follow: Follow; created: boolean }> {
  const payload = await readFollowsFile();
  const existing = payload.follows.find(
    (follow) => follow.followerId === followerId && follow.followingId === followingId
  );

  if (existing) {
    return { follow: existing, created: false };
  }

  const follow: Follow = {
    id: crypto.randomUUID(),
    followerId,
    followingId,
    createdAt: new Date().toISOString()
  };

  payload.follows.push(follow);
  await writeFollowsFile(payload);
  return { follow, created: true };
}

export async function removeFollow(followerId: string, followingId: string): Promise<boolean> {
  const payload = await readFollowsFile();
  const nextFollows = payload.follows.filter(
    (follow) => !(follow.followerId === followerId && follow.followingId === followingId)
  );

  if (nextFollows.length === payload.follows.length) {
    return false;
  }

  payload.follows = nextFollows;
  await writeFollowsFile(payload);
  return true;
}

export async function getCommentsByTripId(tripId: string): Promise<Comment[]> {
  const payload = await readCommentsFile();
  return payload.comments.filter((comment) => comment.tripId === tripId);
}

export async function addComment(
  tripId: string,
  userId: string,
  content: string
): Promise<Comment> {
  const payload = await readCommentsFile();
  const comment: Comment = {
    id: crypto.randomUUID(),
    tripId,
    userId,
    content,
    createdAt: new Date().toISOString()
  };

  payload.comments.push(comment);
  await writeCommentsFile(payload);
  return comment;
}

export async function createNotification(notification: Notification): Promise<void> {
  const payload = await readNotificationsFile();
  payload.notifications.push(notification);
  await writeNotificationsFile(payload);
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const payload = await readNotificationsFile();
  return payload.notifications
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const payload = await readNotificationsFile();
  return payload.notifications.filter(
    (notification) => notification.userId === userId && !notification.read
  ).length;
}

export async function markNotificationsRead(userId: string): Promise<number> {
  const payload = await readNotificationsFile();
  let updatedCount = 0;

  payload.notifications = payload.notifications.map((notification) => {
    if (notification.userId !== userId || notification.read) {
      return notification;
    }

    updatedCount += 1;
    return {
      ...notification,
      read: true
    };
  });

  if (updatedCount > 0) {
    await writeNotificationsFile(payload);
  }

  return updatedCount;
}

export async function saveContactMessage(message: ContactMessage): Promise<void> {
  const payload = await readJsonFile<ContactsFile>('contacts.json', { messages: [] });
  payload.messages.push(message);
  await writeJsonFile<ContactsFile>('contacts.json', payload);
}

export function sanitizeUser(user: UserRecord): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
