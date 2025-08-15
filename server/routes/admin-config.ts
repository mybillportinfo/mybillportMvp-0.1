import type { Express } from "express";

export function registerAdminRoutes(app: Express) {
  // Admin configuration report endpoint
  app.get("/admin/config-report", async (req, res) => {
    const config = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      secrets: {
        mailersend: {
          apiKey: !!process.env.MAILERSEND_API_KEY,
          keyLength: process.env.MAILERSEND_API_KEY?.length || 0,
          keyPrefix: process.env.MAILERSEND_API_KEY?.substring(0, 8) + "..." || "not set"
        },
        firebase: {
          apiKey: !!process.env.VITE_FIREBASE_API_KEY,
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || "not set",
          appId: !!process.env.VITE_FIREBASE_APP_ID
        },
        email: {
          fromEmail: process.env.FROM_EMAIL || "using default trial domain",
          fromName: process.env.FROM_NAME || "MyBillPort",
          testEmail: process.env.TEST_EMAIL || "not set"
        },
        database: {
          databaseUrl: !!process.env.DATABASE_URL,
          pgHost: process.env.PGHOST || "not set",
          pgPort: process.env.PGPORT || "not set",
          pgDatabase: process.env.PGDATABASE || "not set"
        }
      },
      firebaseConfig: {
        hasApiKey: !!process.env.VITE_FIREBASE_API_KEY,
        hasProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
        hasAppId: !!process.env.VITE_FIREBASE_APP_ID,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      },
      recommendations: [] as string[]
    };

    // Add recommendations based on missing config
    if (!process.env.MAILERSEND_API_KEY) {
      config.recommendations.push("Set MAILERSEND_API_KEY for email functionality");
    }
    if (!process.env.FROM_EMAIL) {
      config.recommendations.push("Set FROM_EMAIL with a verified sender domain");
    }
    if (!process.env.TEST_EMAIL) {
      config.recommendations.push("Set TEST_EMAIL for testing email functionality");
    }
    if (!process.env.VITE_FIREBASE_PROJECT_ID) {
      config.recommendations.push("Set Firebase configuration for authentication");
    }

    res.json(config);
  });
}