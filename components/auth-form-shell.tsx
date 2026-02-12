import Link from 'next/link';
import { ReactNode } from 'react';

type AuthFormShellProps = {
  title: string;
  subtitle: string;
  altHref: string;
  altLabel: string;
  altText: string;
  children: ReactNode;
};

export default function AuthFormShell({
  title,
  subtitle,
  altHref,
  altLabel,
  altText,
  children
}: AuthFormShellProps): JSX.Element {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-pearl px-6 py-16">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 shadow-card sm:p-10">
        <h1 className="font-serif text-4xl text-ink">{title}</h1>
        <p className="mt-2 text-sm text-black/70">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <p className="mt-6 text-sm text-black/65">
          {altText}{' '}
          <Link
            href={altHref}
            className="font-medium text-ink underline decoration-gold/70 underline-offset-4"
          >
            {altLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
