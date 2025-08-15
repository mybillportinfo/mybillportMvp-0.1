import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertBillSchema, insertPaymentSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from "./plaid";
import { 
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
} from 'plaid';
import { scanBillImage } from './ai-scanner';
import nodemailer from 'nodemailer';
import { sendPaymentRequestEmail } from '../services/email';
import Stripe from "stripe";
import express from "express";

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
  // Import and register testing routes
  const { registerEmailTestRoutes } = await import('./routes/email-test');
  const { registerAdminRoutes } = await import('./routes/admin-config');
  
  // Register testing and admin routes
  registerEmailTestRoutes(app);
  registerAdminRoutes(app);

  // Seed database and get demo user ID
  let DEMO_USER_ID = await seedDatabase();
  if (!DEMO_USER_ID) {
    // If seeding was skipped, get existing demo user
    const demoUser = await storage.getUserByUsername("johndoe");
    DEMO_USER_ID = demoUser?.id || "demo-user-1";
  }

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
      const billData = insertBillSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
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
        name,
        amount: parseFloat(amount),
        note
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
        products: PLAID_PRODUCTS as any,
        country_codes: PLAID_COUNTRY_CODES as any,
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

      // Remove the old email template logic since we're using the service now
      // Import email service
      const { sendPaymentRequestEmail } = await import('../services/email');

      // Send email using MailerSend
      const result = await sendPaymentRequestEmail({
        to: recipientEmail,
        name: recipientEmail.split('@')[0], // Use email prefix as name
        amount: parseFloat(amount),
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
          user: 'mybillportinfo@gmail.com',
          pass: 'mybillport2024!' // In production, use environment variables
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
        name: "Test User",
        amount: 25.00,
        note: "This is a test email from MyBillPort email service"
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

  // ========== STRIPE PAYMENT PROCESSING ENDPOINTS ==========
  
  // Stripe webhook endpoint - MUST be before JSON body parsing
  app.post('/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
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
        
        // Here you can update your database to mark bill as paid
        if (paymentIntent.metadata?.billId) {
          console.log(`Marking bill ${paymentIntent.metadata.billId} as paid`);
        }
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  });

  // Create payment intent for bill payment
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

  const httpServer = createServer(app);
  return httpServer;
}
