import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Helper to clean API key in case it has extra prefix characters
function getCleanApiKey(): string {
  let apiKey = process.env.MAILERSEND_API_KEY?.trim() || '';
  if (apiKey.includes('mlsn.')) {
    const mlsnIndex = apiKey.indexOf('mlsn.');
    if (mlsnIndex > 0) {
      apiKey = apiKey.substring(mlsnIndex);
    }
  }
  return apiKey;
}

// Use verified MailerSend test domain (Gmail domains can't be verified)
const fromEmail = 'mybillport@test-nrw7gymn9wng2k8e.mlsender.net';
const fromName = process.env.FROM_NAME || 'MyBillPort';

// Create MailerSend client with cleaned API key
function getMailerSendClient(): MailerSend {
  return new MailerSend({ apiKey: getCleanApiKey() });
}

export async function sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = getCleanApiKey();
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      return { success: true, messageId: 'demo-test-email' };
    }

    const mailerSend = getMailerSendClient();
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('MyBillPort Email Test')
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">MyBillPort Email Test</h1>
          <p>This is a test email from your MyBillPort application.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your email service is working correctly!</p>
        </div>
      `);

    const response = await mailerSend.email.send(emailParams);
    return { success: true, messageId: response.body?.message_id };

  } catch (error: any) {
    console.error('Test email failed:', error);
    return { success: false, error: error.message };
  }
}

type ReminderType = '7-days' | '2-days' | 'due-today' | 'overdue';

function getReminderConfig(type: ReminderType): { subject: string; header: string; message: string; color: string; borderColor: string } {
  switch (type) {
    case '7-days':
      return {
        subject: '📅 Upcoming Bill',
        header: 'Bill Due in 7 Days',
        message: 'You have a bill coming up in 7 days. Plan ahead to avoid missing the due date.',
        color: '#10b981',
        borderColor: '#059669'
      };
    case '2-days':
      return {
        subject: '⚠️ Bill Due Soon',
        header: 'Bill Due in 2 Days',
        message: 'Your bill is due in 2 days. Don\'t forget to make your payment!',
        color: '#f59e0b',
        borderColor: '#d97706'
      };
    case 'due-today':
      return {
        subject: '🔔 Bill Due Today',
        header: 'Bill Due Today',
        message: 'Your bill is due today. Make sure to pay it to avoid late fees.',
        color: '#ef4444',
        borderColor: '#dc2626'
      };
    case 'overdue':
      return {
        subject: '🚨 Overdue Bill',
        header: 'Bill Overdue',
        message: 'Your bill is now overdue. Please pay as soon as possible to avoid additional fees.',
        color: '#dc2626',
        borderColor: '#b91c1c'
      };
  }
}

export async function sendBillReminderEmail(
  to: string, 
  bill: any, 
  reminderType: ReminderType = '2-days'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = getCleanApiKey();
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      console.log(`Bill reminder (${reminderType}) would be sent to: ${to} for bill: ${bill.name}`);
      return { success: true, messageId: 'demo-reminder' };
    }

    const mailerSend = getMailerSendClient();
    const config = getReminderConfig(reminderType);
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];
    const dueDate = new Date(bill.dueDate).toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`${config.subject}: ${bill.name}`)
      .setHtml(`
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
    console.log(`✅ ${reminderType} reminder sent for ${bill.name} to ${to}`);
    return { success: true, messageId: response.body?.message_id };

  } catch (error: any) {
    console.error('Bill reminder failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(
  to: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = getCleanApiKey();
    console.log(`🔍 MailerSend API key check: exists=${!!apiKey}, starts_with_mlsn=${apiKey?.startsWith('mlsn.')}, length=${apiKey?.length || 0}`);
    
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      console.log(`Welcome email would be sent to: ${to}`);
      return { success: true, messageId: 'demo-welcome' };
    }

    const mailerSend = getMailerSendClient();
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to, userName)];
    const displayName = userName || 'there';

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Welcome to MyBillPort! 🎉')
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px; font-weight: bold;">M</span>
            </div>
            <h1 style="margin: 0; font-size: 28px;">Welcome to MyBillPort!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your personal bill management assistant</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${displayName}! 👋</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for joining MyBillPort! We're excited to help you take control of your bills and never miss a payment again.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 15px 0; color: #065f46;">Here's what you can do:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li style="margin-bottom: 8px;">📋 Track all your recurring bills in one place</li>
                <li style="margin-bottom: 8px;">🔔 Get email reminders before bills are due</li>
                <li style="margin-bottom: 8px;">📊 See your bill overview at a glance</li>
                <li style="margin-bottom: 8px;">✅ Mark bills as paid to stay organized</li>
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
      `)
      .setText(`
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
    console.log(`✅ Welcome email sent to ${to}`);
    return { success: true, messageId: response.body?.message_id };

  } catch (error: any) {
    console.error('Welcome email failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentRequestEmail({
  to,
  amount,
  note,
  fromUser
}: {
  to: string;
  amount: number;
  note: string;
  fromUser: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = getCleanApiKey();
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      console.log(`Payment request would be sent to: ${to} from: ${fromUser}`);
      console.log(`Amount: $${amount.toFixed(2)} CAD - ${note}`);
      return { success: true, messageId: 'demo-payment-request' };
    }

    const mailerSend = getMailerSendClient();
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`💰 Payment Request: $${amount.toFixed(2)} CAD`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">💰 Payment Request</h1>
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
      `)
      .setText(`
        Payment Request from ${fromUser}
        
        Amount: $${amount.toFixed(2)} CAD
        Message: ${note}
        
        You've received a payment request through MyBillPort. Please review the details and contact the sender if needed.
        
        Visit https://mybillport.com to view the request.
        
        This payment request was sent through MyBillPort.
      `);

    const response = await mailerSend.email.send(emailParams);
    return { success: true, messageId: response.body?.message_id };

  } catch (error: any) {
    console.error('Payment request email failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send payment request email'
    };
  }
}