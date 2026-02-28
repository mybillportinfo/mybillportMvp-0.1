import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyBillPort - Bill Management Made Simple',
  description: 'Track recurring utility and subscription bills, see due dates clearly, and receive reminders. The smart app for managing all your bills in one place.',
  keywords: 'bill management, utility bills, subscription tracking, fintech, bill tracker',
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
        <script
          src="https://www.google.com/recaptcha/enterprise.js?render=6Lfby0ksAAAAAPcrsjoe3qZjjD03IxkvRW8pZanp"
          async
        />
        <script src="https://accounts.google.com/gsi/client" async />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
