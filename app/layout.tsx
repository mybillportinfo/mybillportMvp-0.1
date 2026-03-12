import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { InstallBanner } from './components/InstallBanner';
import { OrganizationJsonLd, WebsiteJsonLd } from './components/JsonLd';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://mybillport.com'),
  title: {
    default: 'MyBillPort — Never Miss a Bill Again | Canadian Bill Management',
    template: '%s | MyBillPort',
  },
  description: 'MyBillPort helps Canadians track, manage, and pay all their bills in one place. AI-powered bill scanning, smart reminders, and one-click payments for 120+ Canadian billers. Free to start.',
  keywords: [
    'bill management Canada',
    'Canadian bill tracker',
    'pay bills online Canada',
    'bill payment app',
    'never miss a bill',
    'utility bill tracker',
    'subscription management',
    'bill reminder app',
    'Canadian fintech',
    'Rogers bill payment',
    'Bell bill payment',
    'Telus bill payment',
    'Hydro bill tracker',
    'bill organizer app',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'MyBillPort',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://mybillport.com',
    siteName: 'MyBillPort',
    title: 'MyBillPort — Never Miss a Bill Again',
    description: 'Track, manage, and pay all your Canadian bills in one place. AI-powered scanning, smart reminders, 120+ billers supported. Free to start.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'MyBillPort - Canadian Bill Management App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyBillPort — Never Miss a Bill Again',
    description: 'Track, manage, and pay all your Canadian bills in one place. AI-powered scanning, smart reminders, 120+ billers. Free to start.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mybillport.com',
  },
  verification: {},
  category: 'finance',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script src="https://accounts.google.com/gsi/client" async />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <InstallBanner />
        </Providers>
      </body>
    </html>
  );
}
