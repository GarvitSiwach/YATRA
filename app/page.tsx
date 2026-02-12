import ContactForm from '@/components/contact-form';
import Features from '@/components/features';
import Hero from '@/components/hero';
import Navbar from '@/components/navbar';

export default function HomePage(): JSX.Element {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ContactForm />
      </main>
      <footer className="border-t border-black/10 px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-black/60">
          <p>© {new Date().getFullYear()} YĀTRA. Journey with Purpose.</p>
          <p>Built for mindful explorers.</p>
        </div>
      </footer>
    </>
  );
}
