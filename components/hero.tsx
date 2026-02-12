import Link from 'next/link';

export default function Hero(): JSX.Element {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-gold/20 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl space-y-8">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Journey with Purpose</p>
          <h1 className="font-serif text-5xl leading-tight text-ink sm:text-6xl md:text-7xl">
            Plan meaningful journeys with confidence and style.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-black/70">
            YĀTRA is the planning workspace for thoughtful travelers. Craft routes, stay organized,
            and keep every trip aligned with your intent.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98]"
            >
              Start Your Journey
            </Link>
            <Link
              href="/#features"
              className="rounded-full border border-black/20 px-7 py-3 text-sm font-medium text-ink transition-colors duration-200 ease-out hover:border-gold"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
