'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupForm(): JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Unable to create your account right now.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network issue. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <label className="block space-y-2">
        <span className="text-sm text-black/70">Full name</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="w-full rounded-2xl border border-black/15 px-4 py-3 text-sm text-ink outline-none transition-all duration-200 ease-out focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-black/70">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="w-full rounded-2xl border border-black/15 px-4 py-3 text-sm text-ink outline-none transition-all duration-200 ease-out focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-black/70">Password</span>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-black/15 px-4 py-3 text-sm text-ink outline-none transition-all duration-200 ease-out focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
