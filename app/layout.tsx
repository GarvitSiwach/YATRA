import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'YĀTRA | Journey with Purpose',
    template: '%s | YĀTRA'
  },
  description:
    'YĀTRA is a premium travel planning web app for intentional journeys, purposeful itineraries, and calm organization.',
  keywords: ['YATRA', 'travel planner', 'journey', 'purposeful travel', 'itinerary'],
  openGraph: {
    title: 'YĀTRA | Journey with Purpose',
    description:
      'Plan meaningful journeys with clarity. Premium travel planning made simple and purposeful.',
    type: 'website'
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-white text-ink antialiased">{children}</body>
    </html>
  );
}
