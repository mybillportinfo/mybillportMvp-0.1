import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { InstallBanner } from './components/InstallBanner';
import { CookieBanner } from './components/CookieBanner';
import { OrganizationJsonLd, WebsiteJsonLd } from './components/JsonLd';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://mybillport.com'),
  title: {
    default: "MyBillPort — Never Miss a Bill Payment Again",
    template: '%s | MyBillPort',
  },
  description: "Canada's #1 AI-powered bill management app. Track every bill, get smart reminders, and never pay a late fee again. The best Mint alternative for Canadians.",
  keywords: [
    'bill tracker Canada',
    'bill reminder app Canada',
    'Mint alternative Canada',
    'Canadian bill management',
    'never miss bill payment',
    'bill organizer app',
    'late fee protection Canada',
    'bill payment reminder',
    'manage bills Canada',
    'bill management app',
    'pay bills online Canada',
    'bill due date tracker',
    'MyBillPort',
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
    title: "MyBillPort — Never Miss a Bill Payment Again",
    description: "Canada's #1 AI-powered bill management app. Track every bill, get smart reminders, and never pay a late fee again.",
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'MyBillPort — Bill Management App for Canadians',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MyBillPort — Never Miss a Bill Payment Again",
    description: "Canada's #1 AI bill tracker. Smart reminders. Never pay late fees again.",
    images: ['/opengraph-image'],
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
  verification: {
    google: 'Uxc-bnximq6iIEU6ov3bet937rsZgYpH6Ltzcs8aEMo',
  },
  category: 'finance',
};

export const viewport: Viewport = {
  themeColor: '#1E2A3A',
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
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
