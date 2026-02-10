# BillPort - Bill Management App (Canada)

## Overview
BillPort is a production-ready Canadian bill management web app to track recurring utility, telecom, credit card, housing, insurance, government, transportation, education, and subscription bills. Features Firebase Auth (email/password + Google OAuth), Firestore database, simulated payments (state tracking, no real payment processing), in-app notifications, and a premium fintech UI (navy/slate/muted-teal).

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 10, 2026)
- ✅ Payments changed to SIMULATED (logical state updates, no Stripe checkout)
- ✅ Data model renamed: providerName, paidAmount, remainingAmount, billingFrequency, notes
- ✅ Categories updated: 10 categories (Utilities, Telecom & Internet, Credit Cards, Housing, Insurance, Subscriptions, Transportation, Government, Education, Other)
- ✅ Pay Full: sets paidAmount=amount, remainingAmount=0, status=paid, disables buttons
- ✅ Pay Half: sets paidAmount=amount/2, remainingAmount=amount/2, status=partially_paid
- ✅ Pay Remaining: clears remaining, sets status=paid (shown for partially_paid bills)
- ✅ Status badges: 🟡 Unpaid, 🔵 Partially Paid, 🟢 Paid
- ✅ Sort order: Overdue first, then upcoming, paid at bottom
- ✅ Add Bill form: billingFrequency (Monthly/Biweekly/Annual), notes fields added
- ✅ Backward compatibility: fetchBills normalizes old field names (companyName→providerName, amountPaid→paidAmount, etc.)

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

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard: bill cards with status badges, Pay Full/Half/Remaining, sorted by urgency
- `/add-bill` - Add bill with category dropdown, sub-type, provider autocomplete, billing frequency, notes
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan (3 bills free), notifications toggle, privacy/security modals, legal links
- `/privacy` - Full privacy policy page
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **Payments**: Simulated (logical state updates in Firestore, NO real payment processing)

### Firestore Collections
- `bills` - userId, category, subcategory, providerName, accountNumber, dueDate, amount, paidAmount, remainingAmount, status, billingFrequency, notes, createdAt
- `notifications` - userId, title, message, type (bill_added|due_soon|due_today|overdue|payment_success), relatedBillId, isRead, createdAt
- `payments` - userId, billId, amountPaid, paymentType, timestamp
- `userPreferences` - inAppReminders (boolean)

### Bill Categories (10 total)
- **Utilities**: Electricity, Natural Gas, Water & Sewer
- **Telecom & Internet**: Mobile Phone, Internet / Wi-Fi, Cable / TV
- **Credit Cards**: Bank Credit Card, Retail / Store Card, Credit Union Card
- **Housing (Rent / Mortgage)**: Rent, Mortgage
- **Insurance**: Car Insurance, Home / Tenant Insurance, Life Insurance
- **Subscriptions**: Streaming, Software / Cloud
- **Transportation**: Car Payment / Lease, Transit Pass
- **Government**: CRA Taxes, Property Tax, Student Loans
- **Education**: Tuition, Student Loan
- **Other**: (no subcategories)

### Key Features
- **Bill CRUD**: Add (with category dropdown + autocomplete), delete
- **Free Plan Limit**: Maximum 3 bills per user, enforced at UI + Firestore write guard
- **Simulated Payments**: Pay Full / Pay Half / Pay Remaining (state tracking only)
- **Payment Logic**: Pay Full→paid, Pay Half→partially_paid, Pay Remaining→paid
- **Canadian Billers**: 120+ pre-loaded billers across 10 categories with sub-types
- **Status Badges**: 🟡 Unpaid, 🔵 Partially Paid, 🟢 Paid, 🔴 Overdue
- **Sort Order**: Overdue → Upcoming → Paid (at bottom)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Notification Triggers**: Bill added, 7 days before, 3 days before, tomorrow, due today, overdue, payment recorded
- **Deduplication**: No duplicate notifications within 24 hours per bill+type
- **Settings**: In-app reminders toggle (persisted to Firestore), privacy/security modals
- **Auth**: Email/password + Google Sign-In + Forgot Password
- **Billing Frequency**: Monthly, Biweekly, or Annual tracking per bill
- **Notes**: Optional notes field per bill

### Features NOT Included (Strict)
- ❌ No real payments (no Stripe, no Plaid, no Interac)
- ❌ No Gmail parsing
- ❌ No bank logins
- ❌ No notifications expansion beyond current triggers
- ❌ No SMS/email/push notifications
- ❌ No edit bill
- ❌ No real-time bank sync

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
