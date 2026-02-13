import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Crimson_Pro } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Quick Pick',
  description: 'An interactive swipe experience to discover your inner values',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f0a1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen font-sans antialiased',
          spaceGrotesk.variable,
          crimsonPro.variable
        )}
      >
        <div className="mesh-bg min-h-screen">{children}</div>
      </body>
    </html>
  );
}
