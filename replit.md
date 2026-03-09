# BillPort - Bill Management App (Canada)

## Overview
BillPort is a Canadian web application designed to help users manage their bills effectively. It allows users to add and track bills on a dashboard, and facilitates payment by redirecting them to the biller's official payment website. The project aims to provide a streamlined, user-friendly experience for bill management with a premium fintech-inspired UI.

Key capabilities include:
- Bill tracking and status management.
- Redirection to over 100 Canadian billers' payment portals.
- AI-powered bill extraction from images/PDFs using Claude Vision.
- Recurring bill detection and anomaly alerts.
- User authentication via Firebase (email/password and Google OAuth).
- In-app notification system.
- Native phone push notifications (Web Push API, VAPID) — fire even when app is closed.
- PWA installable: manifest, service worker, app icons, offline support.
- Dashboard "Needs Attention" section for overdue/due-today bills.

## GitHub Repository
- **Push URL**: https://github.com/mybillportinfo/mybillportMvp-0.1.git
- Always push to this repo when the user asks to push to GitHub.
- Do NOT push to MVP-0.1.git (wrong repo).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Next.js App Router
- **Styling**: Tailwind CSS with custom CSS variables, dark theme
- **Design System**: Premium fintech theme (navy/slate/muted teal)
- **UI/UX Decisions**: Intuitive dashboard with bill cards, status badges, and a single "Pay" button for redirection. "Smart Add Bill" feature with AI-powered extraction and editable fields.

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)
- **AI Integration**: Claude Vision (claude-sonnet-4-5) for bill data extraction.
- **System Design Choices**:
    - **Payment Flow**: Redirects users directly to the biller's official website for payments; no in-app payment processing.
    - **Recurring Bill Intelligence**: Automatically detects recurring bills based on payment patterns and flags amount deviations.
    - **Provider Normalization**: Utilizes a registry of 120+ Canadian providers for consistent biller identification.
    - **User Profile Management**: Includes username, email change, profile photo upload, and account deletion functionalities.
    - **Notification System**: In-app notifications with mark-as-read features. Also sends native Web Push notifications to the phone via VAPID (web-push package). Subscriptions stored in `pushSubscriptions` Firestore collection.
- **Gmail Scanner**: REMOVED — Gmail OAuth scanning feature fully deleted. AI bill scan (camera/photo/PDF upload → Claude Vision) is the primary smart import method.

### Core Features
- **Bill Management**: Add, view, edit, and delete bills.
- **Smart Add Bill**: AI-powered extraction from uploaded images or PDFs, with fuzzy matching for vendors.
- **Recurring Bill Detection**: Identifies recurring bills and alerts on significant amount changes.
- **Biller Payment Redirection**: Redirects to official payment URLs for recognized Canadian billers; Google search fallback for unknown billers.
- **User Authentication**: Email/password and Google Sign-In with password reset.
- **Profile & Preferences**: Manage user profile, email verification, and notification settings.
- **Dashboard**: Displays bills with status (Unpaid, Partial, Paid, Overdue) and prioritizes overdue bills.
- **Cash Flow Calendar**: Monthly calendar showing bill due dates and paydays, day tap popup, monthly summary (money in/out/net), low-funds alert, income schedule setup.
- **Security**: Firebase rules ensure per-user data isolation.
- **Premium Subscription**: Stripe Checkout-based subscription ($7/month). Free plan = 5 bills, Premium = unlimited. API routes: /api/stripe/checkout, /api/stripe/portal, /api/stripe/webhook. Subscription status stored in userProfiles/{uid}.subscription. Requires STRIPE_PRICE_ID env var.
- **Email Forwarding Auto-Fetch**: Per-user forwarding address (bills+{uid_short}@mybillport.com). SendGrid Inbound Parse webhook at /api/email-forward. Pending bills stored in pendingBills/{uid}/items. Review queue at /pending-bills. Email alias auto-created in emailAliases collection.
- **Bill Negotiation Assistant**: Claude-powered negotiation script generator. Button on each bill card (chat icon). API route /api/negotiate. Opens modal with copyable script.
- **Switch & Save Recommendations**: Canadian provider offer database in app/lib/providerOffers.ts. Dashboard shows dismissible savings cards when current bill is >10% more expensive than alternatives. 14+ offers across telecom, internet, streaming, insurance, utilities.
- **MyBillPort AI Agent**: Claude-powered conversational bill assistant. Floating chat widget (Sparkles button, bottom-right) on the dashboard. API route /api/ai-assistant with Claude tool use. Tools: get_bills, get_bills_due, get_monthly_spending, detect_bill_increase, get_subscriptions. Full conversation history preserved per session. Quick prompt buttons for common questions.

### Firestore Collections
- `bills`: Main bill data.
- `bills/{billId}/payments`: Subcollection for payment history of individual bills.
- `notifications`: Stores user notifications.
- `userProfiles`: User profile information.
- `userPreferences`: Stores user notification preferences.
- `feedback`: Stores user feedback.
- `pushSubscriptions`: Web Push API subscriptions (keyed by userId).
- `income`: Per-day income entries (`userId`, `amount`, `date` YYYY-MM-DD, `description`, `frequency`, `createdAt`).

## External Dependencies
- **Firebase**: Authentication and Firestore database.
- **Next.js**: Web framework.
- **Lucide React**: Icon library.
- **Anthropic API**: For Claude Vision AI capabilities (specifically `ANTHROPIC_API_KEY`).
- **Nodemailer**: For sending welcome emails via Gmail SMTP.
- **Formspree**: For handling feedback submissions.
- **Google OAuth**: For Google Sign-In functionality.
- **Stripe**: Legacy API routes and SDKs are present but not actively used for in-app payment processing.
- **web-push**: Server-side Web Push notification sending via VAPID keys.
- **VAPID Keys**: Generated and stored as env vars (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL). Must also be added to Vercel for production.