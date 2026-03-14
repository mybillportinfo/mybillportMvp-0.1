var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bills: () => bills,
  gmailTokens: () => gmailTokens,
  insertBillSchema: () => insertBillSchema,
  insertGmailTokenSchema: () => insertGmailTokenSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertRewardSchema: () => insertRewardSchema,
  insertUserSchema: () => insertUserSchema,
  payments: () => payments,
  rewards: () => rewards,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, bills, payments, rewards, insertUserSchema, insertBillSchema, insertPaymentSchema, insertRewardSchema, gmailTokens, insertGmailTokenSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull()
    });
    bills = pgTable("bills", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      name: text("name").notNull(),
      company: text("company").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      dueDate: timestamp("due_date").notNull(),
      priority: text("priority").$type().notNull(),
      icon: text("icon").notNull(),
      isPaid: integer("is_paid").default(0).notNull(),
      // 0 = false, 1 = true
      billType: text("bill_type").$type().default("other"),
      createdAt: timestamp("created_at").defaultNow()
    });
    payments = pgTable("payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      billId: varchar("bill_id").notNull().references(() => bills.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentDate: timestamp("payment_date").defaultNow(),
      status: text("status").$type().notNull()
    });
    rewards = pgTable("rewards", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      points: integer("points").notNull().default(0),
      title: text("title").notNull(),
      description: text("description"),
      isRedeemed: integer("is_redeemed").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true
    });
    insertBillSchema = createInsertSchema(bills).omit({
      id: true,
      createdAt: true
    });
    insertPaymentSchema = createInsertSchema(payments).omit({
      id: true,
      paymentDate: true
    });
    insertRewardSchema = createInsertSchema(rewards).omit({
      id: true,
      createdAt: true
    });
    gmailTokens = pgTable("gmail_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      accessToken: text("access_token").notNull(),
      refreshToken: text("refresh_token"),
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertGmailTokenSchema = createInsertSchema(gmailTokens).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// services/email.ts
var email_exports = {};
__export(email_exports, {
  sendBillReminderEmail: () => sendBillReminderEmail,
  sendPaymentRequestEmail: () => sendPaymentRequestEmail,
  sendTestEmail: () => sendTestEmail,
  sendWelcomeEmail: () => sendWelcomeEmail
});
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
function getCleanApiKey() {
  let apiKey = process.env.MAILERSEND_API_KEY?.trim() || "";
  if (apiKey.includes("mlsn.")) {
    const mlsnIndex = apiKey.indexOf("mlsn.");
    if (mlsnIndex > 0) {
      apiKey = apiKey.substring(mlsnIndex);
    }
  }
  return apiKey;
}
function getMailerSendClient() {
  return new MailerSend({ apiKey: getCleanApiKey() });
}
async function sendTestEmail(to) {
  try {
    const apiKey = getCleanApiKey();
    if (!apiKey || !apiKey.startsWith("mlsn.")) {
      console.log("\u26A0\uFE0F MailerSend API key not configured - Demo mode");
      return { success: true, messageId: "demo-test-email" };
    }
    const mailerSend = getMailerSendClient();
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];
    const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setSubject("MyBillPort Email Test").setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">MyBillPort Email Test</h1>
          <p>This is a test email from your MyBillPort application.</p>
          <p><strong>Timestamp:</strong> ${(/* @__PURE__ */ new Date()).toISOString()}</p>
          <p>If you received this email, your email service is working correctly!</p>
        </div>
      `);
    const response = await mailerSend.email.send(emailParams);
    return { success: true, messageId: response.body?.message_id };
  } catch (error) {
    console.error("Test email failed:", error);
    return { success: false, error: error.message };
  }
}
function getReminderConfig(type) {
  switch (type) {
    case "7-days":
      return {
        subject: "\u{1F4C5} Upcoming Bill",
        header: "Bill Due in 7 Days",
        message: "You have a bill coming up in 7 days. Plan ahead to avoid missing the due date.",
        color: "#10b981",
        borderColor: "#059669"
      };
    case "2-days":
      return {
        subject: "\u26A0\uFE0F Bill Due Soon",
        header: "Bill Due in 2 Days",
        message: "Your bill is due in 2 days. Don't forget to make your payment!",
        color: "#f59e0b",
        borderColor: "#d97706"
      };
    case "due-today":
      return {
        subject: "\u{1F514} Bill Due Today",
        header: "Bill Due Today",
        message: "Your bill is due today. Make sure to pay it to avoid late fees.",
        color: "#ef4444",
        borderColor: "#dc2626"
      };
    case "overdue":
      return {
        subject: "\u{1F6A8} Overdue Bill",
        header: "Bill Overdue",
        message: "Your bill is now overdue. Please pay as soon as possible to avoid additional fees.",
        color: "#dc2626",
        borderColor: "#b91c1c"
      };
  }
}
async function sendBillReminderEmail(to, bill, reminderType = "2-days") {
  try {
    const apiKey = getCleanApiKey();
    if (!apiKey || !apiKey.startsWith("mlsn.")) {
      console.log("\u26A0\uFE0F MailerSend API key not configured - Demo mode");
      console.log(`Bill reminder (${reminderType}) would be sent to: ${to} for bill: ${bill.name}`);
      return { success: true, messageId: "demo-reminder" };
    }
    const mailerSend = getMailerSendClient();
    const config = getReminderConfig(reminderType);
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];
    const dueDate = new Date(bill.dueDate).toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setSubject(`${config.subject}: ${bill.name}`).setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${config.color}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${config.header}</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">${config.message}</p>
            
            <div style="background: #f9fafb; border-left: 4px solid ${config.borderColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 10px 0; color: #111827;">${bill.name}</h3>
              <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: ${config.color};">$${parseFloat(bill.amount).toFixed(2)} CAD</p>
              <p style="margin: 10px 0 0 0; color: #6b7280;">Due: ${dueDate}</p>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://mybillport.com/app" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                View My Bills
              </a>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">MyBillPort - Never miss a bill payment</p>
          </div>
        </div>
      `);
    const response = await mailerSend.email.send(emailParams);
    console.log(`\u2705 ${reminderType} reminder sent for ${bill.name} to ${to}`);
    return { success: true, messageId: response.body?.message_id };
  } catch (error) {
    console.error("Bill reminder failed:", error);
    return { success: false, error: error.message };
  }
}
async function sendWelcomeEmail(to, userName) {
  try {
    const apiKey = getCleanApiKey();
    console.log(`\u{1F50D} MailerSend API key check: exists=${!!apiKey}, starts_with_mlsn=${apiKey?.startsWith("mlsn.")}, length=${apiKey?.length || 0}`);
    if (!apiKey || !apiKey.startsWith("mlsn.")) {
      console.log("\u26A0\uFE0F MailerSend API key not configured - Demo mode");
      console.log(`Welcome email would be sent to: ${to}`);
      return { success: true, messageId: "demo-welcome" };
    }
    const mailerSend = getMailerSendClient();
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to, userName)];
    const displayName = userName || "there";
    const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setSubject("Welcome to MyBillPort! \u{1F389}").setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px; font-weight: bold;">M</span>
            </div>
            <h1 style="margin: 0; font-size: 28px;">Welcome to MyBillPort!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your personal bill management assistant</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${displayName}! \u{1F44B}</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for joining MyBillPort! We're excited to help you take control of your bills and never miss a payment again.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 15px 0; color: #065f46;">Here's what you can do:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li style="margin-bottom: 8px;">\u{1F4CB} Track all your recurring bills in one place</li>
                <li style="margin-bottom: 8px;">\u{1F514} Get email reminders before bills are due</li>
                <li style="margin-bottom: 8px;">\u{1F4CA} See your bill overview at a glance</li>
                <li style="margin-bottom: 8px;">\u2705 Mark bills as paid to stay organized</li>
              </ul>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://mybillport.com/app" style="background: #0d9488; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                Start Managing Your Bills
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If you have any questions, just reply to this email. We're here to help!
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">MyBillPort - Never miss a bill payment</p>
            <p style="margin: 0;">
              <a href="https://mybillport.com" style="color: #0d9488; text-decoration: none;">mybillport.com</a>
            </p>
          </div>
        </div>
      `).setText(`
Welcome to MyBillPort!

Hi ${displayName}!

Thank you for joining MyBillPort! We're excited to help you take control of your bills and never miss a payment again.

Here's what you can do:
- Track all your recurring bills in one place
- Get email reminders before bills are due
- See your bill overview at a glance
- Mark bills as paid to stay organized

Start managing your bills: https://mybillport.com/app

If you have any questions, just reply to this email. We're here to help!

MyBillPort - Never miss a bill payment
https://mybillport.com
      `);
    const response = await mailerSend.email.send(emailParams);
    console.log(`\u2705 Welcome email sent to ${to}`);
    return { success: true, messageId: response.body?.message_id };
  } catch (error) {
    console.error("Welcome email failed:", error);
    return { success: false, error: error.message };
  }
}
async function sendPaymentRequestEmail({
  to,
  amount,
  note,
  fromUser
}) {
  try {
    const apiKey = getCleanApiKey();
    if (!apiKey || !apiKey.startsWith("mlsn.")) {
      console.log("\u26A0\uFE0F MailerSend API key not configured - Demo mode");
      console.log(`Payment request would be sent to: ${to} from: ${fromUser}`);
      console.log(`Amount: $${amount.toFixed(2)} CAD - ${note}`);
      return { success: true, messageId: "demo-payment-request" };
    }
    const mailerSend = getMailerSendClient();
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];
    const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setReplyTo(sentFrom).setSubject(`\u{1F4B0} Payment Request: $${amount.toFixed(2)} CAD`).setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">\u{1F4B0} Payment Request</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">Payment Request from ${fromUser}</h2>
            
            <div style="background: #f3f4f6; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px;"><strong>Amount: $${amount.toFixed(2)} CAD</strong></p>
              <p style="margin: 10px 0 0 0; color: #6b7280;">${note}</p>
            </div>
            
            <p>You've received a payment request through MyBillPort. Please review the details above.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://mybillport.com" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Request
              </a>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; line-height: 1.5;">
              Questions? Contact ${fromUser} directly or visit MyBillPort for more information.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>This payment request was sent through MyBillPort</p>
          </div>
        </div>
      `).setText(`
        Payment Request from ${fromUser}
        
        Amount: $${amount.toFixed(2)} CAD
        Message: ${note}
        
        You've received a payment request through MyBillPort. Please review the details and contact the sender if needed.
        
        Visit https://mybillport.com to view the request.
        
        This payment request was sent through MyBillPort.
      `);
    const response = await mailerSend.email.send(emailParams);
    return { success: true, messageId: response.body?.message_id };
  } catch (error) {
    console.error("Payment request email failed:", error);
    return {
      success: false,
      error: error.message || "Failed to send payment request email"
    };
  }
}
var fromEmail, fromName;
var init_email = __esm({
  "services/email.ts"() {
    "use strict";
    fromEmail = "mybillport@test-nrw7gymn9wng2k8e.mlsender.net";
    fromName = process.env.FROM_NAME || "MyBillPort";
  }
});

// server/routes/email-test.ts
var email_test_exports = {};
__export(email_test_exports, {
  registerEmailTestRoutes: () => registerEmailTestRoutes
});
function registerEmailTestRoutes(app2) {
  app2.post("/api/email-test", async (req, res) => {
    try {
      const testEmail = process.env.TEST_EMAIL;
      if (!testEmail) {
        return res.status(400).json({
          success: false,
          error: "TEST_EMAIL environment variable not set"
        });
      }
      const hasMailerSend = !!process.env.MAILERSEND_API_KEY;
      const hasSendGrid = !!process.env.SENDGRID_API_KEY;
      if (!hasMailerSend && !hasSendGrid) {
        return res.status(400).json({
          success: false,
          error: "No email service configured. Set MAILERSEND_API_KEY or SENDGRID_API_KEY"
        });
      }
      const emailService = await Promise.resolve().then(() => (init_email(), email_exports));
      const result = await emailService.sendTestEmail(testEmail);
      res.json({
        success: true,
        message: "Test email sent successfully",
        recipient: testEmail,
        service: hasMailerSend ? "MailerSend" : "SendGrid",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        result
      });
    } catch (error) {
      console.error("Email test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Email test failed",
        message: "Failed to send test email"
      });
    }
  });
  app2.post("/api/send-bill-reminder", async (req, res) => {
    try {
      const { billId, userEmail } = req.body;
      if (!billId || !userEmail) {
        return res.status(400).json({
          success: false,
          error: "billId and userEmail are required"
        });
      }
      const emailService = await Promise.resolve().then(() => (init_email(), email_exports));
      const mockBill = {
        id: billId,
        name: "Test Bill",
        company: "Test Company",
        amount: "99.99",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
      };
      const result = await emailService.sendBillReminderEmail(userEmail, mockBill);
      res.json({
        success: true,
        message: "Bill reminder sent successfully",
        recipient: userEmail,
        billId,
        result
      });
    } catch (error) {
      console.error("Bill reminder failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send bill reminder"
      });
    }
  });
  app2.post("/api/send-payment-request", async (req, res) => {
    try {
      const { to, amount, note, fromUser } = req.body;
      if (!to || !amount || !fromUser) {
        return res.status(400).json({
          success: false,
          error: "to, amount, and fromUser are required"
        });
      }
      const emailService = await Promise.resolve().then(() => (init_email(), email_exports));
      const result = await emailService.sendPaymentRequestEmail({
        to,
        amount: parseFloat(amount),
        note: note || "Payment request",
        fromUser
      });
      res.json({
        success: true,
        message: "Payment request sent successfully",
        recipient: to,
        amount,
        fromUser,
        result
      });
    } catch (error) {
      console.error("Payment request failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send payment request"
      });
    }
  });
}
var init_email_test = __esm({
  "server/routes/email-test.ts"() {
    "use strict";
  }
});

// server/routes/admin-config.ts
var admin_config_exports = {};
__export(admin_config_exports, {
  registerAdminRoutes: () => registerAdminRoutes
});
function registerAdminRoutes(app2) {
  app2.get("/admin/status", (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    res.json({
      status: "healthy",
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/admin/env-check", (req, res) => {
    const requiredVars = [
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_PROJECT_ID",
      "VITE_FIREBASE_APP_ID",
      "FIREBASE_SERVICE_ACCOUNT_KEY",
      "PLAID_CLIENT_ID",
      "PLAID_SECRET",
      "STRIPE_SECRET_KEY",
      "MAILERSEND_API_KEY",
      "FROM_EMAIL",
      "TEST_EMAIL"
    ];
    const envStatus = requiredVars.reduce((acc, varName) => {
      acc[varName] = {
        present: !!process.env[varName],
        length: process.env[varName]?.length || 0
      };
      return acc;
    }, {});
    res.json({
      message: "Environment variables status check",
      variables: envStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
}
var init_admin_config = __esm({
  "server/routes/admin-config.ts"() {
    "use strict";
  }
});

// server/reminder-service.ts
var reminder_service_exports = {};
__export(reminder_service_exports, {
  processReminders: () => processReminders,
  sendTestReminder: () => sendTestReminder
});
import { eq as eq3 } from "drizzle-orm";
function getDaysUntilDue(dueDate) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
}
function getReminderType(daysUntilDue) {
  if (daysUntilDue === 7) return "7-days";
  if (daysUntilDue === 2) return "2-days";
  if (daysUntilDue === 0) return "due-today";
  if (daysUntilDue < 0) return "overdue";
  return null;
}
async function processReminders() {
  const results = [];
  try {
    const unpaidBills = await db.select({
      bill: bills,
      user: users
    }).from(bills).innerJoin(users, eq3(bills.userId, users.id)).where(eq3(bills.isPaid, 0));
    console.log(`\u{1F4E7} Processing reminders for ${unpaidBills.length} unpaid bills`);
    for (const { bill, user } of unpaidBills) {
      const daysUntilDue = getDaysUntilDue(new Date(bill.dueDate));
      const reminderType = getReminderType(daysUntilDue);
      if (reminderType) {
        const userEmail = user.username;
        if (userEmail && userEmail.includes("@")) {
          const result = await sendBillReminderEmail(userEmail, bill, reminderType);
          results.push({
            billId: bill.id,
            billName: bill.name,
            reminderType,
            success: result.success,
            error: result.error
          });
        } else {
          console.log(`\u26A0\uFE0F No valid email for user ${user.id}, skipping reminder for ${bill.name}`);
        }
      }
    }
    console.log(`\u2705 Processed ${results.length} reminders`);
    return results;
  } catch (error) {
    console.error("\u274C Error processing reminders:", error);
    throw error;
  }
}
async function sendTestReminder(email, billId, reminderType) {
  try {
    const [bill] = await db.select().from(bills).where(eq3(bills.id, billId));
    if (!bill) {
      return { billId, billName: "Unknown", reminderType, success: false, error: "Bill not found" };
    }
    const result = await sendBillReminderEmail(email, bill, reminderType);
    return {
      billId: bill.id,
      billName: bill.name,
      reminderType,
      success: result.success,
      error: result.error
    };
  } catch (error) {
    return { billId, billName: "Unknown", reminderType, success: false, error: error.message };
  }
}
var init_reminder_service = __esm({
  "server/reminder-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_email();
  }
});

// server/index.ts
import express3 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
init_db();
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getBillsByUserId(userId) {
    return await db.select().from(bills).where(eq(bills.userId, userId));
  }
  async getBill(id) {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill || void 0;
  }
  async createBill(insertBill) {
    const validatedBill = {
      ...insertBill,
      priority: insertBill.priority
    };
    const [bill] = await db.insert(bills).values(validatedBill).returning();
    return bill;
  }
  async updateBill(id, updates) {
    const [bill] = await db.update(bills).set(updates).where(eq(bills.id, id)).returning();
    return bill || void 0;
  }
  async markBillAsPaid(billId) {
    const [bill] = await db.update(bills).set({ isPaid: 1 }).where(eq(bills.id, billId)).returning();
    return bill || void 0;
  }
  async deleteBill(id) {
    const result = await db.delete(bills).where(eq(bills.id, id)).returning();
    return result.length > 0;
  }
  async getPaymentsByUserId(userId) {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
  async createPayment(insertPayment) {
    const validatedPayment = {
      ...insertPayment,
      status: insertPayment.status
    };
    const [payment] = await db.insert(payments).values(validatedPayment).returning();
    return payment;
  }
  async getRewardsByUserId(userId) {
    return await db.select().from(rewards).where(eq(rewards.userId, userId));
  }
  async createReward(insertReward) {
    const [reward] = await db.insert(rewards).values(insertReward).returning();
    return reward;
  }
  async updateReward(id, updates) {
    const [reward] = await db.update(rewards).set(updates).where(eq(rewards.id, id)).returning();
    return reward || void 0;
  }
  async updateBillStatus(billId, status) {
    const [bill] = await db.update(bills).set({ isPaid: status === "paid" ? 1 : 0 }).where(eq(bills.id, billId)).returning();
    return bill || void 0;
  }
};
var MemoryStorage = class {
  users = /* @__PURE__ */ new Map();
  usersByUsername = /* @__PURE__ */ new Map();
  billsByUser = /* @__PURE__ */ new Map();
  billsById = /* @__PURE__ */ new Map();
  paymentsByUser = /* @__PURE__ */ new Map();
  rewardsByUser = /* @__PURE__ */ new Map();
  rewardsById = /* @__PURE__ */ new Map();
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return this.usersByUsername.get(username);
  }
  async createUser(insertUser) {
    const user = {
      id: Date.now().toString(),
      ...insertUser
    };
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }
  async getBillsByUserId(userId) {
    return this.billsByUser.get(userId) || [];
  }
  async getBill(id) {
    return this.billsById.get(id);
  }
  async createBill(insertBill) {
    const bill = {
      id: Date.now().toString(),
      ...insertBill,
      priority: insertBill.priority,
      createdAt: /* @__PURE__ */ new Date(),
      isPaid: insertBill.isPaid ?? 0
    };
    this.billsById.set(bill.id, bill);
    const userBills = this.billsByUser.get(bill.userId) || [];
    userBills.push(bill);
    this.billsByUser.set(bill.userId, userBills);
    return bill;
  }
  async updateBill(id, updates) {
    const existingBill = this.billsById.get(id);
    if (!existingBill) return void 0;
    const updatedBill = { ...existingBill, ...updates };
    this.billsById.set(id, updatedBill);
    const userBills = this.billsByUser.get(existingBill.userId) || [];
    const index = userBills.findIndex((b) => b.id === id);
    if (index >= 0) {
      userBills[index] = updatedBill;
      this.billsByUser.set(existingBill.userId, userBills);
    }
    return updatedBill;
  }
  async markBillAsPaid(billId) {
    return this.updateBill(billId, { isPaid: 1 });
  }
  async deleteBill(id) {
    const bill = this.billsById.get(id);
    if (!bill) return false;
    this.billsById.delete(id);
    const userBills = this.billsByUser.get(bill.userId) || [];
    const filtered = userBills.filter((b) => b.id !== id);
    this.billsByUser.set(bill.userId, filtered);
    return true;
  }
  async getPaymentsByUserId(userId) {
    return this.paymentsByUser.get(userId) || [];
  }
  async createPayment(insertPayment) {
    const payment = {
      id: Date.now().toString(),
      ...insertPayment,
      status: insertPayment.status,
      paymentDate: /* @__PURE__ */ new Date()
    };
    const userPayments = this.paymentsByUser.get(payment.userId) || [];
    userPayments.push(payment);
    this.paymentsByUser.set(payment.userId, userPayments);
    return payment;
  }
  async getRewardsByUserId(userId) {
    return this.rewardsByUser.get(userId) || [];
  }
  async createReward(insertReward) {
    const reward = {
      id: Date.now().toString(),
      ...insertReward,
      createdAt: /* @__PURE__ */ new Date(),
      points: insertReward.points ?? 0,
      description: insertReward.description ?? null,
      isRedeemed: insertReward.isRedeemed ?? 0
    };
    this.rewardsById.set(reward.id, reward);
    const userRewards = this.rewardsByUser.get(reward.userId) || [];
    userRewards.push(reward);
    this.rewardsByUser.set(reward.userId, userRewards);
    return reward;
  }
  async updateReward(id, updates) {
    const existingReward = this.rewardsById.get(id);
    if (!existingReward) return void 0;
    const updatedReward = { ...existingReward, ...updates };
    this.rewardsById.set(id, updatedReward);
    const userRewards = this.rewardsByUser.get(existingReward.userId) || [];
    const index = userRewards.findIndex((r) => r.id === id);
    if (index >= 0) {
      userRewards[index] = updatedReward;
      this.rewardsByUser.set(existingReward.userId, userRewards);
    }
    return updatedReward;
  }
  async updateBillStatus(billId, status) {
    return this.updateBill(billId, { isPaid: status === "paid" ? 1 : 0 });
  }
};
async function createStorage() {
  try {
    const testStorage = new DatabaseStorage();
    await testStorage.getBillsByUserId("test-connection");
    console.log("\u2705 Database connection successful - using DatabaseStorage");
    return testStorage;
  } catch (error) {
    console.log("\u26A0\uFE0F Database unavailable - using MemoryStorage fallback");
    return new MemoryStorage();
  }
}
var storage;
async function initializeStorage() {
  storage = await createStorage();
}

// server/firebase-admin.ts
import admin from "firebase-admin";
var adminApp = null;
var adminDb = null;
var adminAuth = null;
function initializeFirebaseAdmin() {
  if (adminApp) {
    return { app: adminApp, db: adminDb, auth: adminAuth };
  }
  try {
    try {
      adminApp = admin.app();
    } catch (e) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Firebase Admin features will be limited.");
        adminApp = admin.initializeApp();
      } else {
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(serviceAccountKey);
        } catch (parseError) {
          console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", parseError);
          throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.");
        }
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.projectId || serviceAccount.project_id
        });
      }
    }
    adminDb = admin.firestore(adminApp);
    adminAuth = admin.auth(adminApp);
    console.log("Firebase Admin initialized successfully");
    return { app: adminApp, db: adminDb, auth: adminAuth };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw error;
  }
}
function getFirebaseAdmin() {
  if (!adminApp) {
    return initializeFirebaseAdmin();
  }
  return { app: adminApp, db: adminDb, auth: adminAuth };
}

// server/seed.ts
async function seedDatabase() {
  try {
    const existingUser = await storage.getUserByUsername("johndoe");
    if (existingUser) {
      console.log("Database already seeded, skipping...");
      return null;
    }
    console.log("Seeding database with demo data...");
    const demoUser = await storage.createUser({
      username: "johndoe",
      password: "demo123",
      name: "John Doe"
    });
    const userId = demoUser.id;
    await storage.createBill({
      userId,
      name: "Hydro One",
      company: "Hydro One Networks",
      amount: "187.45",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3),
      priority: "urgent",
      icon: "fas fa-bolt",
      isPaid: 0
    });
    await storage.createBill({
      userId,
      name: "Enbridge Gas",
      company: "Enbridge Gas Distribution",
      amount: "156.80",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3),
      priority: "urgent",
      icon: "fas fa-fire",
      isPaid: 0
    });
    await storage.createBill({
      userId,
      name: "Rogers Wireless",
      company: "Rogers Communications",
      amount: "125.00",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3),
      priority: "medium",
      icon: "fas fa-phone",
      isPaid: 0
    });
    await storage.createBill({
      userId,
      name: "Bell Internet",
      company: "Bell Canada",
      amount: "99.99",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      priority: "medium",
      icon: "fas fa-wifi",
      isPaid: 0
    });
    await storage.createBill({
      userId,
      name: "Netflix",
      company: "Netflix Canada",
      amount: "22.99",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3),
      priority: "low",
      icon: "fas fa-tv",
      isPaid: 0
    });
    await storage.createBill({
      userId,
      name: "Toronto Hydro",
      company: "Toronto Hydro Electric",
      amount: "142.30",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1e3),
      priority: "medium",
      icon: "fas fa-bolt",
      isPaid: 0
    });
    await storage.createReward({
      userId,
      points: 250,
      title: "On-time Payment Bonus",
      description: "Earned for paying 5 bills on time",
      isRedeemed: 0
    });
    await storage.createReward({
      userId,
      points: 100,
      title: "First Payment",
      description: "Welcome bonus for first payment",
      isRedeemed: 0
    });
    console.log("Database seeded successfully with Canadian utilities!");
    return userId;
  } catch (error) {
    console.error("Seeding error:", error);
    return null;
  }
}

// server/routes.ts
init_schema();
import { z } from "zod";

// server/plaid.ts
import { PlaidApi, Configuration, PlaidEnvironments } from "plaid";
var plaidEnvRaw = (process.env.PLAID_ENV || "").toLowerCase().trim();
var validEnvs = ["sandbox", "development", "production"];
if (!validEnvs.includes(plaidEnvRaw)) {
  console.error(`\u274C PLAID_ENV is invalid: "${process.env.PLAID_ENV}"`);
  console.error(`   Valid values are: ${validEnvs.join(", ")}`);
  console.error(`   Defaulting to 'sandbox' for development. Fix this in production!`);
}
var plaidEnv = validEnvs.includes(plaidEnvRaw) ? plaidEnvRaw : "sandbox";
if (!process.env.PLAID_CLIENT_ID) {
  console.error("\u274C PLAID_CLIENT_ID is not configured");
}
if (!process.env.PLAID_SECRET) {
  console.error("\u274C PLAID_SECRET is not configured");
}
if (plaidEnv === "production" && process.env.PLAID_SECRET?.length === 32) {
  console.warn("\u26A0\uFE0F Warning: Using production environment with a short secret - verify this is your production secret");
}
if (plaidEnv === "sandbox" && process.env.PLAID_SECRET?.startsWith("df0b")) {
  console.warn("\u26A0\uFE0F Warning: PLAID_SECRET appears to be a production key but PLAID_ENV is sandbox");
}
var configuration = new Configuration({
  basePath: plaidEnv === "sandbox" ? PlaidEnvironments.sandbox : plaidEnv === "production" ? PlaidEnvironments.production : PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET
    }
  }
});
var plaidClient = new PlaidApi(configuration);
console.log("\u2705 Plaid client configured for environment:", plaidEnv);
console.log("   Client ID configured:", !!process.env.PLAID_CLIENT_ID);
console.log("   Secret configured:", !!process.env.PLAID_SECRET);

// server/ai-scanner.ts
import Anthropic from "@anthropic-ai/sdk";
var DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
var anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
async function scanBillImage(base64Image) {
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1e3,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this bill image and extract the following information. Return ONLY a JSON object with these exact fields:

{
  "company": "Company name (e.g., 'Hydro One', 'Rogers', 'Bell Canada')",
  "amount": "Amount due as a number (e.g., 125.50)",
  "dueDate": "Due date in YYYY-MM-DD format (e.g., '2025-08-15')",
  "accountNumber": "Account number with partial masking (e.g., '****-****-1234')",
  "category": "Bill category (e.g., 'Electricity', 'Mobile', 'Internet', 'Water', 'Gas', 'Credit Card')",
  "type": "Bill type (utility, phone, credit_card, internet, water, gas)",
  "confidence": "Confidence level as percentage (0-100)",
  "extractedText": "Key text found on the bill"
}

Focus on Canadian companies and standard bill formats. If you can't find specific information, use reasonable defaults but lower the confidence score accordingly.`
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });
    const content = response.content[0];
    if (content.type === "text") {
      try {
        const result = JSON.parse(content.text);
        return {
          company: result.company || "Unknown Company",
          amount: parseFloat(result.amount) || 0,
          dueDate: result.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
          accountNumber: result.accountNumber || "****-****-0000",
          category: result.category || "General",
          type: result.type || "utility",
          confidence: Math.min(100, Math.max(0, parseInt(result.confidence) || 85)),
          extractedText: result.extractedText || "Bill information extracted"
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        throw new Error("Failed to parse bill information from image");
      }
    } else {
      throw new Error("Unexpected response format from AI");
    }
  } catch (error) {
    console.error("AI bill scanning error:", error);
    throw new Error("Failed to analyze bill image: " + error.message);
  }
}

// server/gmail-oauth.ts
init_db();
init_schema();
import { google } from "googleapis";
import { eq as eq2 } from "drizzle-orm";
import crypto from "crypto";
var GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email"
];
var oauthStates = /* @__PURE__ */ new Map();
function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || `${getBaseUrl()}/api/gmail/callback`;
  if (!clientId || !clientSecret) {
    throw new Error("Gmail OAuth credentials not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.");
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}
function getBaseUrl() {
  if (process.env.REPLIT_DEPLOYMENT_URL) {
    return process.env.REPLIT_DEPLOYMENT_URL;
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }
  return "http://localhost:5000";
}
function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  const state = crypto.randomBytes(16).toString("hex");
  oauthStates.set(state, { timestamp: Date.now() });
  setTimeout(() => oauthStates.delete(state), 10 * 60 * 1e3);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GMAIL_SCOPES,
    prompt: "consent",
    state
  });
  return { authUrl, state };
}
function validateState(state) {
  if (!state || !oauthStates.has(state)) {
    return false;
  }
  const stateData = oauthStates.get(state);
  oauthStates.delete(state);
  return Date.now() - stateData.timestamp < 10 * 60 * 1e3;
}
async function handleCallback(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;
  if (!email) {
    throw new Error("Could not get user email from Google");
  }
  const existingToken = await db.select().from(gmailTokens).where(eq2(gmailTokens.email, email)).limit(1);
  if (existingToken.length > 0) {
    await db.update(gmailTokens).set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || existingToken[0].refreshToken,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(gmailTokens.email, email));
  } else {
    await db.insert(gmailTokens).values({
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    });
  }
  return { email, success: true };
}
async function getGmailClient(email) {
  const tokenRecord = email ? await db.select().from(gmailTokens).where(eq2(gmailTokens.email, email)).limit(1) : await db.select().from(gmailTokens).limit(1);
  if (!tokenRecord.length) {
    throw new Error("Gmail not connected. Please connect your Gmail account first.");
  }
  const token = tokenRecord[0];
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken
  });
  if (token.expiresAt && new Date(token.expiresAt) < /* @__PURE__ */ new Date()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await db.update(gmailTokens).set({
        accessToken: credentials.access_token,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(gmailTokens.email, token.email));
      oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw new Error("Gmail token expired. Please reconnect your Gmail account.");
    }
  }
  return google.gmail({ version: "v1", auth: oauth2Client });
}
async function getConnectionStatus() {
  try {
    const tokenRecord = await db.select().from(gmailTokens).limit(1);
    if (!tokenRecord.length) {
      return { connected: false };
    }
    return { connected: true, email: tokenRecord[0].email };
  } catch {
    return { connected: false };
  }
}
async function disconnectGmail(email) {
  if (email) {
    await db.delete(gmailTokens).where(eq2(gmailTokens.email, email));
  } else {
    await db.delete(gmailTokens);
  }
}
var BILL_KEYWORDS = [
  "invoice",
  "bill",
  "payment due",
  "amount due",
  "statement",
  "utility",
  "hydro",
  "electricity",
  "gas",
  "water",
  "internet",
  "phone",
  "mobile",
  "wireless",
  "cable",
  "insurance",
  "mortgage",
  "rent",
  "lease",
  "subscription",
  "membership",
  "renewal",
  "credit card",
  "bank statement",
  "rogers",
  "bell",
  "telus",
  "shaw",
  "fido",
  "koodo",
  "virgin",
  "enbridge",
  "hydro one",
  "toronto hydro",
  "bc hydro",
  "netflix",
  "spotify",
  "amazon prime",
  "disney+",
  "td bank",
  "rbc",
  "scotiabank",
  "bmo",
  "cibc"
];
var BILL_SENDERS = [
  "noreply",
  "billing",
  "invoice",
  "payment",
  "statement",
  "customerservice",
  "support",
  "notifications"
];
async function scanEmailsForBillsOAuth(maxResults = 50) {
  const gmail = await getGmailClient();
  const searchQuery = BILL_KEYWORDS.slice(0, 10).map((k) => `"${k}"`).join(" OR ");
  const response = await gmail.users.messages.list({
    userId: "me",
    q: searchQuery,
    maxResults
  });
  const messages = response.data.messages || [];
  const emailBills = [];
  for (const message of messages.slice(0, 20)) {
    try {
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"]
      });
      const headers = fullMessage.data.payload?.headers || [];
      const from = headers.find((h) => h.name === "From")?.value || "";
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";
      const snippet = fullMessage.data.snippet || "";
      const billInfo = extractBillInfo(from, subject, snippet);
      if (billInfo.confidence > 0.3) {
        emailBills.push({
          id: message.id,
          from,
          subject,
          date,
          snippet,
          ...billInfo
        });
      }
    } catch (err) {
      console.error("Error fetching message:", err);
    }
  }
  return emailBills.sort((a, b) => b.confidence - a.confidence);
}
function extractBillInfo(from, subject, snippet) {
  const text2 = `${from} ${subject} ${snippet}`.toLowerCase();
  let confidence = 0;
  for (const keyword of BILL_KEYWORDS) {
    if (text2.includes(keyword.toLowerCase())) {
      confidence += 0.1;
    }
  }
  for (const sender of BILL_SENDERS) {
    if (from.toLowerCase().includes(sender)) {
      confidence += 0.15;
    }
  }
  const amountMatch = text2.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", "")) : null;
  if (amount && amount > 5 && amount < 1e4) {
    confidence += 0.2;
  }
  const dueDatePatterns = [
    /due\s*(?:date|by|on)?:?\s*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /payment\s+due:?\s*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/
  ];
  let dueDate = null;
  for (const pattern of dueDatePatterns) {
    const match = text2.match(pattern);
    if (match) {
      dueDate = match[1];
      confidence += 0.1;
      break;
    }
  }
  const company = extractCompanyName(from, subject);
  const category = categorizeEmail(text2);
  confidence = Math.min(confidence, 1);
  return { company, amount, dueDate, category, confidence };
}
function extractCompanyName(from, subject) {
  const emailMatch = from.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : from;
  const nameMatch = from.match(/^([^<]+)/);
  if (nameMatch && nameMatch[1].trim() && !nameMatch[1].includes("@")) {
    return nameMatch[1].trim().replace(/"/g, "");
  }
  const domain = email.split("@")[1];
  if (domain) {
    const parts = domain.split(".");
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
  }
  return "Unknown";
}
function categorizeEmail(text2) {
  const categories = {
    "utilities": ["hydro", "electricity", "gas", "water", "utility", "enbridge"],
    "phone": ["phone", "mobile", "wireless", "rogers", "bell", "telus", "fido", "koodo", "virgin"],
    "internet": ["internet", "wifi", "broadband", "shaw", "cable"],
    "insurance": ["insurance", "coverage", "policy", "premium"],
    "subscription": ["subscription", "netflix", "spotify", "amazon", "disney", "membership"],
    "credit-card": ["credit card", "visa", "mastercard", "amex"],
    "banking": ["bank", "td", "rbc", "scotiabank", "bmo", "cibc", "mortgage"],
    "housing": ["rent", "lease", "property", "condo"]
  };
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (text2.includes(keyword)) {
        return category;
      }
    }
  }
  return "other";
}

// server/routes.ts
init_email();
import nodemailer from "nodemailer";
import Stripe from "stripe";
import express from "express";
import path from "path";
import fs from "fs";
var accessTokens = /* @__PURE__ */ new Map();
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not found. Stripe functionality will be disabled.");
}
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil"
}) : null;
var endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
async function registerRoutes(app2) {
  await initializeStorage();
  app2.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      time: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0",
      env: process.env.NODE_ENV || "development"
    });
  });
  app2.post("/api/auth/welcome-email", async (req, res) => {
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
    } catch (error) {
      console.error("Welcome email endpoint error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error"
      });
    }
  });
  app2.get("/admin/config-report", async (req, res) => {
    try {
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
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "success",
        ...auditResult
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to run configuration audit",
        message: error.message || "Unknown error occurred"
      });
    }
  });
  app2.get("/api/firebase-test", async (req, res) => {
    try {
      const { db: db2 } = getFirebaseAdmin();
      const testDoc = {
        message: "Hello from MyBillPort!",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        testId: Math.random().toString(36).substr(2, 9)
      };
      const docRef = db2.collection("diagnostics").doc("hello");
      await docRef.set(testDoc);
      const docSnap = await docRef.get();
      const readData = docSnap.data();
      res.json({
        success: true,
        message: "Firebase Admin SDK test successful",
        writeData: testDoc,
        readData,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Firebase test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Unknown error occurred",
        message: "Firebase Admin SDK test failed"
      });
    }
  });
  const { registerEmailTestRoutes: registerEmailTestRoutes2 } = await Promise.resolve().then(() => (init_email_test(), email_test_exports));
  const { registerAdminRoutes: registerAdminRoutes2 } = await Promise.resolve().then(() => (init_admin_config(), admin_config_exports));
  registerEmailTestRoutes2(app2);
  registerAdminRoutes2(app2);
  let DEMO_USER_ID = "";
  (async () => {
    try {
      const existingUser = await storage.getUserByUsername("johndoe");
      if (existingUser) {
        DEMO_USER_ID = existingUser.id;
        console.log("\u2705 Loaded existing demo user:", DEMO_USER_ID);
      }
    } catch (error) {
      console.log("No existing demo user found, use /api/seed to create one");
    }
  })();
  app2.post("/api/seed", async (req, res) => {
    try {
      const userId = await seedDatabase();
      if (userId) {
        DEMO_USER_ID = userId;
        res.json({ success: true, message: "Database seeded successfully", userId });
      } else {
        const existingUser = await storage.getUserByUsername("johndoe");
        if (existingUser) {
          DEMO_USER_ID = existingUser.id;
          res.json({ success: true, message: "Database already seeded", userId: existingUser.id });
        } else {
          res.json({ success: true, message: "Database already seeded" });
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/bills", async (req, res) => {
    try {
      const bills2 = await storage.getBillsByUserId(DEMO_USER_ID);
      res.json(bills2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });
  app2.post("/api/bills", async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        userId: DEMO_USER_ID,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : void 0
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
  app2.delete("/api/bills/:id", async (req, res) => {
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
  app2.post("/api/request-money", async (req, res) => {
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
    } catch (error) {
      console.error("Request money error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error"
      });
    }
  });
  app2.post("/api/bills/:id/pay", async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.getBill(id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      const payment = await storage.createPayment({
        billId: id,
        userId: DEMO_USER_ID,
        amount: bill.amount,
        status: "completed"
      });
      await storage.updateBill(id, { isPaid: 1 });
      await storage.createReward({
        userId: DEMO_USER_ID,
        points: Math.floor(parseFloat(bill.amount) / 10),
        // 1 point per $10
        title: "Payment Reward",
        description: `Earned for paying ${bill.name}`,
        isRedeemed: 0
      });
      res.json({ payment, message: "Payment processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  app2.get("/api/payments", async (req, res) => {
    try {
      const payments2 = await storage.getPaymentsByUserId(DEMO_USER_ID);
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  app2.get("/api/rewards", async (req, res) => {
    try {
      const rewards2 = await storage.getRewardsByUserId(DEMO_USER_ID);
      res.json(rewards2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });
  app2.post("/api/rewards/:id/redeem", async (req, res) => {
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
  app2.post("/api/bills/scan", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.length < 10) {
        const sampleResult = {
          company: "Sample Utility Co",
          amount: 125.5,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
          accountNumber: "****-****-1234",
          category: "Electricity",
          type: "utility",
          confidence: 85,
          extractedText: "Sample bill data - Anthropic API key needed for real scanning"
        };
        return res.json(sampleResult);
      }
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
      console.log("Processing bill image with AI scanner...");
      const scanResult = await scanBillImage(base64Image);
      console.log("AI scan result:", scanResult);
      res.json(scanResult);
    } catch (error) {
      console.error("Bill scanning error:", error);
      const fallbackResult = {
        company: "Utility Company",
        amount: 99.99,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        accountNumber: "****-****-5678",
        category: "Utility",
        type: "utility",
        confidence: 75,
        extractedText: "Fallback data - AI scanning temporarily unavailable"
      };
      res.json(fallbackResult);
    }
  });
  app2.post("/api/accounts/from-bill", async (req, res) => {
    try {
      const { company, accountNumber, category, type } = req.body;
      if (!company || !accountNumber) {
        return res.status(400).json({ error: "Company and account number are required" });
      }
      const account = {
        id: Date.now().toString(),
        company,
        accountNumber,
        category,
        type,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      };
      console.log("Created account from bill scan:", account);
      res.json({
        success: true,
        account,
        message: `Account for ${company} has been added to your profile`
      });
    } catch (error) {
      console.error("Account creation error:", error);
      res.status(500).json({
        error: "Failed to create account",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/create_link_token", async (req, res) => {
    try {
      const request = {
        user: {
          client_user_id: DEMO_USER_ID.toString()
        },
        client_name: "MyBillPort",
        products: ["transactions"],
        country_codes: ["CA"],
        language: "en"
      };
      const response = await plaidClient.linkTokenCreate(request);
      res.json({ link_token: response.data.link_token });
    } catch (error) {
      console.error("Plaid Link Token Error:", error);
      res.status(500).json({
        error: "Unable to create link token",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/exchange_public_token", async (req, res) => {
    try {
      const { public_token } = req.body;
      if (!public_token) {
        return res.status(400).json({ error: "public_token is required" });
      }
      const request = {
        public_token
      };
      const response = await plaidClient.itemPublicTokenExchange(request);
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;
      accessTokens.set(DEMO_USER_ID.toString(), accessToken);
      res.json({
        access_token: accessToken,
        item_id: itemId,
        message: "Bank account connected successfully"
      });
    } catch (error) {
      console.error("Plaid Token Exchange Error:", error);
      res.status(500).json({
        error: "Unable to exchange public token",
        details: error instanceof Error ? error.message : "Unknown error",
        debug: process.env.NODE_ENV === "development" ? {
          public_token: req.body.public_token,
          plaid_env: process.env.PLAID_ENV
        } : void 0
      });
    }
  });
  app2.get("/api/accounts", async (req, res) => {
    try {
      const accessToken = accessTokens.get(DEMO_USER_ID.toString());
      if (!accessToken) {
        return res.status(400).json({
          error: "No bank account connected. Please connect your bank account first."
        });
      }
      const request = {
        access_token: accessToken
      };
      const response = await plaidClient.accountsGet(request);
      const accounts = response.data.accounts.map((account) => ({
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
        accounts,
        institution: response.data.item.institution_id
      });
    } catch (error) {
      console.error("Plaid Accounts Error:", error);
      res.status(500).json({
        error: "Unable to fetch accounts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const accessToken = accessTokens.get(DEMO_USER_ID.toString());
      if (!accessToken) {
        return res.status(400).json({
          error: "No bank account connected. Please connect your bank account first."
        });
      }
      const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const request = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
          offset: 0
        }
      };
      const response = await plaidClient.transactionsGet(request);
      const transactions = response.data.transactions.map((txn) => ({
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
      console.error("Plaid Transactions Error:", error);
      res.status(500).json({
        error: "Unable to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/recurring-bills", async (req, res) => {
    try {
      const accessToken = accessTokens.get(DEMO_USER_ID.toString());
      if (!accessToken) {
        return res.status(400).json({
          error: "No bank account connected. Please connect your bank account first."
        });
      }
      const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const request = {
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
      const merchantCounts = /* @__PURE__ */ new Map();
      transactions.forEach((txn) => {
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
      const recurringBills = [];
      merchantCounts.forEach((data, merchant) => {
        if (data.count >= 2) {
          const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
          const sortedDates = data.dates.sort();
          let frequency = "monthly";
          let confidence = 50;
          if (data.count >= 3) {
            const daysBetween = [];
            for (let i = 1; i < sortedDates.length; i++) {
              const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / (1e3 * 60 * 60 * 24);
              daysBetween.push(diff);
            }
            const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
            if (avgDays <= 10) {
              frequency = "weekly";
              confidence = 70;
            } else if (avgDays <= 20) {
              frequency = "bi-weekly";
              confidence = 75;
            } else if (avgDays <= 35) {
              frequency = "monthly";
              confidence = 85;
            } else if (avgDays <= 100) {
              frequency = "quarterly";
              confidence = 60;
            } else {
              frequency = "annual";
              confidence = 40;
            }
            confidence = Math.min(95, confidence + (data.count - 2) * 5);
          }
          let category = "Other";
          if (data.category) {
            const cats = data.category.map((c) => c.toLowerCase());
            if (cats.some((c) => c.includes("utilities"))) category = "Utilities";
            else if (cats.some((c) => c.includes("subscription") || c.includes("streaming"))) category = "Subscription";
            else if (cats.some((c) => c.includes("insurance"))) category = "Insurance";
            else if (cats.some((c) => c.includes("phone") || c.includes("telecom"))) category = "Phone";
            else if (cats.some((c) => c.includes("internet"))) category = "Internet";
            else if (cats.some((c) => c.includes("gym") || c.includes("fitness"))) category = "Fitness";
            else if (cats.some((c) => c.includes("rent") || c.includes("mortgage"))) category = "Housing";
            else category = data.category[0] || "Other";
          }
          const lowerMerchant = merchant.toLowerCase();
          if (lowerMerchant.includes("netflix") || lowerMerchant.includes("spotify") || lowerMerchant.includes("disney") || lowerMerchant.includes("hulu") || lowerMerchant.includes("amazon prime") || lowerMerchant.includes("apple")) {
            category = "Subscription";
          } else if (lowerMerchant.includes("hydro") || lowerMerchant.includes("electric") || lowerMerchant.includes("gas") || lowerMerchant.includes("water")) {
            category = "Utilities";
          } else if (lowerMerchant.includes("rogers") || lowerMerchant.includes("bell") || lowerMerchant.includes("telus") || lowerMerchant.includes("fido")) {
            category = "Phone";
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
      recurringBills.sort((a, b) => b.confidence - a.confidence || b.averageAmount - a.averageAmount);
      res.json({
        recurring_bills: recurringBills,
        analysis_period: { start_date: startDate, end_date: endDate },
        total_transactions_analyzed: transactions.length
      });
    } catch (error) {
      console.error("Recurring Bills Detection Error:", error);
      res.status(500).json({
        error: "Unable to detect recurring bills",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/payment-request/send", async (req, res) => {
    try {
      const { recipientEmail, amount, message } = req.body;
      if (!recipientEmail || !amount || !message) {
        return res.status(400).json({ error: "Missing required fields: email, amount, and message are required" });
      }
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">\u{1F4B0} Payment Request</h1>
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
      const emailService = await Promise.resolve().then(() => (init_email(), email_exports));
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
          amount,
          recipient: recipientEmail,
          message
        }
      });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({
        error: "Failed to send payment request email",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/notifications/profile-update", async (req, res) => {
    try {
      const { email, phoneNumber, displayName, changes } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.FROM_EMAIL || "noreply@example.com",
          pass: process.env.SMTP_PASSWORD || "CONFIGURE_SMTP_PASSWORD"
        }
      });
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">\u2705 Profile Updated</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort Account Changes</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Account Information Updated</h2>
            
            <p style="color: #666;">Hi ${displayName || "there"},</p>
            <p style="color: #666;">Your MyBillPort profile has been successfully updated with the following information:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${changes.name || "Not provided"}</p>
              <p><strong>Email:</strong> ${changes.email || "Not provided"}</p>
              <p><strong>Phone:</strong> ${changes.phone || "Not provided"}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>\u{1F512} Security Notice:</strong> If you didn't make these changes, please contact us immediately at mybillportinfo@gmail.com</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">MyBillPort - Your Personal Finance Assistant</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For any questions, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `;
      const mailOptions = {
        from: "MyBillPort <mybillportinfo@gmail.com>",
        to: email,
        subject: "\u2705 MyBillPort Profile Updated - Confirmation",
        html: emailContent
      };
      await transporter.sendMail(mailOptions);
      if (phoneNumber && phoneNumber.length > 0) {
        console.log(`SMS notification sent to ${phoneNumber}:`);
        console.log(`"MyBillPort: Your profile has been updated successfully. Changes: Name: ${changes.name}, Email: ${changes.email}, Phone: ${changes.phone}. If this wasn't you, contact mybillportinfo@gmail.com immediately."`);
      }
      res.json({
        success: true,
        message: "Profile update notifications sent",
        sentTo: {
          email,
          sms: phoneNumber ? phoneNumber : null
        }
      });
    } catch (error) {
      console.error("Profile notification error:", error);
      res.status(500).json({
        error: "Failed to send profile update notifications",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/email-test", async (req, res) => {
    try {
      if (!process.env.TEST_EMAIL) {
        return res.status(400).json({
          error: "TEST_EMAIL environment variable not set"
        });
      }
      const { sendPaymentRequestEmail: sendPaymentRequestEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const result = await sendPaymentRequestEmail2({
        to: process.env.TEST_EMAIL,
        amount: 25,
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
      console.error("Email test error:", error);
      res.status(500).json({
        error: "Email test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      });
    }
  });
  app2.post("/api/reminders/process", async (req, res) => {
    try {
      const { processReminders: processReminders2 } = await Promise.resolve().then(() => (init_reminder_service(), reminder_service_exports));
      const results = await processReminders2();
      res.json({
        success: true,
        message: `Processed ${results.length} reminders`,
        results
      });
    } catch (error) {
      console.error("Reminder processing error:", error);
      res.status(500).json({
        error: "Failed to process reminders",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/reminders/test", async (req, res) => {
    try {
      const { email, billId, reminderType } = req.body;
      if (!email || !billId) {
        return res.status(400).json({ error: "Email and billId required" });
      }
      const { sendTestReminder: sendTestReminder2 } = await Promise.resolve().then(() => (init_reminder_service(), reminder_service_exports));
      const result = await sendTestReminder2(email, billId, reminderType || "2-days");
      res.json({ success: result.success, result });
    } catch (error) {
      res.status(500).json({
        error: "Failed to send test reminder",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe || !endpointSecret) {
      return res.status(400).send("Stripe not configured");
    }
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment successful:", paymentIntent.id);
        try {
          const intentBillId = paymentIntent.metadata?.billId;
          if (intentBillId) {
            const paymentRecord = {
              billId: intentBillId,
              userId: "demo-user-1",
              // You can get this from bill lookup
              amount: (paymentIntent.amount / 100).toString(),
              // Convert from cents
              status: "completed"
            };
            await storage.createPayment(paymentRecord);
            console.log(`\u{1F4B0} Payment record created for intent ${paymentIntent.id}`);
          }
          if (intentBillId) {
            const updatedBill = await storage.updateBillStatus(intentBillId, "paid");
            if (updatedBill) {
              console.log(`\u2705 Bill ${intentBillId} marked as paid (payment intent ${paymentIntent.id})`);
            } else {
              console.log(`\u26A0\uFE0F Bill ${intentBillId} not found`);
            }
          }
        } catch (error) {
          console.error("Failed to process payment intent:", error);
        }
        break;
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Checkout session completed:", session.id);
        try {
          const sessionBillId = session.metadata?.billId;
          if (sessionBillId && session.amount_total) {
            const paymentRecord = {
              billId: sessionBillId,
              userId: "demo-user-1",
              // You can get this from session or bill lookup
              amount: (session.amount_total / 100).toString(),
              // Convert from cents
              status: "completed"
            };
            await storage.createPayment(paymentRecord);
            console.log(`\u{1F4B0} Payment record created for session ${session.id}`);
          }
          if (sessionBillId) {
            const updatedBill = await storage.updateBillStatus(sessionBillId, "paid");
            if (updatedBill) {
              console.log(`\u2705 Bill ${sessionBillId} marked as paid (checkout session ${session.id})`);
            } else {
              console.log(`\u26A0\uFE0F Bill ${sessionBillId} not found`);
            }
          }
        } catch (error) {
          console.error("Failed to process checkout session:", error);
        }
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("\u274C Payment failed:", failedPayment.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  });
  app2.post("/api/checkout", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    try {
      const { billId, billName, amount, email } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email || void 0,
        line_items: [{
          price_data: {
            currency: "cad",
            // Canadian dollars for MyBillPort
            product_data: { name: billName || "Bill Payment" },
            unit_amount: Math.round(Number(amount) * 100)
            // Convert to cents
          },
          quantity: 1
        }],
        success_url: `${req.headers.origin || "https://mybillport.com"}/dashboard?payment=success`,
        cancel_url: `${req.headers.origin || "https://mybillport.com"}/dashboard?payment=cancelled`,
        metadata: { billId: billId || "" }
        // Important for webhook handling
      });
      res.json({
        id: session.id,
        url: session.url
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        message: error.message
      });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    try {
      const { amount, billId, description } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "cad",
        // Canadian dollars
        description: description || "Bill payment",
        metadata: {
          billId: billId || ""
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        error: "Failed to create payment intent",
        message: error.message
      });
    }
  });
  app2.get("/api/payment-status/:paymentIntentId", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        // Convert back from cents
        currency: paymentIntent.currency
      });
    } catch (error) {
      console.error("Error retrieving payment status:", error);
      res.status(500).json({
        error: "Failed to retrieve payment status",
        message: error.message
      });
    }
  });
  app2.get("/api/transactions/sync", async (req, res) => {
    try {
      const mockTransactions = [
        {
          id: "txn_1",
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          description: "Hydro Quebec",
          amount: -89.5,
          category: "utilities",
          suggested_bill: {
            name: "Electricity Bill",
            company: "Hydro Quebec",
            amount: 89.5,
            frequency: "monthly"
          }
        },
        {
          id: "txn_2",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
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
        suggested_bills: mockTransactions.map((t) => t.suggested_bill),
        message: "Transactions synced successfully"
      });
    } catch (error) {
      console.error("Transaction sync failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to sync transactions"
      });
    }
  });
  app2.get("/api/gmail/status", async (req, res) => {
    try {
      const status = await getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.json({ connected: false });
    }
  });
  app2.get("/api/gmail/connect", async (req, res) => {
    try {
      const { authUrl } = getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Gmail connect error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate auth URL",
        needsCredentials: error.message?.includes("not configured")
      });
    }
  });
  app2.get("/api/gmail/callback", async (req, res) => {
    try {
      const code = req.query.code;
      const state = req.query.state;
      if (!code) {
        return res.redirect("/email-bills?error=no_code");
      }
      if (!validateState(state)) {
        return res.redirect("/email-bills?error=invalid_state");
      }
      const result = await handleCallback(code);
      res.redirect(`/email-bills?connected=true&email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      console.error("Gmail callback error:", error);
      res.redirect(`/email-bills?error=${encodeURIComponent(error.message)}`);
    }
  });
  app2.post("/api/gmail/disconnect", async (req, res) => {
    try {
      await disconnectGmail();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/email-bills", async (req, res) => {
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
    } catch (error) {
      console.error("Email bills scan failed:", error);
      const errorMessage = error.message?.toLowerCase() || "";
      if (errorMessage.includes("gmail not connected") || errorMessage.includes("please connect") || errorMessage.includes("token expired")) {
        return res.status(400).json({
          success: false,
          error: "Gmail not connected or session expired. Please reconnect your Gmail account.",
          needsConnection: true
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || "Failed to scan emails"
      });
    }
  });
  const devPublicDir = path.resolve(process.cwd(), "client", "public");
  const prodPublicDir = path.resolve(process.cwd(), "dist", "public");
  const getStaticFilePath = (filename) => {
    const devPath = path.join(devPublicDir, filename);
    const prodPath = path.join(prodPublicDir, filename);
    if (fs.existsSync(devPath)) return devPath;
    if (fs.existsSync(prodPath)) return prodPath;
    return null;
  };
  app2.get("/privacy", (req, res) => {
    const privacyPath = getStaticFilePath("privacy.html");
    if (privacyPath) {
      res.sendFile(privacyPath);
    } else {
      res.status(404).send("Privacy page not found");
    }
  });
  app2.get("/privacy.html", (req, res) => {
    res.redirect("/privacy");
  });
  app2.get("/terms", (req, res) => {
    const termsPath = getStaticFilePath("terms.html");
    if (termsPath) {
      res.sendFile(termsPath);
    } else {
      res.status(404).send("Terms page not found");
    }
  });
  app2.get("/terms.html", (req, res) => {
    res.redirect("/terms");
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? [/\.replit\.app$/, /\.repl\.co$/] : ["http://localhost:3000", "http://localhost:5173", /\.replit\.app$/, /\.repl\.co$/],
  credentials: true
}));
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    const REMINDER_INTERVAL = 24 * 60 * 60 * 1e3;
    setInterval(async () => {
      try {
        const { processReminders: processReminders2 } = await Promise.resolve().then(() => (init_reminder_service(), reminder_service_exports));
        const results = await processReminders2();
        log(`\u{1F4E7} Daily reminders processed: ${results.length} sent`);
      } catch (error) {
        console.error("Failed to process daily reminders:", error);
      }
    }, REMINDER_INTERVAL);
    setTimeout(async () => {
      try {
        const { processReminders: processReminders2 } = await Promise.resolve().then(() => (init_reminder_service(), reminder_service_exports));
        const results = await processReminders2();
        log(`\u{1F4E7} Initial reminder check: ${results.length} sent`);
      } catch (error) {
        console.error("Initial reminder check failed:", error);
      }
    }, 6e4);
  });
})();
