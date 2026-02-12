'use client';

import Link from 'next/link';

import Avatar from '@/components/Avatar';
import FollowButton from '@/components/FollowButton';

type ProfileHeaderProps = {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    profileImage?: string;
  };
  followersCount: number;
  followingCount: number;
  totalPosts: number;
  isOwnProfile: boolean;
  showEmail?: boolean;
  editHref?: string;
  onEditClick?: () => void;
  isEditing?: boolean;
  isFollowing?: boolean;
  canFollowInteract?: boolean;
};

export default function ProfileHeader({
  user,
  followersCount,
  followingCount,
  totalPosts,
  isOwnProfile,
  showEmail = false,
  editHref = '#edit-profile',
  onEditClick,
  isEditing = false,
  isFollowing = false,
  canFollowInteract = false
}: ProfileHeaderProps): JSX.Element {
  return (
    <header className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 sm:gap-5">
          <Avatar name={user.name} imageUrl={user.profileImage} size="xl" className="shrink-0" />

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Traveler</p>
            <h1 className="mt-2 font-serif text-4xl text-[#1B1B1F] sm:text-5xl">{user.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1B1B1F]/65">
              {user.bio?.trim() || 'No bio yet.'}
            </p>
            {showEmail ? <p className="mt-2 text-sm text-[#1B1B1F]/50">{user.email}</p> : null}
          </div>
        </div>

        <div className="sm:text-right">
          {isOwnProfile ? (
            onEditClick ? (
              <button
                type="button"
                onClick={onEditClick}
                className="inline-flex rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
              >
                {isEditing ? 'Editing Profile' : 'Edit Profile'}
              </button>
            ) : (
              <Link
                href={editHref}
                className="inline-flex rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
              >
                Edit Profile
              </Link>
            )
          ) : (
            <FollowButton
              targetUserId={user.id}
              initialFollowing={isFollowing}
              initialFollowersCount={followersCount}
              canInteract={canFollowInteract}
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Link
          href={`/traveler/${user.id}/followers`}
          className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-4 text-center transition-all duration-200 ease-out hover:border-[#CBA258]/50 hover:bg-[#CBA258]/5"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[#CBA258]">Followers</p>
          <p className="mt-1 text-2xl font-semibold text-[#1B1B1F]">{followersCount}</p>
        </Link>

        <Link
          href={`/traveler/${user.id}/following`}
          className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-4 text-center transition-all duration-200 ease-out hover:border-[#CBA258]/50 hover:bg-[#CBA258]/5"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[#CBA258]">Following</p>
          <p className="mt-1 text-2xl font-semibold text-[#1B1B1F]">{followingCount}</p>
        </Link>

        <div className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-4 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[#CBA258]">Posts</p>
          <p className="mt-1 text-2xl font-semibold text-[#1B1B1F]">{totalPosts}</p>
        </div>
      </div>
    </header>
  );
}
