import type { Express } from "express";
import { sendPaymentRequestEmail } from "../../services/email";

export function registerEmailTestRoutes(app: Express) {
  // Test email endpoint
  app.post("/email-test", async (req, res) => {
    const testEmail = process.env.TEST_EMAIL;
    const mailerSendKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const fromName = process.env.FROM_NAME;

    // Check for missing secrets
    if (!mailerSendKey) {
      return res.status(400).json({
        error: "Email test failed",
        details: "MAILERSEND_API_KEY is not set in environment variables",
        statusCode: 400
      });
    }

    if (!testEmail) {
      return res.status(400).json({
        error: "Email test failed", 
        details: "TEST_EMAIL is not set in environment variables",
        statusCode: 400
      });
    }

    if (!fromEmail) {
      return res.status(400).json({
        error: "Email test failed",
        details: "FROM_EMAIL is not set. Please verify your sender domain in MailerSend.",
        statusCode: 400
      });
    }

    try {
      const result = await sendPaymentRequestEmail({
        to: testEmail,
        name: "Test User",
        amount: 25.50,
        note: "This is a test payment request from MyBillPort email system"
      });

      if (result.success) {
        res.json({
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          details: {
            recipient: testEmail,
            sender: fromEmail || "mybillport@trial-351ndgwr0p8lzqx8.mlsender.net",
            senderName: fromName || "MyBillPort",
            apiKeyConfigured: !!mailerSendKey
          }
        });
      } else {
        res.status(500).json({
          error: "Email sending failed",
          details: result.error || "Unknown error occurred",
          statusCode: 500,
          troubleshooting: {
            checkApiKey: !mailerSendKey ? "MAILERSEND_API_KEY is missing" : "API key is configured",
            checkSender: !fromEmail ? "FROM_EMAIL not configured, using default trial domain" : `Using ${fromEmail}`,
            verificationNeeded: "Ensure sender email/domain is verified in MailerSend dashboard"
          }
        });
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      res.status(500).json({
        error: "Email test failed",
        details: error.message || "Unknown error occurred",
        statusCode: 500,
        troubleshooting: {
          possibleCauses: [
            "Invalid MAILERSEND_API_KEY",
            "Sender email not verified in MailerSend",
            "API rate limits exceeded",
            "Network connectivity issues"
          ]
        }
      });
    }
  });
}