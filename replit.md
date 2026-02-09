# MyBillPort - Bill Management MVP (Canada)

## Overview
MyBillPort is a modern Bill Management OS for people living in Canada to track recurring utility and subscription bills, see due dates clearly, and receive reminders. The app features a premium fintech color scheme with navy/slate base and muted teal accent colors, designed to feel as essential as a banking app with calm, trustworthy UX.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 9, 2026)
- ✅ Removed phone number auth (unstable) and Apple sign-in (not needed yet)
- ✅ Auth now: Email/password + Google Sign-In only
- ✅ Forgot Password flow kept working (/forgot-password)
- ✅ Settings page: Notifications, Privacy, Security modals are functional
- ✅ Free plan limit enforced: max 5 bills, blocks adding more with clear message
- ✅ Delete bill confirmation dialog before removing
- ✅ Bill count displayed on dashboard (X/5 used) and add-bill page
- ✅ Error retry button on dashboard when bills fail to load
- ✅ "Add Another Bill" CTA on dashboard when under limit
- ✅ Future prep comments added for Gmail API, email detection, notifications
- ✅ No dead buttons, no broken links, all settings items functional

## Previous Changes (February 9, 2026)
- ✅ Complete auth system hardening with multiple sign-in methods
- ✅ Google Sign-In via signInWithPopup on login and signup pages
- ✅ Forgot Password page (/forgot-password) with Firebase sendPasswordResetEmail
- ✅ Fixed Firebase API key format issue (.env.local had extra quotes/comma)
- ✅ Removed _initFailed poison flag so Firebase can retry initialization

## Previous Changes (February 6, 2026)
- ✅ Fixed env variable config to support both Replit and Vercel deployment
- ✅ Improved auth guard on settings page to prevent premature redirects
- ✅ Updated all contact emails to mybillportinfo@gmail.com

## Previous Changes (February 5, 2026)
- ✅ Fixed Firestore permission-denied errors blocking bill CRUD operations
- ✅ Added ID token refresh before Firestore operations for reliable auth
- ✅ Production-safe Firestore rules enforcing per-user data isolation
- ✅ Full demo flow working: signup → login → add bill → view bills → logout

## Previous Changes (January 29, 2026)
- ✅ Premium fintech color palette redesign (navy/slate/muted teal)

## Previous Changes (January 20, 2026)
- ✅ Branded welcome emails via MailerSend

## Previous Changes (January 19, 2026)
- ✅ Full authentication system with Firebase Auth
- ✅ Sign up / Sign in with email/password
- ✅ Google Sign-In integration (OAuth configured for production domains)

## Previous Changes (January 14, 2026)
- ✅ MVP pivot: removed non-core features (AI scanning, Plaid, camera scan)
- ✅ Tiered email reminder system (7 days, 2 days, due day, overdue)
- ✅ Bill type categorization (hydro, internet, phone, subscription, other)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Next.js App Router
- **Styling**: Tailwind CSS with custom CSS variables (dark theme)
- **Build Tool**: Next.js (Vite for dev)
- **Design System**: Premium fintech theme with:
  - Primary: Navy (hsl(220, 40%, 20%)) for main buttons and headers
  - Secondary: Slate (hsl(220, 15%, 35%)) for secondary elements
  - Accent: Muted teal (hsl(168, 55%, 42%)) for success states and CTAs
  - White cards with soft shadows
  - Mobile-first (max-w-md container)
  - Bottom navigation with 3 sections

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard with greeting, summary cards, bill list, delete confirmation
- `/add-bill` - Add bill form with category selection and 5-bill limit enforcement
- `/settings` - Profile, plan, notifications/privacy/security modals, legal links, logout
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **Email**: MailerSend for bill reminders

### Key Features (MVP)
- **Bill Management**: Add, track, categorize, delete bills with confirmation
- **Free Plan Limit**: Maximum 5 bills per user, enforced on add-bill page
- **Status Indicators**: Auto-calculated (green=upcoming, yellow=due soon, red=overdue)
- **Settings Modals**: Notifications (toggle reminders), Privacy (data rights), Security (sign-in info)
- **Auth**: Email/password + Google Sign-In + Forgot Password

### Features NOT Included (MVP Scope)
- Phone number auth (removed - unstable)
- Apple Sign-In (removed - requires Apple Developer setup)
- AI bill scanning
- Bank account linking (Plaid)
- Payment processing
- Complex charts/analytics

### Future Features (Placeholders Ready)
- Gmail API bill parsing (connect Gmail, auto-detect bills)
- Email-based bill detection (scan for recurring patterns)
- Notification system (push via FCM, scheduled email reminders)
- 2FA (two-factor authentication)
- Hide bill amounts (privacy feature)

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library
- **MailerSend**: Email service

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Firestore Rules**: Production-safe rules enforcing userId matching
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables Required**:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
