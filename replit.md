# MyBillPort - Bill Management MVP (Canada)

## Overview
MyBillPort is a modern Bill Management OS for people living in Canada to track recurring utility and subscription bills, see due dates clearly, and receive reminders. The app features a premium fintech color scheme with navy/slate base and muted teal accent colors, designed to feel as essential as a banking app with calm, trustworthy UX.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 9, 2026)
- ✅ In-app notification system: Firestore-backed notifications with bell icon on dashboard
- ✅ Notifications page (/notifications): view all notifications, mark as read, mark all read
- ✅ Auto-create notification when a bill is added
- ✅ Auto-create due-soon notifications for bills due within 3 days
- ✅ Settings: "In-App Bill Reminders" toggle persisted in Firestore (userPreferences collection)
- ✅ Notification toggle respected before creating notifications
- ✅ Provider field added to add-bill form
- ✅ Bell icon with unread count badge on dashboard header
- ✅ TODO comments for push notifications, email reminders, Gmail ingestion, subscription plans

## Previous Changes (February 9, 2026)
- ✅ Removed phone number auth (unstable) and Apple sign-in (not needed yet)
- ✅ Auth now: Email/password + Google Sign-In only
- ✅ Forgot Password flow kept working (/forgot-password)
- ✅ Settings page: Notifications, Privacy, Security modals are functional
- ✅ Free plan limit enforced: max 5 bills, blocks adding more with clear message
- ✅ Delete bill confirmation dialog before removing
- ✅ Bill count displayed on dashboard (X/5 used) and add-bill page

## Previous Changes (February 6, 2026)
- ✅ Fixed env variable config to support both Replit and Vercel deployment
- ✅ Improved auth guard on settings page to prevent premature redirects

## Previous Changes (February 5, 2026)
- ✅ Fixed Firestore permission-denied errors blocking bill CRUD operations
- ✅ Production-safe Firestore rules enforcing per-user data isolation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Next.js App Router
- **Styling**: Tailwind CSS with custom CSS variables (dark theme)
- **Build Tool**: Next.js (Vite for dev)
- **Design System**: Premium fintech theme (navy/slate/muted teal)

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard with greeting, summary cards, bill list, bell icon, delete confirmation
- `/add-bill` - Add bill form with provider, category, amount, due date, 5-bill limit
- `/notifications` - In-app notification list with mark read/mark all read
- `/settings` - Profile, plan, notifications/privacy/security modals, legal links, logout
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **Email**: MailerSend for bill reminders (future)

### Firestore Collections
- `bills` - User bills (userId, providerName, billType, amount, dueDate, createdAt)
- `notifications` - In-app notifications (userId, title, message, relatedBillId, isRead, createdAt)
- `userPreferences` - User settings (inAppReminders boolean)

### Key Features (MVP)
- **Bill Management**: Add, track, categorize, delete bills with confirmation
- **Free Plan Limit**: Maximum 5 bills per user, enforced on add-bill page
- **Status Indicators**: Auto-calculated (green=upcoming, yellow=due soon, red=overdue)
- **In-App Notifications**: Bell icon with unread count, notification page, mark as read
- **Notification Triggers**: Bill added, bill due within 3 days
- **Settings**: In-app reminders toggle (persisted), privacy/security modals
- **Auth**: Email/password + Google Sign-In + Forgot Password

### Features NOT Included (MVP Scope)
- SMS notifications
- Email sending
- Push notifications (FCM)
- Gmail API bill ingestion
- Payment processing
- Subscription plans

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Firestore Rules**: Production-safe rules enforcing userId matching
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables Required**:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
