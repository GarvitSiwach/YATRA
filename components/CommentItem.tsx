import Link from 'next/link';

import { formatTimeAgo } from '@/lib/time';

type CommentItemProps = {
  comment: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  };
};

export default function CommentItem({ comment }: CommentItemProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-[#1B1B1F]/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/traveler/${comment.user.id}`}
          className="text-sm font-medium text-[#1B1B1F] transition-colors duration-200 ease-out hover:text-[#CBA258]"
        >
          {comment.user.name}
        </Link>
        <span className="text-xs text-[#1B1B1F]/55">{formatTimeAgo(comment.createdAt)}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#1B1B1F]/80">{comment.content}</p>
    </article>
  );
}
