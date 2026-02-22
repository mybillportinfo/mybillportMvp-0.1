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
    - **Notification System**: In-app notifications with mark-as-read features.

### Core Features
- **Bill Management**: Add, view, edit, and delete bills.
- **Smart Add Bill**: AI-powered extraction from uploaded images or PDFs, with fuzzy matching for vendors.
- **Recurring Bill Detection**: Identifies recurring bills and alerts on significant amount changes.
- **Biller Payment Redirection**: Redirects to official payment URLs for recognized Canadian billers; Google search fallback for unknown billers.
- **User Authentication**: Email/password and Google Sign-In with password reset.
- **Profile & Preferences**: Manage user profile, email verification, and notification settings.
- **Dashboard**: Displays bills with status (Unpaid, Partial, Paid, Overdue) and prioritizes overdue bills.
- **Security**: Firebase rules ensure per-user data isolation.

### Firestore Collections
- `bills`: Main bill data.
- `bills/{billId}/payments`: Subcollection for payment history of individual bills.
- `notifications`: Stores user notifications.
- `userProfiles`: User profile information.
- `userPreferences`: Stores user notification preferences.
- `feedback`: Stores user feedback.

## External Dependencies
- **Firebase**: Authentication and Firestore database.
- **Next.js**: Web framework.
- **Lucide React**: Icon library.
- **Anthropic API**: For Claude Vision AI capabilities (specifically `ANTHROPIC_API_KEY`).
- **Nodemailer**: For sending welcome emails via Gmail SMTP.
- **Formspree**: For handling feedback submissions.
- **Google OAuth**: For Google Sign-In functionality.
- **Stripe**: Legacy API routes and SDKs are present but not actively used for in-app payment processing.