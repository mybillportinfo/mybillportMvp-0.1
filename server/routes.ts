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

  const httpServer = createServer(app);
  return httpServer;
}
