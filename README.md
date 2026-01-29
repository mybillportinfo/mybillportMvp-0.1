# MyBillPort - Complete Bill Management Platform

MyBillPort is a comprehensive, mobile-first Progressive Web App (PWA) built with React and Express, designed to simplify bill management and payments with AI-powered features, secure banking integrations, and real-time notifications.

## 🌟 Features

### Core Functionality
- ✅ **Real-time Bill Management** - Add, track, categorize, and manage bills with instant updates
- ✅ **AI-Powered Bill Scanning** - Automatic data extraction using Anthropic Claude Sonnet 4
- ✅ **Secure Payment Processing** - Stripe integration with webhook support
- ✅ **Banking Integration** - Plaid SDK for secure account linking and transaction sync
- ✅ **Email Notifications** - MailerSend integration for reminders and payment requests
- ✅ **Progressive Web App** - Mobile-optimized with offline capabilities

### Technical Features
- ✅ **Firebase Authentication** - Secure user authentication with biometric options
- ✅ **PostgreSQL Database** - Reliable data persistence with Drizzle ORM
- ✅ **RESTful API** - Comprehensive backend with proper error handling
- ✅ **Modern UI/UX** - Tailwind CSS with Radix UI components
- ✅ **Real-time Updates** - Live bill status changes without page refresh

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Required API keys (see Environment Variables)

### Installation

```bash
# Clone the repository
git clone https://github.com/rsingh4545/mybillport.git
cd mybillport

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Environment Variables

### Required Variables

#### Firebase Configuration
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

#### Database
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

#### Payment Processing
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Banking Integration
```env
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

#### Email Services
```env
MAILERSEND_API_KEY=mlsn_...
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MyBillPort
TEST_EMAIL=your-test@email.com
```

#### Application
```env
PUBLIC_APP_URL=https://mybillport.com
NODE_ENV=production
```

## 🧪 Testing Endpoints

### Health & Configuration
- `GET /api/health` - Application health check
- `GET /admin/config-report` - Environment configuration audit
- `GET /admin/status` - System status and memory usage
- `GET /admin/env-check` - Environment variables check (safe)

### Email Testing
- `POST /api/email-test` - Send test email to TEST_EMAIL
- `POST /api/send-bill-reminder` - Test bill reminder email
- `POST /api/send-payment-request` - Test payment request email

### Firebase Testing
- `GET /api/firebase-test` - Test Firebase Admin SDK connection

### Payment Testing
- `POST /api/checkout` - Create Stripe checkout session
- `POST /stripe/webhook` - Stripe webhook handler (test with Stripe CLI)

### Banking Integration
- `POST /api/create_link_token` - Create Plaid Link token
- `POST /api/exchange_public_token` - Exchange public token for access token
- `GET /api/transactions/sync` - Sync and analyze transactions

## 💳 Stripe Integration

### Setting up Webhooks

1. **Create Webhook Endpoint**
   ```bash
   # In Stripe Dashboard > Developers > Webhooks
   Endpoint URL: https://mybillport.com/stripe/webhook
   Events: checkout.session.completed, payment_intent.succeeded
   ```

2. **Test with Stripe CLI**
   ```bash
   stripe listen --forward-to localhost:5000/stripe/webhook
   stripe trigger checkout.session.completed
   ```

3. **Test Payment Flow**
   ```bash
   # Create checkout session
   curl -X POST http://localhost:5000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"billId":"test-123","billName":"Test Bill","amount":"99.99","email":"test@example.com"}'
   
   # Use test card: 4242 4242 4242 4242
   ```

## 🏦 Plaid Integration

### Sandbox Testing

1. **Link Test Account**
   ```bash
   # Create link token
   curl -X POST http://localhost:5000/api/create_link_token
   
   # Use returned link_token in Plaid Link component
   # Select "First Platypus Bank" for testing
   ```

2. **Sync Transactions**
   ```bash
   curl http://localhost:5000/api/transactions/sync
   ```

### Common Test Credentials
- **Username**: `user_good`
- **Password**: `pass_good`
- **Institution**: First Platypus Bank (sandbox)

## 📧 Email Configuration

### MailerSend Setup

1. **Create MailerSend Account** → Dashboard → API Tokens
2. **Get Verified Domain** → Use trial domain for testing
3. **Test Email Service**
   ```bash
   curl -X POST http://localhost:5000/api/email-test
   ```

### Email Templates Available
- **Test Email** - Verify email service is working
- **Bill Reminders** - Automated due date notifications  
- **Payment Requests** - Interac e-Transfer style requests
- **Bill Added Confirmations** - New bill notifications

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/db

# Test connection
npm run db:push
```

**Firebase Auth Errors**
```bash
# Validate service account JSON
echo $FIREBASE_SERVICE_ACCOUNT_KEY | jq .

# Check admin config
curl http://localhost:5000/api/firebase-test
```

**Stripe Webhook Verification Failed**
```bash
# Ensure webhook secret is set
echo $STRIPE_WEBHOOK_SECRET

# Test with raw body parsing
curl -X POST http://localhost:5000/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'
```

**Plaid API Errors**
```bash
# Verify environment
echo $PLAID_ENV  # should be "sandbox"
echo $PLAID_CLIENT_ID
echo $PLAID_SECRET

# Check configuration
curl -X POST http://localhost:5000/api/create_link_token
```

### Development Tips

- Use `npm run config:audit` to check all environment variables
- Enable verbose logging with `DEBUG=* npm run dev`
- Test webhooks locally with ngrok: `ngrok http 5000`
- Use Stripe CLI for webhook testing: `stripe listen --forward-to localhost:5000/stripe/webhook`

## 📱 Mobile PWA Features

- **Offline Support** - Service worker for cached bill data
- **Add to Home Screen** - Native app-like experience  
- **Push Notifications** - Bill due date reminders
- **Biometric Login** - Face ID / Fingerprint support
- **Mobile-First Design** - Optimized for touch interaction

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Wouter** for routing  
- **TanStack Query** for server state
- **Radix UI + shadcn/ui** design system
- **Tailwind CSS** for styling
- **Vite** build system

### Backend Stack
- **Node.js + Express** API server
- **Drizzle ORM** with PostgreSQL
- **Firebase Admin** for authentication
- **Stripe** for payments
- **Plaid** for banking data
- **MailerSend** for notifications

## 🚢 Deployment

### Standard Node.js Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Custom Domain Setup

1. **Configure your hosting provider** (Vercel, Railway, Render, etc.)

2. **Set all required environment variables** in your hosting dashboard

3. **Update PUBLIC_APP_URL**
   ```env
   PUBLIC_APP_URL=https://yourdomain.com
   ```

## 📦 GitHub Migration Notes

After downloading from Replit, remove these files/dependencies:

### Files to Delete
- `.replit`
- `replit.nix`
- `replit.md`

### Update vite.config.ts
Remove Replit-specific plugins:
```typescript
// Remove these imports and usages:
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// and the cartographer plugin conditional
```

### Update package.json devDependencies
Remove:
```json
"@replit/vite-plugin-cartographer": "...",
"@replit/vite-plugin-runtime-error-modal": "..."
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See this README and inline code comments
- **Issues**: GitHub Issues tracker  
- **Email**: Contact through the application

---

Built with ❤️ using modern web technologies for reliable, secure bill management.