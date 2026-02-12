'use client';

import { useMemo, useState } from 'react';

import { ItineraryDay } from '@/lib/types';

type ItineraryBuilderProps = {
  tripId: string;
  initialDays: ItineraryDay[];
};

type NewActivityDraft = Record<string, string>;

export default function ItineraryBuilder({
  tripId,
  initialDays
}: ItineraryBuilderProps): JSX.Element {
  const [days, setDays] = useState<ItineraryDay[]>(initialDays);
  const [drafts, setDrafts] = useState<NewActivityDraft>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const nextDayLabel = useMemo(() => `Day ${days.length + 1}`, [days.length]);

  async function persistDays(nextDays: ItineraryDay[]): Promise<void> {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itineraryDays: nextDays })
      });

      const payload = (await response.json()) as {
        error?: string;
        trip?: { itineraryDays: ItineraryDay[] };
      };

      if (!response.ok || !payload.trip) {
        setError(payload.error ?? 'Unable to save itinerary updates.');
        return;
      }

      setDays(payload.trip.itineraryDays);
      setNotice('Saved');
      window.setTimeout(() => setNotice(''), 1200);
    } catch {
      setError('Network issue. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddDay(): Promise<void> {
    const nextDays: ItineraryDay[] = [
      ...days,
      {
        id: crypto.randomUUID(),
        title: nextDayLabel,
        activities: []
      }
    ];

    await persistDays(nextDays);
  }

  function handleDraftChange(dayId: string, value: string): void {
    setDrafts((prev) => ({ ...prev, [dayId]: value }));
  }

  async function handleAddActivity(dayId: string): Promise<void> {
    const activityName = (drafts[dayId] ?? '').trim();
    if (!activityName) {
      return;
    }

    const nextDays = days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }

      return {
        ...day,
        activities: [...day.activities, { id: crypto.randomUUID(), name: activityName }]
      };
    });

    setDrafts((prev) => ({ ...prev, [dayId]: '' }));
    await persistDays(nextDays);
  }

  function handleActivityNameChange(dayId: string, activityId: string, value: string): void {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) {
          return day;
        }

        return {
          ...day,
          activities: day.activities.map((activity) =>
            activity.id === activityId ? { ...activity, name: value } : activity
          )
        };
      })
    );
  }

  async function handleSaveEdit(): Promise<void> {
    await persistDays(days);
  }

  async function handleDeleteActivity(dayId: string, activityId: string): Promise<void> {
    const nextDays = days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }

      return {
        ...day,
        activities: day.activities.filter((activity) => activity.id !== activityId)
      };
    });

    await persistDays(nextDays);
  }

  return (
    <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-7 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl text-[#1B1B1F]">Itinerary Builder</h2>
        <button
          type="button"
          onClick={handleAddDay}
          disabled={saving}
          className="rounded-full bg-[#1B1B1F] px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add Day
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-5">
        {days.map((day) => (
          <article key={day.id} className="rounded-2xl border border-[#1B1B1F]/10 bg-[#FAF9F5] p-5">
            <h3 className="font-serif text-2xl text-[#1B1B1F]">{day.title}</h3>

            <div className="mt-4 space-y-3">
              {day.activities.length === 0 ? (
                <p className="text-sm text-[#1B1B1F]/55">No activities yet.</p>
              ) : (
                day.activities.map((activity) => (
                  <div key={activity.id} className="flex flex-wrap items-center gap-2">
                    <input
                      value={activity.name}
                      onChange={(event) =>
                        handleActivityNameChange(day.id, activity.id, event.target.value)
                      }
                      className="min-w-[220px] flex-1 rounded-xl border border-[#1B1B1F]/15 bg-white px-3 py-2 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
                    />
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="rounded-full border border-[#1B1B1F]/15 px-3 py-2 text-xs text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteActivity(day.id, activity.id)}
                      disabled={saving}
                      className="rounded-full border border-[#1B1B1F]/15 px-3 py-2 text-xs text-[#1B1B1F]/65 transition-all duration-200 ease-out hover:border-[#1B1B1F]/30 hover:text-[#1B1B1F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={drafts[day.id] ?? ''}
                onChange={(event) => handleDraftChange(day.id, event.target.value)}
                placeholder="Add activity"
                className="min-w-[220px] flex-1 rounded-xl border border-[#1B1B1F]/15 bg-white px-3 py-2 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/30"
              />
              <button
                type="button"
                onClick={() => handleAddActivity(day.id)}
                disabled={saving}
                className="rounded-full bg-[#1B1B1F] px-4 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add Activity
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 text-sm text-[#1B1B1F]/60">
        {saving ? 'Saving...' : notice || 'All updates persist automatically.'}
      </p>
    </section>
  );
}
