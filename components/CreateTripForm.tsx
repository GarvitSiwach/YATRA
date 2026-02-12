'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { TravelType, Trip } from '@/lib/types';

type CreateTripFormState = {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelType: TravelType;
  notes: string;
};

const travelTypes: TravelType[] = ['Solo', 'Friends', 'Family', 'Luxury'];

const initialState: CreateTripFormState = {
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  travelType: 'Solo',
  notes: ''
};

export default function CreateTripForm(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<CreateTripFormState>(initialState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { error?: string; trip?: Trip };

      if (!response.ok || !payload.trip) {
        setError(payload.error ?? 'Failed to create trip. Please try again.');
        return;
      }

      router.push(`/trips/${payload.trip.id}`);
      router.refresh();
    } catch {
      setError('Network issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl space-y-5 rounded-3xl border border-[#1B1B1F]/10 bg-white p-8 shadow-card sm:p-10"
      noValidate
    >
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">New Trip</p>
        <h1 className="mt-2 font-serif text-5xl text-[#1B1B1F]">Create Trip</h1>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[#1B1B1F]/70">Destination</span>
        <input
          required
          value={form.destination}
          onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))}
          className="w-full rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-[#1B1B1F]/70">Start Date</span>
          <input
            required
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
            className="w-full rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#1B1B1F]/70">End Date</span>
          <input
            required
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
            className="w-full rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-[#1B1B1F]/70">Budget</span>
          <input
            required
            value={form.budget}
            onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            placeholder="e.g. 2500 USD"
            className="w-full rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#1B1B1F]/70">Travel Type</span>
          <select
            value={form.travelType}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, travelType: event.target.value as TravelType }))
            }
            className="w-full rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
          >
            {travelTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[#1B1B1F]/70">Notes</span>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          className="h-28 w-full resize-none rounded-2xl border border-[#1B1B1F]/15 px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
          placeholder="Add any context for this trip"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[#1B1B1F] px-6 py-3 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Creating Trip...' : 'Create Trip'}
      </button>
    </form>
  );
}
