# Bill Payment Mobile App

## Overview
This project is a modern, mobile-first Progressive Web App (PWA) built with React and Express, designed to simplify bill management and payments. It aims to provide a seamless user experience for tracking bills, making payments, and earning rewards. The application features a clean, card-based UI optimized for mobile devices with an intuitive bottom navigation, comprehensive financial oversight, and a robust reward system. It integrates advanced AI capabilities for bill scanning and personalized suggestions, along with secure banking integrations to offer a complete financial management solution. The business vision is to become a leading platform for effortless bill payments, leveraging cutting-edge technology to enhance user control over their finances.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (January 14, 2026)
- ✅ Added Gmail Email Bills feature - scans inbox for bill-related emails
- ✅ New /email-bills page to view and import bills found in emails
- ✅ Dashboard quick actions updated to 5-button layout (Add Bill, Scan, Bank, Auto, Email)
- ✅ Added Auto-Detect Bills feature - analyzes bank transactions to find recurring bills
- ✅ New /auto-detect page for viewing and importing detected recurring bills

## Previous Changes (August 22, 2025)
- ✅ Fixed all TypeScript compilation errors
- ✅ Implemented comprehensive config audit system  
- ✅ Email service fully operational with MailerSend
- ✅ Stripe payment processing with webhook handler
- ✅ Plaid banking integration configured for Canada
- ✅ Real-time bill management with PostgreSQL
- ✅ Mobile-first responsive design optimized
- ✅ Production deployment ready for mybillport.com

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables
- **Build Tool**: Vite
- **UI/UX Decisions**: Mobile-first design using `max-w-md` container, fixed bottom navigation with 4 main sections, clean card-based layouts, and interactive elements with loading states and toast notifications.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Pattern**: RESTful API
- **Request Handling**: Express middleware for JSON parsing and logging
- **Error Handling**: Centralized error handling middleware

### Data Storage Strategy
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (via `DATABASE_URL`)
- **Connection**: Neon Database serverless driver
- **Schema Management**: Drizzle Kit for migrations
- **Data Seeding**: Automatic initialization with demo user and sample bills.

### Key Features
- **User Management**: Authentication with email/password, biometric options (Face ID/Fingerprint), and profile management.
- **Bill Management**: Add, track, categorize, and manage bills with company, amount, due date, and priority levels. Includes sorting by due date (Overdue, Due Soon, All Others) with instant updates.
- **Payment Processing**: 
  - Stripe integration for secure credit/debit card payments in CAD
  - Webhook handling for payment_intent.succeeded events
  - Manual payment method entry (debit, credit, gift cards)
  - Streamlined Interac e-Transfer payment requests with email notifications
- **AI Integration**: AI-powered bill scanning (Anthropic Claude Sonnet 4) for automatic data extraction (company, account, amount, due date) and categorization, optimized for Canadian bill formats. AI also provides intelligent bill reduction suggestions.
- **Banking Integration**: Secure Plaid SDK integration for linking bank accounts, displaying balances, and supporting checking, savings, and credit card accounts.
- **Reward System**: Points-based reward system for user engagement.
- **Notification System**: Email notifications for profile updates and payment requests via MailerSend.
- **User Profile**: Editable profile with personal information, profile picture upload (camera/gallery), and secure updates.

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight React router
- **Firebase**: Authentication (Firebase Auth) and Firestore for certain data storage.
- **Plaid SDK**: Financial institution linking and account data retrieval.
- **Anthropic API**: AI-powered bill scanning and suggestions.
- **MailerSend**: Email sending service for notifications and payment requests.

### Development & UI Enhancement
- **Vite**: Build tool
- **TypeScript**: Static typing
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Lucide React**: Icon library
- **date-fns**: Date manipulation
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation
```