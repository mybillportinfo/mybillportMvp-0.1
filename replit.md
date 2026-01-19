# MyBillPort - Bill Management MVP (Canada)

## Overview
MyBillPort is a modern Bill Management OS for people living in Canada to track recurring utility and subscription bills, see due dates clearly, and receive reminders. The app features a premium dark theme with navy/charcoal base and emerald accent colors, designed to feel as essential as a banking app with calm, trustworthy UX.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (January 19, 2026)
- ✅ Full authentication system with Firebase Auth
- ✅ Sign up / Sign in with email/password
- ✅ Google Sign-In integration
- ✅ Apple Sign-In integration  
- ✅ AuthContext for app-wide user state management
- ✅ Improved login/signup pages with error handling and loading states
- ✅ Settings page shows real user info and proper logout
- ✅ Password validation with visual requirements indicator

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
- **Design System**: Premium dark theme with:
  - Navy/charcoal background (hsl(222, 47%, 11%))
  - White cards with soft shadows
  - Emerald accent (hsl(160, 84%, 39%))
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
