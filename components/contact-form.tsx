'use client';

import { FormEvent, useState } from 'react';

type ContactState = {
  name: string;
  email: string;
  message: string;
};

const initialState: ContactState = {
  name: '',
  email: '',
  message: ''
};

export default function ContactForm(): JSX.Element {
  const [form, setForm] = useState<ContactState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Unable to send your message right now.');
        return;
      }

      setSuccess(payload.message ?? 'Your message has been sent.');
      setForm(initialState);
    } catch {
      setError('Network issue. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="px-6 pb-24 pt-10 sm:pt-14">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-black/10 bg-white p-8 shadow-card md:grid-cols-[1fr_1.1fr] md:p-10">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Contact</p>
          <h2 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Let’s shape your next purposeful journey.
          </h2>
          <p className="text-black/70">
            Share your travel intent and we will follow up with a thoughtful response.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block space-y-2">
            <span className="text-sm text-black/70">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-2xl border border-black/15 px-4 py-3 text-sm text-ink outline-none transition-all duration-200 ease-out focus:border-gold focus:ring-2 focus:ring-gold/30"
              name="name"
              autoComplete="name"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-black/70">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-2xl border border-black/15 px-4 py-3 text-sm text-ink outline-none transition-all duration-200 ease-out focus:border-gold focus:ring-2 focus:ring-gold/30"
              name="email"
              autoComplete="email"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-black/70">Message</span>
            <textarea
              required
              minLength={10}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="h-32 w-full resize-none rounded-2xl border border-black/15 px-4 py-3 text-sm text-ink outline-none transition-all duration-200 ease-out focus:border-gold focus:ring-2 focus:ring-gold/30"
              name="message"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
