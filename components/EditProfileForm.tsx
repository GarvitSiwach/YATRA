'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type EditProfileFormProps = {
  initialBio?: string;
  initialProfileImage?: string;
  onCancel: () => void;
};

export default function EditProfileForm({
  initialBio,
  initialProfileImage,
  onCancel
}: EditProfileFormProps): JSX.Element {
  const router = useRouter();
  const [bio, setBio] = useState(initialBio ?? '');
  const [profileImage, setProfileImage] = useState(initialProfileImage ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio,
          profileImage
        })
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? 'Unable to update your profile right now.');
        return;
      }

      setSuccess('Profile updated successfully.');
      router.refresh();
    } catch {
      setError('Unable to update your profile right now.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#1B1B1F]/10 bg-white p-6 shadow-card sm:p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-[#CBA258]">Edit Profile</p>
      <h2 className="mt-3 font-serif text-3xl text-[#1B1B1F]">Profile Details</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="profileImage" className="text-sm font-medium text-[#1B1B1F]">
            Profile Image URL
          </label>
          <input
            id="profileImage"
            name="profileImage"
            value={profileImage}
            onChange={(event) => setProfileImage(event.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full rounded-xl border border-[#1B1B1F]/15 bg-[#FAF9F5] px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/20"
          />
          <p className="text-xs text-[#1B1B1F]/55">Leave blank to use initials avatar.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium text-[#1B1B1F]">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            maxLength={220}
            placeholder="Tell travelers a little about your journey style."
            className="w-full rounded-xl border border-[#1B1B1F]/15 bg-[#FAF9F5] px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all duration-200 ease-out focus:border-[#CBA258] focus:ring-2 focus:ring-[#CBA258]/20"
          />
          <p className="text-xs text-[#1B1B1F]/55">{bio.length}/220</p>
        </div>

        {error ? <p className="text-sm text-[#1B1B1F]">{error}</p> : null}
        {success ? <p className="text-sm text-[#1B1B1F]/70">{success}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1B1B1F] px-5 py-2 text-sm text-white transition-all duration-200 ease-out hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#1B1B1F]/20 px-5 py-2 text-sm text-[#1B1B1F]/80 transition-all duration-200 ease-out hover:border-[#CBA258] hover:text-[#1B1B1F] active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
