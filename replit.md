# BillPort - Bill Management App (Canada)

## Overview
BillPort is a production-ready Canadian bill management web app to track recurring utility, telecom, credit card, housing, insurance, government and subscription bills, see due dates, and pay them via Stripe. Features Firebase Auth (email/password + Google OAuth), Firestore database, Stripe real payments (CAD), in-app notifications, payment status tracking, and a premium fintech UI (navy/slate/muted-teal).

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 9, 2026)
- ✅ Bill categories restructured: 7 main categories (Utilities, Telecom, Housing, Financial, Insurance, Government, Subscriptions) with sub-types
- ✅ Add Bill form: Category dropdown + sub-type selector added before company name
- ✅ Payment status tracking: paymentStatus (unpaid/partially_paid/paid), amountPaid, remainingBalance fields
- ✅ Dashboard: Shows payment status, remaining balance for partial payments, "Paid in full" badge
- ✅ Pay buttons now respect remaining balance for partially paid bills
- ✅ logPayment auto-updates bill status (isPaid, paymentStatus, amountPaid, remainingBalance)
- ✅ 7-day due notification trigger added
- ✅ Canadian billers expanded to 120+ with proper category/subcategory mapping
- ✅ Dashboard icons: new icons for Housing, Insurance, Government categories
- ✅ Branding: "MyBillPort" → "BillPort" everywhere user-facing

## Previous Changes
- ✅ Stripe integration: Real payments via Stripe Checkout (CAD), Pay Full / Pay Half buttons
- ✅ Server-side payment verification via /api/verify-payment (prevents URL spoofing)
- ✅ In-app notification system with Firestore backend
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
- `/app` - Dashboard: bill list with payment status, Pay Full/Pay Half, remaining balance, delete
- `/add-bill` - Add bill with category dropdown, sub-type, company autocomplete (120+ Canadian billers), account number
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan (3 bills free), notifications toggle, privacy/security modals, legal links
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **Payments**: Stripe Checkout (CAD currency, server-side session creation + verification)

### API Routes
- `POST /api/checkout` - Creates Stripe Checkout session (billId, amount, companyName, userId)
- `POST /api/verify-payment` - Validates Stripe session payment_status server-side
- `GET /api/stripe-key` - Returns Stripe publishable key

### Firestore Collections
- `bills` - userId, companyName, accountNumber, amount, category, subcategory, dueDate, isPaid, paymentStatus, amountPaid, remainingBalance, createdAt, updatedAt
- `notifications` - userId, title, message, type (bill_added|due_soon|due_today|overdue|payment_success), relatedBillId, isRead, createdAt
- `payments` - userId, billId, amountPaid, paymentType, stripeSessionId, timestamp
- `userPreferences` - inAppReminders (boolean)

### Bill Categories
- **Utilities**: Electricity, Natural Gas, Water & Sewer
- **Telecom**: Mobile Phone, Internet / Wi-Fi, Cable / TV
- **Housing**: Rent, Mortgage
- **Financial**: Bank Credit Cards, Retail / Store Cards, Credit Union Cards
- **Insurance**: Car Insurance, Home / Tenant Insurance, Life Insurance
- **Government & Public**: CRA Taxes, Property Tax, Student Loans
- **Subscriptions**: Streaming, Software / Cloud

### Key Features
- **Bill CRUD**: Add (with category dropdown + autocomplete), delete
- **Free Plan Limit**: Maximum 3 bills per user
- **Real Payments**: Stripe Checkout (Pay Full / Pay Half), CAD currency
- **Payment Status**: Tracks unpaid, partially paid, paid states with remaining balance
- **Payment Verification**: Server-side Stripe session validation before logging
- **Canadian Billers**: 120+ pre-loaded billers across 7 categories with sub-types
- **Status Indicators**: Auto-calculated (green=paid, blue=partially paid, teal=upcoming, amber=due soon, red=overdue)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Notification Triggers**: Bill added, 7 days before, 3 days before, tomorrow, due today, overdue, payment success
- **Deduplication**: No duplicate notifications within 24 hours per bill+type
- **Settings**: In-app reminders toggle (persisted to Firestore), privacy/security modals
- **Auth**: Email/password + Google Sign-In + Forgot Password
- **Upgrade Path**: Prepared for future Pro plan (remove bill limit)

### Features NOT Included (Current Scope)
- SMS notifications, Email reminders, Push notifications (FCM)
- Gmail API bill ingestion
- Subscription UI (Pro plan upgrade flow)
- Edit bill
- Real-time bank sync (Plaid)

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
- **Checkout Flow**: Server creates session → redirect to Stripe → return with session_id → server verifies → log payment + update bill status
