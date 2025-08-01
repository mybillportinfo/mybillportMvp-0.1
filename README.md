# MyBillPort - Plaid Banking Integration

A full-stack bill management application with integrated Plaid banking connectivity for automated financial tracking and bill payments.

## 🚀 Features

### Core Banking Integration
- **Plaid Link Integration**: Secure bank account connectivity using Plaid's API
- **Real-time Account Balances**: Live sync of checking, savings, and credit card balances
- **Sandbox Testing**: Full Plaid Sandbox environment for development and testing
- **Multiple Account Support**: Connect and manage multiple bank accounts

### Bill Management
- **Automated Bill Tracking**: Smart bill detection and categorization
- **Payment Scheduling**: Set up automatic bill payments from connected accounts
- **Due Date Reminders**: Intelligent notifications for upcoming bill payments
- **Payment History**: Complete transaction history and payment tracking

### Advanced Features
- **AI-Powered Insights**: Smart spending analysis and bill reduction suggestions
- **Mobile-First Design**: Responsive PWA optimized for mobile devices
- **Canadian Banking Support**: Full support for Canadian banks and Interac transfers
- **Security First**: Bank-level encryption and read-only account access

## 🛠 Tech Stack

### Backend
- **Node.js + Express**: RESTful API server with TypeScript
- **Plaid SDK**: Official Plaid Node.js library for banking integration
- **PostgreSQL**: Secure data persistence with Drizzle ORM
- **CORS Enabled**: Cross-origin resource sharing for frontend integration

### Frontend
- **React + TypeScript**: Modern React application with full type safety
- **React Plaid Link**: Official Plaid React component for secure authentication
- **Tailwind CSS**: Modern, responsive UI with shadcn/ui components
- **TanStack Query**: Advanced data fetching and state management

## 📦 Installation & Setup

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd mybillport
npm install
```

### 2. Environment Configuration
Copy the example environment file and add your Plaid credentials:
```bash
cp .env.example .env
```

Add your Plaid API credentials to `.env`:
```env
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id_here
PLAID_SECRET=your_plaid_secret_here
PLAID_ENV=sandbox

# Database Configuration (if using PostgreSQL)
DATABASE_URL=your_database_url_here
```

### 3. Get Plaid API Keys
1. Sign up for a [Plaid Developer Account](https://dashboard.plaid.com/signup)
2. Create a new application in the Plaid Dashboard
3. Copy your `client_id` and `sandbox` secret key
4. Add them to your `.env` file

### 4. Start the Application
```bash
npm run dev
```

The application will start on `http://localhost:5000`

## 🔧 API Endpoints

### Plaid Integration Endpoints

#### Create Link Token
```
POST /api/create_link_token
```
Generates a Plaid Link token for initializing the bank connection flow.

**Response:**
```json
{
  "link_token": "link-sandbox-xxxxxxxx"
}
```

#### Exchange Public Token
```
POST /api/exchange_public_token
```
Exchanges a public token from Plaid Link for a permanent access token.

**Request Body:**
```json
{
  "public_token": "public-sandbox-xxxxxxxx"
}
```

**Response:**
```json
{
  "access_token": "access-sandbox-xxxxxxxx",
  "item_id": "item-xxxxxxxx",
  "message": "Bank account connected successfully"
}
```

#### Get Account Information
```
GET /api/accounts
```
Fetches connected bank accounts and their current balances.

**Response:**
```json
{
  "accounts": [
    {
      "account_id": "account-xxxxxxxx",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "type": "depository",
      "subtype": "checking",
      "balance": {
        "available": 100.00,
        "current": 110.00,
        "currency": "USD"
      }
    }
  ],
  "institution": "ins_109508"
}
```

## 🎯 Usage

### Connecting a Bank Account

1. **Navigate to Integration**: Visit `/plaid` to access the banking integration page
2. **Initialize Connection**: Click "Connect Your Bank" to start the Plaid Link flow
3. **Select Institution**: Choose your bank from the list of supported institutions
4. **Authenticate**: Enter your banking credentials (sandbox test credentials for demo)
5. **Account Selection**: Choose which accounts to connect
6. **View Balances**: Your account balances will be displayed immediately

### Sandbox Test Credentials

For testing in Plaid's Sandbox environment, use these credentials:

**Username:** `user_good`  
**Password:** `pass_good`

These will connect to sample accounts with test data for development purposes.

### Production Deployment

To switch to production:

1. **Get Production Keys**: Apply for production access in the Plaid Dashboard
2. **Update Environment**: Change `PLAID_ENV=production` in your `.env` file
3. **Add Production Keys**: Replace sandbox keys with production keys
4. **Deploy Securely**: Ensure all secrets are properly secured in production

## 🔒 Security

- **No Credential Storage**: User banking credentials are never stored on our servers
- **Read-Only Access**: Application only requests read access to account balances
- **Encrypted Communication**: All data transmission uses bank-level 256-bit encryption
- **Token Security**: Access tokens are stored securely and can be revoked at any time

## 🏗 Project Structure

```
mybillport/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   └── plaid-integration.tsx  # Main Plaid integration page
│   │   └── components/                # Reusable UI components
├── server/                 # Express backend server
│   ├── index.ts           # Main server entry point
│   ├── routes.ts          # API routes including Plaid endpoints
│   └── plaid.ts           # Plaid client configuration
├── .env.example           # Environment configuration template
└── README.md              # This file
```

## 🚀 Deployment

### Replit Deployment (Recommended)
This application is optimized for deployment on Replit:

1. **Import Project**: Import this repository into a new Replit
2. **Add Secrets**: Configure environment variables in Replit's Secrets tab
3. **Deploy**: Use Replit's one-click deployment for instant production hosting

### Manual Deployment
For deployment on other platforms:

1. **Build Application**: `npm run build`
2. **Set Environment Variables**: Configure all required environment variables
3. **Start Production Server**: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Check the [Plaid Documentation](https://plaid.com/docs/)
- Review the [API Reference](https://plaid.com/docs/api/)
- Open an issue in this repository

---

**Note**: This application uses Plaid's Sandbox environment by default. Remember to switch to production keys when deploying to production.