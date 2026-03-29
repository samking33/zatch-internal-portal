import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Source_Sans_3 } from 'next/font/google';

import './globals.css';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-plex-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Zatch Admin Portal',
  description: 'Internal admin workspace for onboarding review and approval.',
  icons: {
    icon: '/zatch-logo.png',
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body
      suppressHydrationWarning
      className={`${sourceSans.variable} ${plexMono.variable} min-h-screen bg-page text-primary antialiased`}
    >
      {children}
    </body>
  </html>
);

export default RootLayout;
