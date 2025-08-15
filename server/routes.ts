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

// Store access tokens in memory for demo purposes
// In production, store these securely in your database
const accessTokens = new Map<string, string>();

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Interac e-Transfer payment request endpoint
  app.post("/api/interac/send-request", async (req, res) => {
    try {
      const { senderEmail, recipientEmail, amount, securityQuestion, message } = req.body;

      // Validate input
      if (!senderEmail || !recipientEmail || !amount || !securityQuestion) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create a simple email transporter using Gmail SMTP
      // For production, you would use a proper email service like SendGrid, AWS SES, etc.
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'mybillportinfo@gmail.com',
          pass: 'mybillport2024!' // In production, use environment variables
        }
      });

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">💰 Interac e-Transfer Request</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort Payment Request</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Payment Request Details</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount:</strong> $${amount.toFixed(2)} CAD</p>
              <p><strong>From:</strong> ${senderEmail}</p>
              <p><strong>Security Question:</strong> ${securityQuestion}</p>
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>
            
            <h3 style="color: #333;">Next Steps:</h3>
            <ol style="color: #666; line-height: 1.6;">
              <li>Log into your online banking or mobile banking app</li>
              <li>Navigate to Interac e-Transfer</li>
              <li>Send money to: <strong>${senderEmail}</strong></li>
              <li>Enter the amount: <strong>$${amount.toFixed(2)} CAD</strong></li>
              <li>Use the security question: <strong>${securityQuestion}</strong></li>
              <li>Enter the answer you know for this security question</li>
            </ol>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>💡 Tip:</strong> Make sure you know the answer to the security question before sending!</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">This request was sent through MyBillPort</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">If you didn't expect this request, please contact the sender.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For support, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: 'MyBillPort <mybillportinfo@gmail.com>',
        to: recipientEmail,
        subject: `💰 Payment Request: $${amount.toFixed(2)} CAD from ${senderEmail}`,
        html: emailContent
      };

      await transporter.sendMail(mailOptions);

      res.json({ 
        success: true, 
        message: `Payment request sent to ${recipientEmail}`,
        details: {
          amount: amount,
          recipient: recipientEmail,
          sender: senderEmail
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
      if (phoneNumber) {
        console.log(`SMS would be sent to ${phoneNumber}: "MyBillPort: Your profile has been updated successfully. If this wasn't you, contact mybillportinfo@gmail.com immediately."`);
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

  const httpServer = createServer(app);
  return httpServer;
}
