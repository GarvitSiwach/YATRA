'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import CommentItem from '@/components/CommentItem';

type CommentView = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

type TripCommentsProps = {
  tripId: string;
  initialComments: CommentView[];
  canComment: boolean;
};

export default function TripComments({
  tripId,
  initialComments,
  canComment
}: TripCommentsProps): JSX.Element {
  const [comments, setComments] = useState<CommentView[]>(initialComments);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const normalized = content.trim();

    if (!normalized) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/social/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tripId, content: normalized })
      });

      const payload = (await response.json()) as { error?: string; comment?: CommentView };

      if (!response.ok || !payload.comment) {
        setError(payload.error ?? 'Unable to post comment right now.');
        return;
      }

      setComments((prev) => [payload.comment as CommentView, ...prev]);
      setContent('');
    } catch {
      setError('Network issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
      <h2 className="font-serif text-3xl text-[#1B1B1F]">Comments</h2>

      {canComment ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share your thoughts"
            className="h-24 w-full resize-none rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
            maxLength={500}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-[#1B1B1F]/65">
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>{' '}
          to comment on this trip.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-[#1B1B1F]/60">No comments yet.</p>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </section>
  );
}
