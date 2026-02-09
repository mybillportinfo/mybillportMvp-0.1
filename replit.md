# MyBillPort - Bill Management MVP (Canada)

## Overview
MyBillPort is a modern Bill Management OS for people living in Canada to track recurring utility and subscription bills, see due dates clearly, and receive reminders. The app features a premium fintech color scheme with navy/slate base and muted teal accent colors, designed to feel as essential as a banking app with calm, trustworthy UX.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 9, 2026)
- ✅ FULL SCHEMA REBUILD: Bill model now uses billName, provider, category, isPaid, updatedAt
- ✅ Edit bill: inline modal with full form (name, provider, category, amount, due date)
- ✅ Mark as paid/unpaid: toggle button on each bill card
- ✅ Delete bill: confirmation dialog before removing
- ✅ Notification types: bill_added, due_soon, due_today, overdue with visual badges
- ✅ Deduplication: notifications check for recent duplicates before creating
- ✅ Due date triggers: 3 days, 1 day, today, overdue (skips paid bills)
- ✅ Settings cleaned up: only in-app toggle (persisted), removed non-functional placeholders
- ✅ Add bill validation: future date required, amount > 0, billName required
- ✅ Backward-compatible fetchBills: reads old providerName/billType fields from existing data

## Previous Changes
- ✅ In-app notification system with Firestore backend
- ✅ Notifications page with mark-as-read, mark-all-read
- ✅ Bell icon with unread badge on dashboard
- ✅ Auth: Email/password + Google Sign-In only (no phone, no Apple)
- ✅ Forgot Password flow
- ✅ Free plan limit: max 5 bills enforced
- ✅ Firestore rules: per-user data isolation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Next.js App Router
- **Styling**: Tailwind CSS with custom CSS variables (dark theme)
- **Design System**: Premium fintech theme (navy/slate/muted teal)

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard: summary cards, bill list with edit/paid/delete actions, bell icon
- `/add-bill` - Add bill form with billName, provider, category, amount, due date
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan, notifications toggle, privacy/security modals, legal links
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)

### Firestore Collections
- `bills` - userId, billName, provider, amount, category, dueDate, isPaid, createdAt, updatedAt
- `notifications` - userId, title, message, type (bill_added|due_soon|due_today|overdue), relatedBillId, isRead, createdAt
- `userPreferences` - inAppReminders (boolean)

### Key Features (MVP)
- **Bill CRUD**: Add, edit, delete, mark paid/unpaid
- **Free Plan Limit**: Maximum 5 bills per user
- **Status Indicators**: Auto-calculated (green=paid, teal=upcoming, amber=due soon, red=overdue)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Notification Triggers**: Bill added, 3 days before, 1 day before, due today, overdue
- **Deduplication**: No duplicate notifications within 24 hours per bill+type
- **Settings**: In-app reminders toggle (persisted to Firestore)
- **Auth**: Email/password + Google Sign-In + Forgot Password

### Features NOT Included (MVP Scope)
- SMS notifications, Email reminders, Push notifications (FCM)
- Gmail API bill ingestion
- Payment processing, Subscription plans

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
