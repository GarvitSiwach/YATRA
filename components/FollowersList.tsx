import UserListItem from '@/components/UserListItem';

type FollowersListUser = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  followersCount: number;
  isFollowing: boolean;
};

type FollowersListProps = {
  users: FollowersListUser[];
  viewerId?: string;
  canInteract: boolean;
};

export default function FollowersList({
  users,
  viewerId,
  canInteract
}: FollowersListProps): JSX.Element {
  if (users.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-[#1B1B1F]/20 bg-white p-8 text-center shadow-card">
        <p className="text-sm text-[#1B1B1F]/60">No followers yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {users.map((user) => (
        <UserListItem
          key={user.id}
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage
          }}
          followersCount={user.followersCount}
          showFollowButton={viewerId !== user.id}
          canInteract={canInteract && viewerId !== user.id}
          isFollowing={user.isFollowing}
        />
      ))}
    </section>
  );
}
