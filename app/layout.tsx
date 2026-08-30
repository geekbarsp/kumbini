import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kumbini-filipino-craft.lilyeverson083.chatgpt.site'),
  title: 'Kumbini — Filipino craft, made meaningfully',
  description: 'A considered collection of Filipino craft, everyday objects, and modern heirlooms.',
  openGraph: {
    title: 'Kumbini — Filipino craft, made meaningfully',
    description: 'A considered collection of Filipino craft, everyday objects, and modern heirlooms.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Kumbini — Filipino craft, made meaningfully' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kumbini — Filipino craft, made meaningfully',
    description: 'A considered collection of Filipino craft, everyday objects, and modern heirlooms.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
