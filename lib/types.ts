export type UserRecord = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  passwordHash: string;
  createdAt: string;
};

export type SafeUser = Omit<UserRecord, 'passwordHash'>;
export type User = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
};

export type Session = {
  user: SafeUser | null;
};

export type UsersFile = {
  users: UserRecord[];
};

export type TravelType = 'Solo' | 'Friends' | 'Family' | 'Luxury';

export type Activity = {
  id: string;
  name: string;
};

export type ItineraryDay = {
  id: string;
  title: string;
  activities: Activity[];
};

export type Trip = {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelType: TravelType;
  notes: string;
  itineraryDays: ItineraryDay[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string | null;
};

export type TripsFile = {
  trips: Trip[];
};

export type SocialTrip = Trip & {
  userName: string;
  likesCount: number;
  commentsCount: number;
};

export type Like = {
  id: string;
  tripId: string;
  userId: string;
  createdAt: string;
};

export type LikesFile = {
  likes: Like[];
};

export type Follow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};

export type FollowsFile = {
  follows: Follow[];
};

export type Comment = {
  id: string;
  tripId: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type CommentsFile = {
  comments: Comment[];
};

export type NotificationType = 'follow' | 'like' | 'comment';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  tripId?: string;
  createdAt: string;
  read: boolean;
};

export type NotificationsFile = {
  notifications: Notification[];
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type ContactsFile = {
  messages: ContactMessage[];
};
