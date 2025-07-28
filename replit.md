# Bill Payment Mobile App

## Overview

This is a modern bill payment mobile application built as a Progressive Web App (PWA) using React and Express. The app provides a mobile-first experience for managing bills, making payments, and earning rewards. It features a clean, card-based UI optimized for mobile devices with a bottom navigation pattern.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **API Pattern**: RESTful API with conventional HTTP methods
- **Request Handling**: Express middleware for JSON parsing and logging
- **Error Handling**: Centralized error handling middleware

### Data Storage Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Connection**: Neon Database serverless driver for PostgreSQL
- **Production Storage**: PostgreSQL database with automatic seeding of demo data
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Seeding**: Automatic initialization with demo user and sample bills on first run

## Key Components

### Database Schema
- **Users**: User accounts with authentication credentials
- **Bills**: Bill records with company, amount, due date, and priority levels
- **Payments**: Payment transaction records linking to bills
- **Rewards**: Points-based reward system for user engagement

### Frontend Pages
- **Dashboard**: Overview of bills, financial summary, and quick actions
- **Payments**: Payment history and transaction management
- **Rewards**: Points tracking and reward redemption
- **Profile**: User account settings and preferences

### UI Components
- **Mobile-First Design**: Maximum width container (max-w-md) for mobile optimization
- **Bottom Navigation**: Fixed bottom navigation with 4 main sections
- **Card-Based Layout**: Clean card interfaces for bill items and summaries
- **Interactive Elements**: Loading states, toasts, and responsive feedback

## Data Flow

1. **Client Requests**: React components use TanStack Query for data fetching
2. **API Layer**: Express routes handle CRUD operations for bills, payments, and rewards
3. **Database Layer**: PostgreSQL database with Drizzle ORM for type-safe operations
4. **Auto-Seeding**: Database automatically initializes with demo data on first run
5. **Real-time Updates**: Automatic query invalidation keeps UI synchronized with data changes
6. **Error Handling**: Comprehensive error boundaries and user feedback through toast notifications

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Static typing throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing pipeline

### UI Enhancement
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation and formatting
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation for forms and API data

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds the React application to `dist/public`
- **Backend**: esbuild bundles the Express server to `dist/index.js`
- **Type Checking**: TypeScript compilation verification before deployment

### Environment Configuration
- **Development**: Hot module replacement with Vite dev server
- **Production**: Static file serving through Express with proper error handling
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Mobile Optimization
- **Responsive Design**: Mobile-first approach with max-width containers
- **Touch Interactions**: Optimized button sizes and touch targets
- **Progressive Enhancement**: Works offline and can be installed as PWA
- **Performance**: Lazy loading and optimized bundle splitting

The application follows modern web development best practices with a focus on type safety, user experience, and maintainable code architecture. The modular design allows for easy testing and future enhancements while maintaining a clean separation of concerns between the frontend and backend layers.

## Recent Changes

### Database Integration (July 28, 2025)
- **Migrated from in-memory storage to PostgreSQL database**
- **Added automatic database seeding with demo data**
- **Implemented DatabaseStorage class using Drizzle ORM**
- **All data now persists between application restarts**
- **Ready for production deployment with real user data**

### Firebase Integration Setup (July 28, 2025)
- **Created lib/firebaseConfig.js with complete Firebase setup**
- **Added Firebase SDK for authentication and Firestore**
- **Configured Google Auth Provider for future login features**
- **Environment variables ready for Firebase secrets**
- **Production-ready authentication infrastructure prepared**

### Firebase Authentication System (July 28, 2025)
- **Created services/auth.js with simplified Firebase Auth functions**
- **Built /signup page with basic email/password registration**
- **Built /login page with basic email/password authentication**
- **Created protected /dashboard route with user authentication check**
- **Implemented alert-based feedback for simple user experience**
- **Authentication system now fully functional with Firebase**

### Complete MVP Features (July 28, 2025)
- **Enhanced Dashboard with Firebase + PostgreSQL integration**
- **Working authentication flow: signup → login → dashboard**
- **Bill management with Firebase Firestore storage**
- **Interactive profile page with menu items**
- **Complete navigation system with bottom tabs**
- **Production-ready build system and deployment**
- **TypeScript errors resolved with proper imports**
- **ZIP export created for project distribution**