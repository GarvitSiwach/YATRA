'use client';

import Link from 'next/link';
import { useState } from 'react';

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
  initialFollowersCount: number;
  canInteract: boolean;
};

export default function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowersCount,
  canInteract
}: FollowButtonProps): JSX.Element {
  const [following, setFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  async function handleToggleFollow(): Promise<void> {
    if (!canInteract || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId })
      });

      const payload = (await response.json()) as {
        following?: boolean;
        followerCount?: number;
      };

      if (!response.ok) {
        return;
      }

      setFollowing(Boolean(payload.following));
      setFollowersCount(
        typeof payload.followerCount === 'number' ? payload.followerCount : followersCount
      );
    } finally {
      setLoading(false);
    }
  }

  if (!canInteract) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-[#1B1B1F]/15 px-4 py-2 text-sm text-[#1B1B1F]/75 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F]"
      >
        Login to Follow ({followersCount})
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
        following
          ? 'bg-[#1B1B1F] text-white hover:shadow-glow'
          : 'border border-[#1B1B1F]/15 text-[#1B1B1F]/80 hover:border-[#CBA258] hover:text-[#1B1B1F]'
      }`}
    >
      {following ? 'Following' : 'Follow'} ({followersCount})
    </button>
  );
}
