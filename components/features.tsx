const featureList = [
  {
    title: 'Elegant Trip Planning',
    description:
      'Design travel plans in a calm, distraction-free workspace built for clarity and control.'
  },
  {
    title: 'Flexible Itineraries',
    description: 'Adjust timing and priorities as your journey evolves without losing structure.'
  },
  {
    title: 'Built for Intentional Travelers',
    description:
      'Capture the purpose behind every destination and keep your plans grounded and actionable.'
  }
];

export default function Features(): JSX.Element {
  return (
    <section id="features" className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Features</p>
          <h2 className="font-serif text-4xl text-ink sm:text-5xl">
            Purpose-built for modern explorers
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureList.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-black/10 bg-white p-7 shadow-card"
            >
              <h3 className="text-xl font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-black/70">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
