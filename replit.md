# MyBillPort - Bill Management MVP (Canada)

## Overview
MyBillPort is a modern Bill Management OS for people living in Canada to track recurring utility and subscription bills, see due dates clearly, and receive reminders. The app features a premium fintech color scheme with navy/slate base and muted teal accent colors, designed to feel as essential as a banking app with calm, trustworthy UX.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (January 29, 2026)
- ✅ Premium fintech color palette redesign (navy/slate/muted teal)
- ✅ Replaced all emerald references with new professional color scheme
- ✅ Updated buttons with navy primary, slate secondary/outline variants
- ✅ Refined page backgrounds with calm slate gradients
- ✅ All pages updated: landing, dashboard, settings, login, signup, add-bill

## Previous Changes (January 20, 2026)
- ✅ Branded welcome emails via MailerSend (displays as "MyBillPort")
- ✅ Custom welcome email with MyBillPort branding
- ✅ Welcome email automatically sent after successful signup
- ✅ Using MailerSend verified test domain for sending

## Previous Changes (January 19, 2026)
- ✅ Full authentication system with Firebase Auth
- ✅ Sign up / Sign in with email/password
- ✅ Google Sign-In integration (OAuth configured for production domains)
- ✅ Apple Sign-In button shows "Coming Soon" (requires Apple Developer setup)
- ✅ AuthContext for app-wide user state management
- ✅ Improved login/signup pages with error handling and loading states
- ✅ Settings page shows real user info and proper logout
- ✅ Password validation with visual requirements indicator
- ✅ Fixed Firebase App Check enforcement blocking authentication
- ✅ Added Firebase auth redirect URIs for production domains

## Previous Changes (January 16, 2026)
- ✅ Complete UI redesign with premium dark theme (navy/charcoal + emerald)
- ✅ New dashboard with personalized greeting and summary cards (Total, Due Soon, Overdue)
- ✅ Settings page with profile, free plan indicator, and integration placeholders
- ✅ Gmail and iCloud integration placeholders ("Coming Soon")
- ✅ Premium indicator with "Coming Soon" for future paid features
- ✅ Simplified bottom navigation (Home, Add Bill, Settings)
- ✅ Updated landing page with dark theme and phone mockup

## Changes (January 14, 2026)
- ✅ MVP pivot: removed non-core features (AI scanning, Plaid, camera scan)
- ✅ Tiered email reminder system (7 days, 2 days, due day, overdue)
- ✅ Bill type categorization (hydro, internet, phone, subscription, other)
- ✅ Fixed mark-as-paid instant UI updates

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with custom CSS variables (dark theme)
- **Build Tool**: Vite
- **Design System**: Premium fintech theme with:
  - Primary: Navy (hsl(220, 40%, 20%)) for main buttons and headers
  - Secondary: Slate (hsl(220, 15%, 35%)) for secondary elements
  - Accent: Muted teal (hsl(168, 55%, 42%)) for success states and CTAs
  - White cards with soft shadows
  - Mobile-first (max-w-md container)
  - Bottom navigation with 3 sections

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password, Google, or Apple
- `/signup` - Create account with email/password, Google, or Apple
- `/app` - Dashboard with greeting, summary cards, bill list
- `/add-bill` - Add bill form with category selection
- `/settings` - Profile (real user info), plan, connected accounts, logout

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: MailerSend for bill reminders

### Key Features (MVP)
- **Bill Management**: Add, track, categorize bills with name, type, amount, due date
- **Status Indicators**: Auto-calculated (green=upcoming, yellow=due soon, red=overdue)
- **Reminders**: Email notifications at 7 days, 2 days, due date, and overdue
- **Settings**: Profile info, notification preferences, integration placeholders
- **Free Plan**: Up to 5 bills (premium placeholder for future)

### Features NOT Included (MVP Scope)
- AI bill scanning
- Bank account linking (Plaid)
- Camera scan
- Budgeting tools
- Payment processing
- Complex charts/analytics

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Database ORM
- **wouter**: Lightweight router
- **lucide-react**: Icon library
- **MailerSend**: Email service
