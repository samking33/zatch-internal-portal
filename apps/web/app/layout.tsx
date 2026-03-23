import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
      className={`${inter.variable} min-h-screen bg-page text-primary antialiased`}
    >
      {children}
    </body>
  </html>
);

export default RootLayout;
