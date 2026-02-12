import Link from 'next/link';

import Avatar from '@/components/Avatar';
import FollowButton from '@/components/FollowButton';

type UserListItemProps = {
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  followersCount: number;
  showFollowButton: boolean;
  canInteract: boolean;
  isFollowing: boolean;
};

export default function UserListItem({
  user,
  followersCount,
  showFollowButton,
  canInteract,
  isFollowing
}: UserListItemProps): JSX.Element {
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1B1B1F]/10 bg-white p-4 shadow-card transition-colors duration-200 ease-out hover:bg-[#FAF9F5]">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} imageUrl={user.profileImage} size="md" />
        <div>
          <Link
            href={`/traveler/${user.id}`}
            className="text-base font-medium text-[#1B1B1F] transition-colors duration-200 ease-out hover:text-[#CBA258]"
          >
            {user.name}
          </Link>
          <p className="mt-1 text-xs text-[#1B1B1F]/55">{followersCount} followers</p>
        </div>
      </div>

      {showFollowButton ? (
        <FollowButton
          targetUserId={user.id}
          initialFollowing={isFollowing}
          initialFollowersCount={followersCount}
          canInteract={canInteract}
        />
      ) : null}
    </article>
  );
}
