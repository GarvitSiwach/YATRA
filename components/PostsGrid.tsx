import Link from 'next/link';

type PostsGridItem = {
  id: string;
  destination: string;
  likesCount: number;
};

type PostsGridProps = {
  posts: PostsGridItem[];
  linkBase?: string;
  emptyMessage?: string;
};

export default function PostsGrid({
  posts,
  linkBase = '/public/trip',
  emptyMessage = 'No public posts yet.'
}: PostsGridProps): JSX.Element {
  if (posts.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-[#1B1B1F]/20 bg-white p-10 text-center shadow-card">
        <p className="text-sm text-[#1B1B1F]/60">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`${linkBase}/${post.id}`}
          className="group relative aspect-square overflow-hidden rounded-2xl border border-[#1B1B1F]/10 bg-gradient-to-br from-[#1B1B1F] via-[#3A3124] to-[#CBA258]/90 shadow-card transition-transform duration-200 ease-out hover:scale-[1.01]"
        >
          <div className="absolute inset-0 bg-black/10 transition-colors duration-200 ease-out group-hover:bg-black/35" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/15 to-transparent p-4 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
            <p className="font-serif text-3xl text-white">{post.destination}</p>
            <p className="mt-1 text-xs text-white/85">{post.likesCount} likes</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
