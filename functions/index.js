const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

admin.initializeApp();

const mailerSendApiKey = defineSecret("MAILERSEND_API_KEY");

function formatFeedbackEmail(data) {
  const category = data.category || "General";
  const message = data.message || "(No message provided)";
  const userEmail = data.userEmail || "Anonymous";
  const userName = data.userName || "Unknown";
  const status = data.status || "new";
  const page = data.page || "/";
  const userAgent = data.userAgent || "Not provided";
  const createdAt = data.createdAt
    ? data.createdAt.toDate
      ? data.createdAt.toDate().toLocaleString("en-CA", { timeZone: "America/Toronto" })
      : new Date(data.createdAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })
    : new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" });

  const subject = `[BillPort Feedback] ${category} – from ${userEmail}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e293b; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; font-size: 20px; margin: 0;">
          <span style="color: #2dd4bf;">BillPort</span> – New Feedback
        </h1>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; width: 120px; vertical-align: top;">Category</td>
            <td style="padding: 8px 12px; color: #1e293b;">
              <span style="background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 500;">${category}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">From</td>
            <td style="padding: 8px 12px; color: #1e293b;">${userName} &lt;${userEmail}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">Date</td>
            <td style="padding: 8px 12px; color: #1e293b;">${createdAt}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">Status</td>
            <td style="padding: 8px 12px; color: #1e293b;">
              <span style="background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 500;">${status}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">Page</td>
            <td style="padding: 8px 12px; color: #1e293b; font-family: monospace; font-size: 13px;">${page}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 16px 12px 8px;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 8px;">Message</div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 16px 12px 4px;">
              <details style="cursor: pointer;">
                <summary style="font-weight: 600; color: #94a3b8; font-size: 12px;">User Agent</summary>
                <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; word-break: break-all;">${userAgent}</p>
              </details>
            </td>
          </tr>
        </table>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
        Sent automatically by MyBillPort Cloud Functions
      </p>
    </div>
  `;

  return { subject, html };
}

// --- Feedback Email ---
exports.sendFeedbackEmail = onDocumentCreated(
  {
    document: "feedback/{feedbackId}",
    secrets: [mailerSendApiKey],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { subject, html } = formatFeedbackEmail(data);

    const mailerSend = new MailerSend({ apiKey: mailerSendApiKey.value() });
    const sentFrom = new Sender("no-reply@mybillport.com", "MyBillPort");
    const recipients = [new Recipient("mybillportinfo@gmail.com", "Admin")];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(data.userEmail ? new Sender(data.userEmail, data.userName || "User") : sentFrom)
      .setSubject(subject)
      .setHtml(html);

    try {
      await mailerSend.email.send(emailParams);
    } catch (error) {
      console.error("Failed to send feedback email:", error);
      throw error;
    }
  }
);

// --- Security: Report Suspicious Activity (Callable) ---
exports.reportSuspiciousActivity = onCall(
  { enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const userId = request.auth.uid;
    const { activityType, details, confidence, metadata } = request.data;

    if (!activityType || !details || !confidence) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const validTypes = ["rapid_bill_creation", "excessive_scan_failures", "suspicious_payment", "other"];
    if (!validTypes.includes(activityType)) {
      throw new HttpsError("invalid-argument", "Invalid activity type");
    }

    const validConfidence = ["low", "medium", "high"];
    if (!validConfidence.includes(confidence)) {
      throw new HttpsError("invalid-argument", "Invalid confidence level");
    }

    const report = {
      userId,
      activityType,
      details: String(details).slice(0, 500),
      confidence,
      metadata: metadata || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false,
    };

    const severity = confidence === "high" ? "WARNING" : "INFO";
    console.log(JSON.stringify({
      severity,
      message: `[SECURITY] ${activityType}: ${details}`,
      userId: userId.substring(0, 8) + "...",
      confidence,
    }));

    await admin.firestore().collection("securityReports").add(report);

    if (confidence === "high") {
      try {
        const mailerSend = new MailerSend({ apiKey: mailerSendApiKey.value() });
        const sentFrom = new Sender("no-reply@mybillport.com", "MyBillPort Security");
        const recipients = [new Recipient("mybillportinfo@gmail.com", "Admin")];

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject(`[BillPort SECURITY ALERT] ${activityType}`)
          .setHtml(`
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #dc2626; padding: 16px 24px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #fff; font-size: 18px; margin: 0;">Security Alert - High Confidence</h1>
              </div>
              <div style="background: #fef2f2; padding: 24px; border: 1px solid #fecaca; border-radius: 0 0 12px 12px;">
                <p><strong>Type:</strong> ${activityType}</p>
                <p><strong>Details:</strong> ${details}</p>
                <p><strong>User:</strong> ${userId.substring(0, 8)}...</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" })}</p>
              </div>
            </div>
          `);

        await mailerSend.email.send(emailParams);
      } catch (emailError) {
        console.error("Failed to send security alert email:", emailError);
      }
    }

    return { success: true };
  }
);

// --- Security: Monitor Bill Creation Rate (Firestore Trigger) ---
exports.monitorBillCreationRate = onDocumentCreated(
  { document: "bills/{billId}" },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const userId = data.userId;
    if (!userId) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const billsQuery = await admin.firestore()
      .collection("bills")
      .where("userId", "==", userId)
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(oneHourAgo))
      .get();

    const recentCount = billsQuery.size;

    if (recentCount > 20) {
      console.log(JSON.stringify({
        severity: "WARNING",
        message: `[SECURITY] Rapid bill creation detected: ${recentCount} bills in 1 hour`,
        userId: userId.substring(0, 8) + "...",
        count: recentCount,
      }));

      await admin.firestore().collection("securityReports").add({
        userId,
        activityType: "rapid_bill_creation_server",
        details: `Server detected ${recentCount} bills created in the last hour`,
        confidence: recentCount > 40 ? "high" : "medium",
        metadata: { count: recentCount },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        resolved: false,
      });
    }
  }
);

// --- Daily Usage Report (Scheduled - 8 AM Toronto time) ---
exports.dailyUsageReport = onSchedule(
  {
    schedule: "0 8 * * *",
    timeZone: "America/Toronto",
    secrets: [mailerSendApiKey],
  },
  async () => {
    const db = admin.firestore();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayTs = admin.firestore.Timestamp.fromDate(yesterday);
    const todayTs = admin.firestore.Timestamp.fromDate(todayStart);

    const [billsSnap, paymentsSnap, feedbackSnap, securitySnap] = await Promise.all([
      db.collection("bills")
        .where("createdAt", ">=", yesterdayTs)
        .where("createdAt", "<", todayTs)
        .get(),
      db.collection("payments")
        .where("timestamp", ">=", yesterdayTs)
        .where("timestamp", "<", todayTs)
        .get(),
      db.collection("feedback")
        .where("createdAt", ">=", yesterdayTs)
        .where("createdAt", "<", todayTs)
        .get(),
      db.collection("securityReports")
        .where("createdAt", ">=", yesterdayTs)
        .where("createdAt", "<", todayTs)
        .get(),
    ]);

    const uniqueUserIds = new Set();
    billsSnap.forEach(doc => uniqueUserIds.add(doc.data().userId));
    paymentsSnap.forEach(doc => uniqueUserIds.add(doc.data().userId));

    const report = {
      date: yesterday.toISOString().split("T")[0],
      newBills: billsSnap.size,
      billsPaid: paymentsSnap.size,
      feedbackReceived: feedbackSnap.size,
      securityReports: securitySnap.size,
      activeUsers: uniqueUserIds.size,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("dailyReports").add(report);

    const dateStr = yesterday.toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Toronto",
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e293b; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; font-size: 20px; margin: 0;">
            <span style="color: #2dd4bf;">BillPort</span> – Daily Report
          </h1>
          <p style="color: #94a3b8; margin: 4px 0 0; font-size: 14px;">${dateStr}</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Active Users</td>
              <td style="padding: 12px; color: #1e293b; font-size: 24px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">${report.activeUsers}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">New Bills Added</td>
              <td style="padding: 12px; color: #1e293b; font-size: 24px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">${report.newBills}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Bills Paid</td>
              <td style="padding: 12px; color: #2dd4bf; font-size: 24px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">${report.billsPaid}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Feedback Received</td>
              <td style="padding: 12px; color: #1e293b; font-size: 24px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">${report.feedbackReceived}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #475569;">Security Alerts</td>
              <td style="padding: 12px; color: ${report.securityReports > 0 ? '#dc2626' : '#16a34a'}; font-size: 24px; font-weight: 700; text-align: right;">${report.securityReports}</td>
            </tr>
          </table>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
          Generated at ${now.toLocaleString("en-CA", { timeZone: "America/Toronto" })} ET
        </p>
      </div>
    `;

    try {
      const mailerSend = new MailerSend({ apiKey: mailerSendApiKey.value() });
      const sentFrom = new Sender("no-reply@mybillport.com", "MyBillPort Reports");
      const recipients = [new Recipient("mybillportinfo@gmail.com", "Admin")];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`[BillPort] Daily Report – ${report.date}`)
        .setHtml(html);

      await mailerSend.email.send(emailParams);
    } catch (error) {
      console.error("Failed to send daily report email:", error);
    }
  }
);
