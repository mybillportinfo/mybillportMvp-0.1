# MyBillPort - Comprehensive Bill Management Platform

A modern, full-stack bill management application built with React, Node.js, Express, Firebase, and comprehensive AI integrations.

![MyBillPort](https://img.shields.io/badge/MyBillPort-v2.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)

## 🚀 Live Application

- **Production URL**: [www.mybillport.com](https://www.mybillport.com)
- **Replit Deployment**: [mybillport.replit.app](https://mybillport.replit.app)

## 📋 Project Overview

MyBillPort is a comprehensive financial management platform that leverages advanced AI and modern web technologies to provide intuitive, secure, and engaging personal finance experiences. The application features real-time bill tracking, AI-powered bill scanning, email notifications, and banking integrations.

## ✨ Key Features

### 🏠 Core Functionality
- **Real-time Bill Tracking**: Add, manage, and track bills with automatic sorting by due date
- **Dashboard Categorization**: Overdue bills, Due Soon (≤7 days), and All Others sections
- **Instant Bill Addition**: Bills appear immediately after adding with proper Firestore writes
- **Mobile-First Design**: Responsive interface optimized for all devices

### 🤖 AI-Powered Features
- **Bill Scanner**: Real Anthropic AI integration for extracting bill information from images
- **Smart Suggestions**: AI-powered bill reduction recommendations
- **Intelligent Categorization**: Automatic bill categorization and provider recognition

### 💌 Email & Communication
- **MailerSend Integration**: Professional email notifications for payment requests
- **Payment Request System**: Send payment requests via email with Interac e-Transfer instructions
- **Profile Notifications**: Email notifications for profile updates and security alerts

### 🏦 Banking Integration
- **Plaid API**: Secure bank account connectivity for balance checking
- **Account Management**: View multiple bank accounts, balances, and transaction history
- **Sandbox Testing**: Full Plaid sandbox environment for safe testing

### 🔐 Authentication & Security
- **Firebase Authentication**: Secure user registration and login
- **Protected Routes**: Authentication-required pages with proper redirects
- **Session Management**: Persistent user sessions with automatic logout

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **Vite** for fast development and builds

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout the stack
- **Firebase Firestore** for real-time data storage
- **PostgreSQL** with Drizzle ORM for additional data needs

### External Services
- **Firebase Authentication** for user management
- **Anthropic Claude 4.0** for AI bill scanning
- **MailerSend API** for email notifications
- **Plaid API** for banking integrations
- **Replit Deployments** for hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project configured
- MailerSend account with verified domain
- Plaid developer account (sandbox)
- PostgreSQL database (optional)

### Environment Variables
Create a `.env` file in the root directory:

```bash
# Database Configuration (Optional)
DATABASE_URL=your_postgresql_connection_string
PGHOST=localhost
PGPORT=5432
PGUSER=your_username  
PGPASSWORD=your_password
PGDATABASE=your_database

# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Email Configuration (Required for payment requests)
MAILERSEND_API_KEY=mlsnd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=verified_email@yourdomain.com
FROM_NAME=MyBillPort
TEST_EMAIL=your_test_email@example.com

# AI Configuration (Required for bill scanning)
ANTHROPIC_API_KEY=sk-ant-apiXXXXXXXXXXXXXXXXXXXXXX

# Plaid Configuration (Required for banking)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox
```

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/rsingh4545/mybillport.git
cd mybillport
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
   - Enable Authentication with Google sign-in
   - Create a Firestore database
   - Add your domain to Authorized domains
   - Copy configuration values to `.env`

4. **Set up MailerSend**
   - Create account at [mailersend.com](https://www.mailersend.com/)
   - Verify your sender domain
   - Generate API key and add to `.env`

5. **Configure Plaid (Optional)**
   - Sign up at [plaid.com/developers](https://plaid.com/developers)
   - Get sandbox credentials
   - Add to `.env` file

6. **Start the development server**
```bash
npm run dev
```

7. **Open the application**
   - Frontend: http://localhost:5000
   - API endpoints: http://localhost:5000/api/*

## 📁 Project Structure

```
mybillport/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── services/       # API service functions
├── server/                 # Express backend application
│   ├── routes/             # API route handlers
│   ├── db.ts               # Database configuration
│   ├── storage.ts          # Data storage interface
│   └── index.ts            # Server entry point
├── services/               # Shared service modules
│   ├── bills.ts            # Bill management functions
│   ├── email.ts            # Email service integration
│   └── auth.js             # Authentication helpers
├── shared/                 # Shared type definitions
│   └── schema.ts           # Database schema and types
├── lib/                    # Configuration files
│   └── firebaseConfig.js   # Firebase initialization
├── package.json            # Dependencies and scripts
├── .env.example            # Environment template
└── README.md               # Project documentation
```

## 🔧 API Endpoints

### Bill Management
- `GET /api/bills` - Get user bills
- `POST /api/bills` - Add new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill
- `POST /api/bills/scan` - AI bill scanning

### Email Services
- `POST /api/payment-request/send` - Send payment request email
- `POST /email-test` - Test email configuration
- `POST /api/notifications/profile-update` - Profile update notifications

### Banking Integration
- `POST /api/create_link_token` - Create Plaid Link token
- `POST /api/exchange_public_token` - Exchange public token
- `GET /api/accounts` - Get connected accounts

### Admin & Testing
- `GET /admin/config-report` - System configuration status

## 🧪 Testing Endpoints

You can test the API endpoints using curl:

```bash
# Test email configuration
curl -X POST http://localhost:5000/email-test

# Check system configuration
curl -X GET http://localhost:5000/admin/config-report

# Send payment request (requires authentication)
curl -X POST http://localhost:5000/api/payment-request/send \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail": "test@example.com", "amount": 25.50, "message": "Test payment"}'
```

## 🚀 Deployment

### Replit Deployment
1. Push code to your Replit project
2. Configure environment variables in Secrets
3. Click "Deploy" to create production deployment
4. Configure custom domain if desired

### Manual Deployment
1. Build the application: `npm run build`
2. Set up production environment variables
3. Deploy to your preferred hosting platform
4. Ensure PostgreSQL database is accessible
5. Configure DNS for custom domain

## 📊 Environment Configuration Status

The application includes built-in configuration checking:
- Visit `/admin/config-report` for complete environment status
- Check email functionality with `/email-test` endpoint
- Monitor console logs for service initialization

## 🔍 Troubleshooting

### Common Issues

1. **Email not sending**
   - Verify MAILERSEND_API_KEY is correct
   - Ensure sender domain is verified in MailerSend dashboard
   - Check FROM_EMAIL is using verified domain

2. **Bills not appearing**
   - Check Firebase configuration in browser console
   - Verify user authentication status
   - Check Firestore security rules

3. **AI scanning not working**
   - Verify ANTHROPIC_API_KEY is valid
   - Check API quota limits
   - Ensure image upload is successful

4. **Banking integration issues**
   - Verify Plaid credentials in sandbox
   - Check CORS configuration
   - Ensure webhook URLs are accessible

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Email: mybillportinfo@gmail.com
- GitHub Issues: [Create an issue](https://github.com/rsingh4545/mybillport/issues)
- Documentation: [Wiki](https://github.com/rsingh4545/mybillport/wiki)

## 🎯 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI financial insights
- [ ] Integration with more banking providers
- [ ] Cryptocurrency payment tracking
- [ ] Multi-language support
- [ ] Enhanced security features

---

**MyBillPort** - Simplifying personal finance management with modern technology.