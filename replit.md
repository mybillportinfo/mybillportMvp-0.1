# BillPort - Bill Management App (Canada)

## Overview
BillPort is a Canadian bill management web app with REAL Stripe payments (PaymentIntents). Users can add bills, track them on a dashboard, and pay via Stripe Elements (card entry). Features Firebase Auth (email/password + Google OAuth), Firestore database, Stripe PaymentIntents for real payment processing, in-app notifications, and a premium fintech UI (navy/slate/muted-teal).

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 10, 2026)
- ✅ Payments switched to REAL Stripe PaymentIntents (not simulated)
- ✅ Stripe Elements card entry modal on Dashboard
- ✅ create-payment-intent API: creates PaymentIntent with idempotency keys
- ✅ stripe-webhook API: verifies Stripe signature, logs payment events as backup
- ✅ Client-side Firestore update after Stripe confirms payment (updateBillAfterPayment)
- ✅ Payment audit trail: payments collection in Firestore with stripePaymentIntentId
- ✅ Simplified Bill model: companyName, accountNumber, dueDate, totalAmount, paidAmount, status
- ✅ Pay Full: pays remaining balance via Stripe
- ✅ Pay Partial: user enters custom amount ($0.50 min), pays via Stripe
- ✅ Status badges: Unpaid, Partial, Paid, Overdue
- ✅ Sort order: Overdue first, then upcoming, paid at bottom

## Previous Changes
- ✅ 7-day due notification trigger added
- ✅ Canadian billers expanded to 120+ with proper category/subcategory mapping
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
- **Payments**: Stripe Elements (PaymentElement) with card entry modal

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard: bill cards with status badges, Pay Full/Partial buttons, Stripe payment modal
- `/add-bill` - Add bill with company name, account number, due date, total amount
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan (3 bills free), notifications toggle, privacy/security modals
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **Payments**: Stripe PaymentIntents (real payment processing)

### Payment Flow
1. User clicks "Pay Full" or "Pay Partial" on a bill card
2. For partial: user enters custom amount ($0.50 min)
3. Client calls `/api/create-payment-intent` with billId, userId, paymentType, amount
4. Server creates Stripe PaymentIntent, returns clientSecret
5. Client renders Stripe Elements (PaymentElement) with clientSecret
6. User enters card details and confirms payment
7. On success: Client calls `updateBillAfterPayment()` to update Firestore (paidAmount, status)
8. Stripe webhook (`/api/stripe-webhook`) logs the event as backup audit trail

### Firestore Collections
- `bills` - userId, companyName, accountNumber, dueDate, totalAmount, paidAmount, status, createdAt
- `notifications` - userId, title, message, type, relatedBillId, isRead, createdAt
- `payments` - userId, billId, amountPaid, paymentType, stripePaymentIntentId, timestamp
- `userPreferences` - inAppReminders (boolean)

### Bill Status Values
- **unpaid** - No payment made (paidAmount = 0)
- **partial** - Some payment made (0 < paidAmount < totalAmount)
- **paid** - Fully paid (paidAmount >= totalAmount)

### API Routes
- `GET /api/stripe-publishable-key` - Returns Stripe publishable key for frontend
- `POST /api/create-payment-intent` - Creates Stripe PaymentIntent (params: billId, userId, paymentType, amount)
- `POST /api/stripe-webhook` - Handles Stripe webhook events (payment_intent.succeeded, payment_intent.payment_failed)

### Key Features
- **Bill CRUD**: Add (company name, account number, due date, amount), delete
- **Free Plan Limit**: Maximum 3 bills per user
- **Real Stripe Payments**: Pay Full / Pay Partial via Stripe PaymentIntents + Elements
- **Payment Validation**: Minimum $0.50 CAD, max = remaining balance
- **Idempotency**: PaymentIntents created with idempotency keys
- **Status Badges**: Unpaid, Partial, Paid, Overdue
- **Sort Order**: Overdue → Upcoming → Paid (at bottom)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Auth**: Email/password + Google Sign-In + Forgot Password

### Features NOT Included (Strict)
- ❌ No Plaid, no Interac
- ❌ No Gmail parsing
- ❌ No bank logins
- ❌ No SMS/email/push notifications
- ❌ No edit bill
- ❌ No real-time bank sync
- ❌ No categories/subcategories (simplified model)

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library
- **stripe**: Stripe server SDK
- **@stripe/stripe-js**: Stripe client SDK
- **@stripe/react-stripe-js**: Stripe React components

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID

## Stripe Configuration
- **Credentials**: Via Replit Stripe connection (auto-managed)
- **Fallback env vars**: STRIPE_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY
- **Currency**: CAD
- **Minimum Payment**: $0.50 CAD (Stripe minimum)
