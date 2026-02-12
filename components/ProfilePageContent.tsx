'use client';

import { useState } from 'react';

import EditProfileForm from '@/components/EditProfileForm';
import PostsGrid from '@/components/PostsGrid';
import ProfileHeader from '@/components/ProfileHeader';

type ProfilePagePost = {
  id: string;
  destination: string;
  likesCount: number;
};

type ProfilePageContentProps = {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    profileImage?: string;
  };
  followersCount: number;
  followingCount: number;
  posts: ProfilePagePost[];
};

export default function ProfilePageContent({
  user,
  followersCount,
  followingCount,
  posts
}: ProfilePageContentProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-7">
      <ProfileHeader
        user={user}
        followersCount={followersCount}
        followingCount={followingCount}
        totalPosts={posts.length}
        isOwnProfile
        showEmail
        onEditClick={() => setIsEditing(true)}
        isEditing={isEditing}
      />

      <section className="space-y-4">
        <h2 className="font-serif text-4xl text-[#1B1B1F]">Your Trips</h2>
        <PostsGrid
          posts={posts}
          linkBase="/trips"
          emptyMessage="No trips yet. Create your first journey to begin."
        />
      </section>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isEditing ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={isEditing ? 'pt-2' : ''}>
          {isEditing ? (
            <EditProfileForm
              initialBio={user.bio}
              initialProfileImage={user.profileImage}
              onCancel={() => setIsEditing(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
