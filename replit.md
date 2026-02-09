# BillPort - Bill Management MVP (Canada)

## Overview
BillPort is a production-ready Canadian bill management web app to track recurring utility, telecom, credit card and subscription bills, see due dates, and pay them via Stripe. Features Firebase Auth (email/password + Google OAuth), Firestore database, Stripe real payments (CAD), in-app notifications, and a premium fintech UI (navy/slate/muted-teal).

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 9, 2026)
- ✅ Stripe integration: Real payments via Stripe Checkout (CAD), Pay Full / Pay Half buttons
- ✅ Bill schema updated: companyName, accountNumber fields, free limit changed to 3 bills
- ✅ Canadian billers autocomplete: 90+ billers (utilities, mobile, internet, credit cards, subscriptions)
- ✅ Payment logging: payments collection in Firestore with userId, billId, amountPaid, timestamp
- ✅ Payment notifications: payment_success notification type added
- ✅ /api/checkout route: Server-side Stripe session creation (secret key stays server-side)
- ✅ Dashboard rebuilt: Pay Full / Pay Half buttons, account number display, payment success handling

## Previous Changes
- ✅ In-app notification system with Firestore backend (bill_added, due_soon, due_today, overdue, payment_success)
- ✅ Notifications page with mark-as-read, mark-all-read, type-specific badges
- ✅ Bell icon with unread badge on dashboard
- ✅ Auth: Email/password + Google Sign-In only (no phone, no Apple)
- ✅ Forgot Password flow
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
- `/app` - Dashboard: bill list with Pay Full/Pay Half, account numbers, delete
- `/add-bill` - Add bill with company autocomplete (90+ Canadian billers), account number
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan, notifications toggle, privacy/security modals, legal links
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **Payments**: Stripe Checkout (CAD currency, server-side session creation)

### API Routes
- `POST /api/checkout` - Creates Stripe Checkout session (billId, amount, companyName, userId)
- `GET /api/stripe-key` - Returns Stripe publishable key (for future client-side use)

### Firestore Collections
- `bills` - userId, companyName, accountNumber, amount, category, dueDate, isPaid, createdAt, updatedAt
- `notifications` - userId, title, message, type (bill_added|due_soon|due_today|overdue|payment_success), relatedBillId, isRead, createdAt
- `payments` - userId, billId, amountPaid, stripeSessionId, timestamp
- `userPreferences` - inAppReminders (boolean)

### Key Features (MVP)
- **Bill CRUD**: Add (with autocomplete), delete
- **Free Plan Limit**: Maximum 3 bills per user
- **Real Payments**: Stripe Checkout (Pay Full / Pay Half), CAD currency
- **Payment Logging**: All payments logged to Firestore with Stripe session ID
- **Canadian Billers**: 90+ pre-loaded billers (utilities, telecom, credit cards, subscriptions, insurance)
- **Status Indicators**: Auto-calculated (green=paid, teal=upcoming, amber=due soon, red=overdue)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Notification Triggers**: Bill added, 3 days before, 1 day before, due today, overdue, payment success
- **Deduplication**: No duplicate notifications within 24 hours per bill+type
- **Settings**: In-app reminders toggle (persisted to Firestore)
- **Auth**: Email/password + Google Sign-In + Forgot Password
- **isPro Logic**: Prepared for future upgrade (remove bill limit when isPro === true)

### Features NOT Included (MVP Scope)
- SMS notifications, Email reminders, Push notifications (FCM)
- Gmail API bill ingestion
- Subscription UI (Pro plan upgrade flow)
- Edit bill (removed in favor of Pay buttons)

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library
- **stripe**: Stripe SDK for payment processing

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID

## Stripe Configuration
- **Integration**: Replit Stripe Connector (manages API keys automatically)
- **Currency**: CAD
- **Mode**: payment (one-off, not subscription)
- **Checkout Flow**: Server creates session → redirect to Stripe → return to /app with success params
