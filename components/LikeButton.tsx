'use client';

import Link from 'next/link';
import { useState } from 'react';

type LikeButtonProps = {
  tripId: string;
  initialLiked: boolean;
  initialCount: number;
  canInteract: boolean;
};

export default function LikeButton({
  tripId,
  initialLiked,
  initialCount,
  canInteract
}: LikeButtonProps): JSX.Element {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggleLike(): Promise<void> {
    if (!canInteract || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tripId })
      });

      const payload = (await response.json()) as {
        liked?: boolean;
        likesCount?: number;
      };

      if (!response.ok) {
        return;
      }

      setLiked(Boolean(payload.liked));
      setLikesCount(typeof payload.likesCount === 'number' ? payload.likesCount : likesCount);
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
        Login to Like ({likesCount})
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? 'bg-[#1B1B1F] text-white hover:shadow-glow'
          : 'border border-[#1B1B1F]/15 text-[#1B1B1F]/80 hover:border-[#CBA258] hover:text-[#1B1B1F]'
      }`}
    >
      {liked ? 'Liked' : 'Like'} ({likesCount})
    </button>
  );
}
