# BillPort - Bill Management App (Canada)

## Overview
BillPort is a Canadian bill management web app. Users can add bills, track them on a dashboard, and pay by being redirected to the biller's official payment website. Features Firebase Auth (email/password + Google OAuth), Firestore database, 100+ Canadian biller payment URLs, in-app notifications, and a premium fintech UI (navy/slate/muted-teal).

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 13, 2026)
- ✅ Edit Bill feature: pencil icon on every bill card opens modal to update biller name, account number, amount, due date
- ✅ updateBill() in firebase.ts with ownership check, validation, and auto status recalculation
- ✅ Edit modal matches app theme (white modal, teal accents, same styling as Mark Paid modal)
- ✅ "Mark as Paid" feature: green button on each unpaid bill, opens modal with method/confirmation/notes
- ✅ Payment history: subcollection bills/{billId}/payments stores each payment record
- ✅ Payment history accordion on paid bill cards (History button expands/collapses)
- ✅ markBillAsPaid() uses Firestore transaction, writes to subcollection + top-level payments
- ✅ getPaymentHistory() reads from subcollection ordered by paidAt desc
- ✅ Success toast notification after marking paid
- ✅ Firebase Auth persistence already set to browserLocalPersistence (stay logged in)
- ✅ Payment flow changed: removed in-app Stripe Elements, now redirects to biller's official payment page
- ✅ Payment URL registry (app/lib/paymentUrls.ts): 100+ Canadian billers with direct payment URLs
- ✅ New /payment page: mobile-first, shows biller name + "Pay Now on [Biller] Website" button
- ✅ Fallback: if biller not in registry, "Find Payment Page" button searches Google
- ✅ Dashboard simplified: single "Pay" button per bill + "Mark Paid" button
- ✅ Removed Stripe Elements and payment modal from dashboard
- ✅ Privacy Policy updated: PIPEDA-compliant, Firebase/Google Cloud disclosure, cookies, contact info
- ✅ Terms of Service updated: removed Plaid/Gmail references, accurate to actual features
- ✅ Landing page: CTA changed to "Get Early Access", removed false "Join thousands" claim
- ✅ Footer: added Contact email link, copyright notice

## Previous Changes (February 10, 2026)
- ✅ Provider normalization: every bill now stores providerId + providerName
- ✅ Provider registry (app/lib/providerRegistry.ts): 120+ Canadian providers mapped to stable IDs
- ✅ resolveProvider() utility: known providers get registry ID, custom providers get "custom_<slug>"
- ✅ addBill() validates providerId + providerName are non-empty before Firestore write
- ✅ fetchBills() backward compatible: old bills get providerId="unknown", providerName=companyName
- ✅ Bill interface updated: providerId (required), providerName (required), isCustomProvider (optional)
- ✅ Simplified Bill model: companyName, accountNumber, dueDate, totalAmount, paidAmount, status
- ✅ Status badges: Unpaid, Partial, Paid, Overdue
- ✅ Sort order: Overdue first, then upcoming, paid at bottom

## Older Changes
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
- **Payments**: Redirect to biller's official payment website (no in-app payment processing)

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard: bill cards with status badges, single Pay button per bill
- `/add-bill` - Add bill with company name, account number, due date, total amount
- `/payment` - Payment redirect page: shows biller name + "Pay Now on [Biller] Website" button
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan (3 bills free), notifications toggle, privacy/security modals
- `/privacy` - Full privacy policy page (PIPEDA-compliant)
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)

### Payment Flow
1. User clicks "Pay $X.XX" on a bill card in the dashboard
2. Navigates to `/payment?biller=CompanyName&amount=XX.XX`
3. Payment page shows biller name and amount
4. If biller is in the registry: "Pay Now on [Biller] Website" button opens their payment page in a new tab
5. If biller is not found: "Find Payment Page" button searches Google for "[Biller] pay bill Canada"

### Payment URL Registry (app/lib/paymentUrls.ts)
- 274 Canadian billers with direct payment/account URLs
- Categories: Utilities (electricity, gas, water), Telecom (mobile/internet/cable), Government (federal/provincial/municipal), Insurance (auto/home/life - public + private), Banking (credit cards/loans), Mortgage Lenders, Transportation (toll/transit), Education (student loans), Subscriptions (digital), Property Management, Miscellaneous Recurring
- Case-insensitive fuzzy matching via getPaymentUrl()
- Google search fallback via getGoogleSearchUrl()

### Firestore Collections
- `bills` - userId, companyName, accountNumber, dueDate, totalAmount, paidAmount, status, paidAt, lastPaymentAmount, lastPaymentDate, createdAt
- `bills/{billId}/payments` - (subcollection) paidAt, amount, method, confirmationCode, recordedVia, notes, userId
- `notifications` - userId, title, message, type, relatedBillId, isRead, createdAt
- `payments` - (top-level audit trail) userId, billId, amountPaid, paymentType, method, recordedVia, timestamp
- `userPreferences` - inAppReminders (boolean)

### Bill Status Values
- **unpaid** - No payment made (paidAmount = 0)
- **partial** - Some payment made (0 < paidAmount < totalAmount)
- **paid** - Fully paid (paidAmount >= totalAmount)

### API Routes (legacy, still present)
- `GET /api/stripe-publishable-key` - Returns Stripe publishable key
- `POST /api/create-payment-intent` - Creates Stripe PaymentIntent
- `POST /api/stripe-webhook` - Handles Stripe webhook events

### Key Features
- **Bill CRUD**: Add (company name, account number, due date, amount), delete
- **Free Plan Limit**: Maximum 3 bills per user
- **Biller Payment Redirect**: Single "Pay" button redirects to biller's official payment website
- **100+ Canadian Billers**: Pre-mapped payment URLs for major utilities, telecoms, banks, insurance
- **Google Fallback**: Unknown billers get a Google search link
- **Status Badges**: Unpaid, Partial, Paid, Overdue
- **Sort Order**: Overdue → Upcoming → Paid (at bottom)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Auth**: Email/password + Google Sign-In + Forgot Password

### Features NOT Included (Strict)
- ❌ No in-app payment processing (redirects to biller website)
- ❌ No partial payment option
- ❌ No Plaid, no bank logins
- ❌ No Gmail parsing
- ❌ No SMS/email/push notifications
- ✅ Edit bill (biller name, account number, amount, due date)
- ❌ No real-time bank sync

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library
- **stripe**: Stripe server SDK (legacy API routes still present)
- **@stripe/stripe-js**: Stripe client SDK (legacy, no longer used in dashboard)
- **@stripe/react-stripe-js**: Stripe React components (legacy, no longer used in dashboard)

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
