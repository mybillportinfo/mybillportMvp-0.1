import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, initializeStorage } from "./storage";
import { getFirebaseAdmin, initializeFirebaseAdmin } from "./firebase-admin";
import { seedDatabase } from "./seed";
import { insertBillSchema, insertPaymentSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";
import { plaidClient } from "./plaid";
import { scanBillImage } from './ai-scanner';
import { getAuthUrl, handleCallback, getConnectionStatus, disconnectGmail, scanEmailsForBillsOAuth, validateState } from './gmail-oauth';
import { sendPaymentRequestEmail, sendWelcomeEmail } from '../services/email';
import nodemailer from 'nodemailer';
import Stripe from "stripe";
import express from "express";
import path from "path";
import { 
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
  TransactionsGetRequest,
  CountryCode,
  Products
} from 'plaid';

// Store access tokens in memory for demo purposes
// In production, store these securely in your database
const accessTokens = new Map<string, string>();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Stripe functionality will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
}) : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage (auto-detects database vs memory fallback)
  await initializeStorage();
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      version: "1.0.0",
      env: process.env.NODE_ENV || "development"
    });
  });

  // Send welcome email to new users
  app.post("/api/auth/welcome-email", async (req, res) => {
    try {
      const { email, displayName } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await sendWelcomeEmail(email, displayName);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: "Welcome email sent successfully",
          messageId: result.messageId
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error || "Failed to send welcome email"
        });
      }
    } catch (error: any) {
      console.error("Welcome email endpoint error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Internal server error"
      });
    }
  });

  // Configuration audit endpoint  
  app.get("/admin/config-report", async (req, res) => {
    try {
      // Configuration audit
      const auditResult = {
        firebase: {
          VITE_FIREBASE_API_KEY: !!process.env.VITE_FIREBASE_API_KEY,
          VITE_FIREBASE_PROJECT_ID: !!process.env.VITE_FIREBASE_PROJECT_ID,
          VITE_FIREBASE_APP_ID: !!process.env.VITE_FIREBASE_APP_ID,
          FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        },
        plaid: {
          PLAID_CLIENT_ID: !!process.env.PLAID_CLIENT_ID,
          PLAID_SECRET: !!process.env.PLAID_SECRET,
          PLAID_ENV: !!process.env.PLAID_ENV
        },
        stripe: {
          STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
          STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET
        },
        email: {
          MAILERSEND_API_KEY: !!process.env.MAILERSEND_API_KEY,
          FROM_EMAIL: !!process.env.FROM_EMAIL,
          FROM_NAME: !!process.env.FROM_NAME,
          TEST_EMAIL: !!process.env.TEST_EMAIL
        },
        app: {
          PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || "https://mybillport.com"
        }
      };
      
      res.json({
        timestamp: new Date().toISOString(),
        status: 'success',
        ...auditResult
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to run configuration audit",
        message: error.message || "Unknown error occurred"
      });
    }
  });

  // Firebase test endpoint
  app.get("/api/firebase-test", async (req, res) => {
    try {
      const { db } = getFirebaseAdmin();
      
      // Test write
      const testDoc = {
        message: "Hello from MyBillPort!",
        timestamp: new Date().toISOString(),
        testId: Math.random().toString(36).substr(2, 9)
      };
      
      const docRef = db.collection('diagnostics').doc('hello');
      await docRef.set(testDoc);
      
      // Test read
      const docSnap = await docRef.get();
      const readData = docSnap.data();
      
      res.json({
        success: true,
        message: "Firebase Admin SDK test successful",
        writeData: testDoc,
        readData: readData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Firebase test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Unknown error occurred",
        message: "Firebase Admin SDK test failed"
      });
    }
  });
  // Import and register testing routes
  const { registerEmailTestRoutes } = await import('./routes/email-test');
  const { registerAdminRoutes } = await import('./routes/admin-config');
  
  // Register testing and admin routes
  registerEmailTestRoutes(app);
  registerAdminRoutes(app);

  // Demo user ID - will be set dynamically on seed or retrieved from existing data
  let DEMO_USER_ID: string = "";
  
  // Try to load existing demo user on startup
  (async () => {
    try {
      const existingUser = await storage.getUserByUsername("johndoe");
      if (existingUser) {
        DEMO_USER_ID = existingUser.id;
        console.log("✅ Loaded existing demo user:", DEMO_USER_ID);
      }
    } catch (error) {
      console.log("No existing demo user found, use /api/seed to create one");
    }
  })();
  
  // Optional seeding endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      const userId = await seedDatabase();
      if (userId) {
        DEMO_USER_ID = userId;
        res.json({ success: true, message: "Database seeded successfully", userId });
      } else {
        // User exists, retrieve their ID
        const existingUser = await storage.getUserByUsername("johndoe");
        if (existingUser) {
          DEMO_USER_ID = existingUser.id;
          res.json({ success: true, message: "Database already seeded", userId: existingUser.id });
        } else {
          res.json({ success: true, message: "Database already seeded" });
        }
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user bills
  app.get("/api/bills", async (req, res) => {
    try {
      const bills = await storage.getBillsByUserId(DEMO_USER_ID);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  // Create new bill
  app.post("/api/bills", async (req, res) => {
    try {
      // Convert date string to Date object if needed
      const requestData = {
        ...req.body,
        userId: DEMO_USER_ID,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      };
      
      const billData = insertBillSchema.parse(requestData);
      const bill = await storage.createBill(billData);
      res.json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bill data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });

  // Delete a bill
  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.getBill(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const deleted = await storage.deleteBill(id);
      
      if (deleted) {
        res.json({ success: true, message: "Bill deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete bill" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  // Request Money API endpoint
  app.post("/api/request-money", async (req, res) => {
    try {
      const { to, name, amount, note, fromUser } = req.body;

      if (!to || !name || !amount || !note) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: to, name, amount, note" 
        });
      }

      const result = await sendPaymentRequestEmail({
        to,
        amount: parseFloat(amount),
        note,
        fromUser: name
      });

      if (result.success) {
        res.json({
          success: true,
          message: `Payment request sent successfully to ${name} at ${to}`,
          details: {
            recipient: to,
            amount: parseFloat(amount),
            note
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || "Failed to send payment request email"
        });
      }
    } catch (error: any) {
      console.error('Request money error:', error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error"
      });
    }
  });

  // Pay a bill
  app.post("/api/bills/:id/pay", async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.getBill(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Create payment record
      const payment = await storage.createPayment({
        billId: id,
        userId: DEMO_USER_ID,
        amount: bill.amount,
        status: "completed"
      });

      // Mark bill as paid
      await storage.updateBill(id, { isPaid: 1 });

      // Award points for payment
      await storage.createReward({
        userId: DEMO_USER_ID,
        points: Math.floor(parseFloat(bill.amount) / 10), // 1 point per $10
        title: "Payment Reward",
        description: `Earned for paying ${bill.name}`,
        isRedeemed: 0
      });

      res.json({ payment, message: "Payment processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Get user payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByUserId(DEMO_USER_ID);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Get user rewards
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewardsByUserId(DEMO_USER_ID);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  // Redeem reward
  app.post("/api/rewards/:id/redeem", async (req, res) => {
    try {
      const { id } = req.params;
      const reward = await storage.updateReward(id, { isRedeemed: 1 });
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }

      res.json({ reward, message: "Reward redeemed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // AI Bill Scanner endpoint - Extracts account and company info from bills
  app.post("/api/bills/scan", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }
      
      // Check if Anthropic API key is available
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.length < 10) {
        // Return sample data if no valid API key
        const sampleResult = {
          company: "Sample Utility Co",
          amount: 125.50,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          accountNumber: "****-****-1234",
          category: "Electricity",
          type: "utility",
          confidence: 85,
          extractedText: "Sample bill data - Anthropic API key needed for real scanning"
        };
        
        return res.json(sampleResult);
      }
      
      // Remove data:image/jpeg;base64, prefix if present
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      console.log('Processing bill image with AI scanner...');
      const scanResult = await scanBillImage(base64Image);
      console.log('AI scan result:', scanResult);
      
      res.json(scanResult);
    } catch (error) {
      console.error('Bill scanning error:', error);
      
      // Fallback to sample data on error
      const fallbackResult = {
        company: "Utility Company",
        amount: 99.99,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        accountNumber: "****-****-5678",
        category: "Utility",
        type: "utility",
        confidence: 75,
        extractedText: "Fallback data - AI scanning temporarily unavailable"
      };
      
      res.json(fallbackResult);
    }
  });

  // Create account from scanned bill
  app.post("/api/accounts/from-bill", async (req, res) => {
    try {
      const { company, accountNumber, category, type } = req.body;
      
      if (!company || !accountNumber) {
        return res.status(400).json({ error: 'Company and account number are required' });
      }
      
      // Create a new account record (in a real app, this would go to accounts table)
      const account = {
        id: Date.now().toString(),
        company,
        accountNumber,
        category,
        type,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      console.log('Created account from bill scan:', account);
      
      res.json({ 
        success: true, 
        account,
        message: `Account for ${company} has been added to your profile` 
      });
    } catch (error) {
      console.error('Account creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create account',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ========== PLAID INTEGRATION ENDPOINTS ==========

  // Create Plaid Link Token
  app.post("/api/create_link_token", async (req, res) => {
    try {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: DEMO_USER_ID.toString(),
        },
        client_name: "MyBillPort",
        products: ['transactions' as any],
        country_codes: ['CA' as any],
        language: 'en',
      };

      const response = await plaidClient.linkTokenCreate(request);
      res.json({ link_token: response.data.link_token });
    } catch (error) {
      console.error('Plaid Link Token Error:', error);
      res.status(500).json({ 
        error: "Unable to create link token",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Exchange public token for access token
  app.post("/api/exchange_public_token", async (req, res) => {
    try {
      const { public_token } = req.body;
      
      if (!public_token) {
        return res.status(400).json({ error: "public_token is required" });
      }

      const request: ItemPublicTokenExchangeRequest = {
        public_token: public_token,
      };

      const response = await plaidClient.itemPublicTokenExchange(request);
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Store access token (in production, store in database)
      accessTokens.set(DEMO_USER_ID.toString(), accessToken);

      res.json({ 
        access_token: accessToken,
        item_id: itemId,
        message: "Bank account connected successfully"
      });
    } catch (error) {
      console.error('Plaid Token Exchange Error:', error);
      res.status(500).json({ 
        error: "Unable to exchange public token",
        details: error instanceof Error ? error.message : "Unknown error",
        debug: process.env.NODE_ENV === 'development' ? { 
          public_token: req.body.public_token,
          plaid_env: process.env.PLAID_ENV 
        } : undefined
      });
    }
  });

  // Get account information and balances
  app.get("/api/accounts", async (req, res) => {
    try {
      const accessToken = accessTokens.get(DEMO_USER_ID.toString());
      
      if (!accessToken) {
        return res.status(400).json({ 
          error: "No bank account connected. Please connect your bank account first." 
        });
      }

      const request: AccountsGetRequest = {
        access_token: accessToken,
      };

      const response = await plaidClient.accountsGet(request);
      const accounts = response.data.accounts.map(account => ({
        account_id: account.account_id,
        name: account.name,
        official_name: account.official_name,
        type: account.type,
        subtype: account.subtype,
        balance: {
          available: account.balances.available,
          current: account.balances.current,
          currency: account.balances.iso_currency_code
        }
      }));

      res.json({ 
        accounts: accounts,
        institution: response.data.item.institution_id
      });
    } catch (error) {
      console.error('Plaid Accounts Error:', error);
      res.status(500).json({ 
        error: "Unable to fetch accounts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get transactions from connected bank account
  app.get("/api/transactions", async (req, res) => {
    try {
      const accessToken = accessTokens.get(DEMO_USER_ID.toString());
      
      if (!accessToken) {
        return res.status(400).json({ 
          error: "No bank account connected. Please connect your bank account first." 
        });
      }

      // Get transactions from the last 90 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
          offset: 0
        }
      };

      const response = await plaidClient.transactionsGet(request);
      const transactions = response.data.transactions.map(txn => ({
        transaction_id: txn.transaction_id,
        account_id: txn.account_id,
        name: txn.name,
        merchant_name: txn.merchant_name,
        amount: txn.amount,
        date: txn.date,
        category: txn.category,
        pending: txn.pending,
        payment_channel: txn.payment_channel
      }));

      res.json({ 
        transactions,
        total_transactions: response.data.total_transactions,
        start_date: startDate,
        end_date: endDate
      });
    } catch (error) {
      console.error('Plaid Transactions Error:', error);
      res.status(500).json({ 
        error: "Unable to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Detect recurring bills from transactions
  app.get("/api/recurring-bills", async (req, res) => {
    try {
      const accessToken = accessTokens.get(DEMO_USER_ID.toString());
      
      if (!accessToken) {
        return res.status(400).json({ 
          error: "No bank account connected. Please connect your bank account first." 
        });
      }

      // Get transactions from the last 90 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
          offset: 0
        }
      };

      const response = await plaidClient.transactionsGet(request);
      const transactions = response.data.transactions;

      // Analyze transactions to find recurring patterns
      const merchantCounts = new Map<string, { 
        count: number; 
        amounts: number[]; 
        dates: string[];
        category: string[] | null;
        name: string;
      }>();

      transactions.forEach(txn => {
        // Only look at debit transactions (positive amounts in Plaid = money out)
        if (txn.amount <= 0) return;
        
        const key = txn.merchant_name || txn.name;
        if (!key) return;

        const existing = merchantCounts.get(key);
        if (existing) {
          existing.count++;
          existing.amounts.push(txn.amount);
          existing.dates.push(txn.date);
        } else {
          merchantCounts.set(key, {
            count: 1,
            amounts: [txn.amount],
            dates: [txn.date],
            category: txn.category || null,
            name: key
          });
        }
      });

      // Filter for merchants with 2+ transactions (potentially recurring)
      const recurringBills: Array<{
        merchant: string;
        category: string;
        averageAmount: number;
        frequency: string;
        occurrences: number;
        lastDate: string;
        confidence: number;
      }> = [];

      merchantCounts.forEach((data, merchant) => {
        if (data.count >= 2) {
          const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
          
          // Determine frequency based on dates
          const sortedDates = data.dates.sort();
          let frequency = 'monthly';
          let confidence = 50;

          if (data.count >= 3) {
            const daysBetween: number[] = [];
            for (let i = 1; i < sortedDates.length; i++) {
              const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i-1]).getTime()) / (1000 * 60 * 60 * 24);
              daysBetween.push(diff);
            }
            const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
            
            if (avgDays <= 10) {
              frequency = 'weekly';
              confidence = 70;
            } else if (avgDays <= 20) {
              frequency = 'bi-weekly';
              confidence = 75;
            } else if (avgDays <= 35) {
              frequency = 'monthly';
              confidence = 85;
            } else if (avgDays <= 100) {
              frequency = 'quarterly';
              confidence = 60;
            } else {
              frequency = 'annual';
              confidence = 40;
            }

            // Higher confidence for more occurrences
            confidence = Math.min(95, confidence + (data.count - 2) * 5);
          }

          // Categorize the bill type
          let category = 'Other';
          if (data.category) {
            const cats = data.category.map(c => c.toLowerCase());
            if (cats.some(c => c.includes('utilities'))) category = 'Utilities';
            else if (cats.some(c => c.includes('subscription') || c.includes('streaming'))) category = 'Subscription';
            else if (cats.some(c => c.includes('insurance'))) category = 'Insurance';
            else if (cats.some(c => c.includes('phone') || c.includes('telecom'))) category = 'Phone';
            else if (cats.some(c => c.includes('internet'))) category = 'Internet';
            else if (cats.some(c => c.includes('gym') || c.includes('fitness'))) category = 'Fitness';
            else if (cats.some(c => c.includes('rent') || c.includes('mortgage'))) category = 'Housing';
            else category = data.category[0] || 'Other';
          }

          // Use merchant name for better categorization
          const lowerMerchant = merchant.toLowerCase();
          if (lowerMerchant.includes('netflix') || lowerMerchant.includes('spotify') || 
              lowerMerchant.includes('disney') || lowerMerchant.includes('hulu') ||
              lowerMerchant.includes('amazon prime') || lowerMerchant.includes('apple')) {
            category = 'Subscription';
          } else if (lowerMerchant.includes('hydro') || lowerMerchant.includes('electric') ||
                     lowerMerchant.includes('gas') || lowerMerchant.includes('water')) {
            category = 'Utilities';
          } else if (lowerMerchant.includes('rogers') || lowerMerchant.includes('bell') ||
                     lowerMerchant.includes('telus') || lowerMerchant.includes('fido')) {
            category = 'Phone';
          }

          recurringBills.push({
            merchant,
            category,
            averageAmount: Math.round(avgAmount * 100) / 100,
            frequency,
            occurrences: data.count,
            lastDate: sortedDates[sortedDates.length - 1],
            confidence
          });
        }
      });

      // Sort by confidence and amount
      recurringBills.sort((a, b) => b.confidence - a.confidence || b.averageAmount - a.averageAmount);

      res.json({
        recurring_bills: recurringBills,
        analysis_period: { start_date: startDate, end_date: endDate },
        total_transactions_analyzed: transactions.length
      });
    } catch (error) {
      console.error('Recurring Bills Detection Error:', error);
      res.status(500).json({ 
        error: "Unable to detect recurring bills",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Payment request endpoint using MailerSend
  app.post("/api/payment-request/send", async (req, res) => {
    try {
      const { recipientEmail, amount, message } = req.body;

      // Validate input
      if (!recipientEmail || !amount || !message) {
        return res.status(400).json({ error: "Missing required fields: email, amount, and message are required" });
      }

      // Simplified email template
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">💰 Payment Request</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Payment Request</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount:</strong> $${amount.toFixed(2)} CAD</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
            
            <p style="color: #666;">Please send payment via Interac e-Transfer to: <strong>mybillportinfo@gmail.com</strong></p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>Instructions:</strong></p>
              <ol style="color: #1976d2; margin: 10px 0;">
                <li>Log into your online banking</li>
                <li>Send Interac e-Transfer</li>
                <li>To: mybillportinfo@gmail.com</li>
                <li>Amount: $${amount.toFixed(2)} CAD</li>
                <li>Security Question: What is this payment for?</li>
                <li>Answer: billboard</li>
              </ol>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">MyBillPort Payment Request</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For support, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `;

      // Import email service
      const emailService = await import('../services/email');

      // Send email using MailerSend
      const result = await emailService.sendPaymentRequestEmail({
        to: recipientEmail,
        amount: parseFloat(amount),
        fromUser: "MyBillPort",
        note: message
      });

      if (!result.success) {
        return res.status(500).json({ 
          error: "Failed to send payment request email",
          details: result.error
        });
      }

      res.json({ 
        success: true, 
        message: `Payment request sent to ${recipientEmail}`,
        details: {
          amount: amount,
          recipient: recipientEmail,
          message: message
        }
      });

    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ 
        error: "Failed to send payment request email",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Profile update notification endpoint
  app.post("/api/notifications/profile-update", async (req, res) => {
    try {
      const { email, phoneNumber, displayName, changes } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.FROM_EMAIL || 'noreply@example.com',
          pass: process.env.SMTP_PASSWORD || 'CONFIGURE_SMTP_PASSWORD'
        }
      });

      // Email notification
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">✅ Profile Updated</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort Account Changes</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Account Information Updated</h2>
            
            <p style="color: #666;">Hi ${displayName || 'there'},</p>
            <p style="color: #666;">Your MyBillPort profile has been successfully updated with the following information:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${changes.name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${changes.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${changes.phone || 'Not provided'}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>🔒 Security Notice:</strong> If you didn't make these changes, please contact us immediately at mybillportinfo@gmail.com</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">MyBillPort - Your Personal Finance Assistant</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For any questions, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: 'MyBillPort <mybillportinfo@gmail.com>',
        to: email,
        subject: '✅ MyBillPort Profile Updated - Confirmation',
        html: emailContent
      };

      await transporter.sendMail(mailOptions);

      // SMS notification (simulated - in production, use Twilio or similar service)
      if (phoneNumber && phoneNumber.length > 0) {
        console.log(`SMS notification sent to ${phoneNumber}:`);
        console.log(`"MyBillPort: Your profile has been updated successfully. Changes: Name: ${changes.name}, Email: ${changes.email}, Phone: ${changes.phone}. If this wasn't you, contact mybillportinfo@gmail.com immediately."`);
      }

      res.json({ 
        success: true, 
        message: "Profile update notifications sent",
        sentTo: {
          email: email,
          sms: phoneNumber ? phoneNumber : null
        }
      });

    } catch (error) {
      console.error('Profile notification error:', error);
      res.status(500).json({ 
        error: "Failed to send profile update notifications",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Email test endpoint
  app.post("/email-test", async (req, res) => {
    try {
      if (!process.env.TEST_EMAIL) {
        return res.status(400).json({ 
          error: "TEST_EMAIL environment variable not set" 
        });
      }

      // Import email service
      const { sendPaymentRequestEmail } = await import('../services/email');

      // Send test email
      const result = await sendPaymentRequestEmail({
        to: process.env.TEST_EMAIL,
        amount: 25.00,
        note: "This is a test email from MyBillPort email service",
        fromUser: "Test User"
      });

      if (result.success) {
        res.json({ 
          success: true,
          message: `Test email sent successfully to ${process.env.TEST_EMAIL}`,
          statusCode: 200
        });
      } else {
        res.status(500).json({ 
          error: "Email test failed",
          details: result.error,
          statusCode: 500
        });
      }

    } catch (error) {
      console.error('Email test error:', error);
      res.status(500).json({ 
        error: "Email test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      });
    }
  });

  // ========== BILL REMINDERS ENDPOINTS ==========
  
  app.post("/api/reminders/process", async (req, res) => {
    try {
      const { processReminders } = await import('./reminder-service');
      const results = await processReminders();
      res.json({ 
        success: true, 
        message: `Processed ${results.length} reminders`,
        results 
      });
    } catch (error) {
      console.error('Reminder processing error:', error);
      res.status(500).json({ 
        error: "Failed to process reminders",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/reminders/test", async (req, res) => {
    try {
      const { email, billId, reminderType } = req.body;
      
      if (!email || !billId) {
        return res.status(400).json({ error: "Email and billId required" });
      }

      const { sendTestReminder } = await import('./reminder-service');
      const result = await sendTestReminder(email, billId, reminderType || '2-days');
      
      res.json({ success: result.success, result });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to send test reminder",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ========== STRIPE PAYMENT PROCESSING ENDPOINTS ==========
  
  // Stripe webhook endpoint - MUST be before JSON body parsing
  app.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    if (!stripe || !endpointSecret) {
      return res.status(400).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment successful:', paymentIntent.id);
        
        try {
          const intentBillId = paymentIntent.metadata?.billId;
          // Log the payment record
          if (intentBillId) {
            const paymentRecord = {
              billId: intentBillId,
              userId: "demo-user-1", // You can get this from bill lookup
              amount: (paymentIntent.amount / 100).toString(), // Convert from cents
              status: "completed" as const
            };
            
            await storage.createPayment(paymentRecord);
            console.log(`💰 Payment record created for intent ${paymentIntent.id}`);
          }

          // Mark the bill as paid
          if (intentBillId) {
            const updatedBill = await storage.updateBillStatus(intentBillId, 'paid');
            if (updatedBill) {
              console.log(`✅ Bill ${intentBillId} marked as paid (payment intent ${paymentIntent.id})`);
            } else {
              console.log(`⚠️ Bill ${intentBillId} not found`);
            }
          }
        } catch (error) {
          console.error('Failed to process payment intent:', error);
        }
        break;
      
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        try {
          const sessionBillId = session.metadata?.billId;
          // Log the payment record
          if (sessionBillId && session.amount_total) {
            const paymentRecord = {
              billId: sessionBillId,
              userId: "demo-user-1", // You can get this from session or bill lookup
              amount: (session.amount_total / 100).toString(), // Convert from cents
              status: "completed" as const
            };
            
            await storage.createPayment(paymentRecord);
            console.log(`💰 Payment record created for session ${session.id}`);
          }

          // Mark the bill as paid
          if (sessionBillId) {
            const updatedBill = await storage.updateBillStatus(sessionBillId, 'paid');
            if (updatedBill) {
              console.log(`✅ Bill ${sessionBillId} marked as paid (checkout session ${session.id})`);
            } else {
              console.log(`⚠️ Bill ${sessionBillId} not found`);
            }
          }
        } catch (error) {
          console.error('Failed to process checkout session:', error);
        }
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Payment failed:', failedPayment.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  });

  // Create payment intent for bill payment
  // Stripe Checkout Session - Alternative payment method
  app.post("/api/checkout", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    try {
      const { billId, billName, amount, email } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email || undefined,
        line_items: [{
          price_data: {
            currency: "cad", // Canadian dollars for MyBillPort
            product_data: { name: billName || "Bill Payment" },
            unit_amount: Math.round(Number(amount) * 100), // Convert to cents
          },
          quantity: 1,
        }],
        success_url: `${req.headers.origin || 'https://mybillport.com'}/dashboard?payment=success`,
        cancel_url: `${req.headers.origin || 'https://mybillport.com'}/dashboard?payment=cancelled`,
        metadata: { billId: billId || '' } // Important for webhook handling
      });

      res.json({ 
        id: session.id, 
        url: session.url 
      });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        message: error.message 
      });
    }
  });

  // Payment Intent approach (existing)
  app.post('/api/create-payment-intent', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    try {
      const { amount, billId, description } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'cad', // Canadian dollars
        description: description || 'Bill payment',
        metadata: {
          billId: billId || '',
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        message: error.message 
      });
    }
  });

  // Get payment status
  app.get('/api/payment-status/:paymentIntentId', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
      });
    } catch (error: any) {
      console.error('Error retrieving payment status:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve payment status',
        message: error.message 
      });
    }
  });

  // Plaid Transactions Sync endpoint
  app.get("/api/transactions/sync", async (req, res) => {
    try {
      // For demo purposes, return mock transaction data
      // In production, use stored access_token to fetch real transactions
      
      const mockTransactions = [
        {
          id: "txn_1",
          date: new Date().toISOString().split('T')[0],
          description: "Hydro Quebec",
          amount: -89.50,
          category: "utilities",
          suggested_bill: {
            name: "Electricity Bill",
            company: "Hydro Quebec",
            amount: 89.50,
            frequency: "monthly"
          }
        },
        {
          id: "txn_2", 
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: "Bell Canada",
          amount: -75.99,
          category: "telecom",
          suggested_bill: {
            name: "Phone Bill",
            company: "Bell Canada", 
            amount: 75.99,
            frequency: "monthly"
          }
        }
      ];

      res.json({
        success: true,
        transactions: mockTransactions,
        suggested_bills: mockTransactions.map(t => t.suggested_bill),
        message: "Transactions synced successfully"
      });

    } catch (error: any) {
      console.error('Transaction sync failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sync transactions'
      });
    }
  });

  // Gmail OAuth routes
  app.get("/api/gmail/status", async (req, res) => {
    try {
      const status = await getConnectionStatus();
      res.json(status);
    } catch (error: any) {
      res.json({ connected: false });
    }
  });

  app.get("/api/gmail/connect", async (req, res) => {
    try {
      const { authUrl } = getAuthUrl();
      res.json({ authUrl });
    } catch (error: any) {
      console.error('Gmail connect error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate auth URL',
        needsCredentials: error.message?.includes('not configured')
      });
    }
  });

  app.get("/api/gmail/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      
      if (!code) {
        return res.redirect('/email-bills?error=no_code');
      }
      
      if (!validateState(state)) {
        return res.redirect('/email-bills?error=invalid_state');
      }

      const result = await handleCallback(code);
      res.redirect(`/email-bills?connected=true&email=${encodeURIComponent(result.email)}`);
    } catch (error: any) {
      console.error('Gmail callback error:', error);
      res.redirect(`/email-bills?error=${encodeURIComponent(error.message)}`);
    }
  });

  app.post("/api/gmail/disconnect", async (req, res) => {
    try {
      await disconnectGmail();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Gmail email bills scanning endpoint
  app.get("/api/email-bills", async (req, res) => {
    try {
      const status = await getConnectionStatus();
      
      if (!status.connected) {
        return res.status(400).json({
          success: false,
          error: "Gmail not connected. Please connect your Gmail account first.",
          needsConnection: true
        });
      }

      const emailBills = await scanEmailsForBillsOAuth(50);
      
      res.json({
        success: true,
        bills: emailBills,
        count: emailBills.length,
        connectedEmail: status.email,
        message: "Email scan completed"
      });
    } catch (error: any) {
      console.error('Email bills scan failed:', error);
      
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('gmail not connected') || 
          errorMessage.includes('please connect') ||
          errorMessage.includes('token expired')) {
        return res.status(400).json({
          success: false,
          error: "Gmail not connected or session expired. Please reconnect your Gmail account.",
          needsConnection: true
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to scan emails'
      });
    }
  });

  // Note: Catch-all route handled by Vite middleware in development mode

  const httpServer = createServer(app);
  return httpServer;
}
